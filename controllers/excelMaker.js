/*
 * Main controller
 * function actionHandler() <- TODO
 */

const fbase = require('../fbase/handler')
const columnTitles = require('../helpers/column-titles.json')
const json2csv = require('json2csv')
const path = require('path')
const fs = require('fs')
const tablesPath = path.join(__dirname, '../tables')
const http = require('http')
const querystring = require('querystring')
const AWS = require('aws-sdk')
const pdfMakerController = require('../controllers/pdfmaker')
// const _ = require('lodash')

let newTablePath

module.exports = {
  // NOTE: this could me moved into a 'UTIL' module
  getColumns: function (req, res) {
    let appName = req.params.appName
    let businessID = req.params.businessID
    let tableName = req.params.tableName
    console.log(appName, businessID, tableName);
    let db = fbase[appName]()
    return fbase.fetchData(db, ['businesses/', businessID, '/default/entities/', tableName, '/columns/', (req.entity || '')].join(''))
  },

  sortData: function (data) {
    // Sort by column order and map it to get only each column key
    return data
      .sort((a, b) => {
        if (a.order > b.order) return 1
        if (a.order < b.order) return -1
        return 0
      })
      .map(e => e.key)
  },

  // NOTE: this could me moved into a 'UTIL' module
  getRows: function (req, res) {
    let appName = req.params.appName
    let businessID = req.params.businessID
    let tableName = req.params.tableName
    let db = fbase[appName]()
    return fbase.fetchData(db, ['businesses/', businessID, '/information/', tableName, '/'].join(''))
  },

  // Filter by column type and map it to get only each column key
  filterEntities: function (data) {
    return data
      .filter(e => e.type === 'entity')
      .map(e => e.key)
  },

  // Handle raw data object from firebase to convert to CSV
  convertTable: function (req, res, data) {
    // Converts data object (row object) to an array and maps it to get only the inner info of the row
    const arr = Object.keys(data).map(k => data[k])

    // Get the proper title of each column instead of its key
    const beauty = req.sortedColumns.map(c => columnTitles[c])

    return json2csv({ data: arr, fields: req.sortedColumns, fieldNames: beauty })
  },

  emailTable: function (request, response) {
    // AWS.config.loadFromPath('./aws/config.json')

    let s3 = new AWS.S3()
    let params = {
      Bucket: 'ez-table',
      Key: request.params.tableName,
      Body: req.query.doctype === 'excel' ? request.xlsTable : fs.readFileSync(path.join(__dirname, '../tables/tabla.pdf')),
      ContentType: req.query.doctype === 'excel' ? 'csv' : 'pdf',
      ACL: 'public-read'
    }

    // Upload file to amazon S3
    s3.putObject(params, function (err, data) {
      if (err) return console.log('error aws', err)
      console.log('data aws', data)
    })

    let postData = querystring.stringify({
      'email': request.query.email,
      'tname': request.params.tableName,
      'ext': req.query.doctype === 'excel' ? 'csv' : 'pdf'
    })
    let options = {
      hostname: 'ondecode-mailer.herokuapp.com',
      path: '/ez-table/share-table',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    }
    let req = http.request(options, res => {
      response.sendStatus(res.statusCode)
      res.setEncoding('utf8')
    })

    req.on('error', e => console.log('error', e.message))
    req.write(postData)
    req.end()
  },

  downloadTable: function (req, res) {
    const resultTable = req.xlsTable

    newTablePath = path.join(tablesPath, req.params.tableName + '.csv')

    if (!fs.existsSync(tablesPath)) {
      fs.mkdirSync(tablesPath)
    }
    if (req.query.doctype === 'excel')
      fs.writeFileSync(newTablePath, resultTable)
    else{
      console.log("working");
      pdfMakerController.createHtmlTemplate(resultTable);
      console.log("working1");
      newTablePath = pdfMakerController.generatePdf();
      console.log("working3");
    }
    res.download(newTablePath)
  }
}
