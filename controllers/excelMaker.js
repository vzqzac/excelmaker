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
// const _ = require('lodash')

let newTablePath

module.exports = {
  getColumns: function (req, res) {
    let appName = req.params.appName
    let businessID = req.params.businessID
    let tableName = req.params.tableName
    let db = fbase[appName]()
    return fbase.fetchData(db, ['businesses/', businessID, '/default/entities/', tableName, '/columns/', (req.entity || '')].join(''))
  },

  sortData: function (data) {
    return data
      .sort((a, b) => {
        if (a.order > b.order) return 1
        if (a.order < b.order) return -1
        return 0
      })
      .map(e => e.key)
  },

  getRows: function (req, res) {
    let appName = req.params.appName
    let businessID = req.params.businessID
    let tableName = req.params.tableName
    let db = fbase[appName]()
    return fbase.fetchData(db, ['businesses/', businessID, '/information/', tableName, '/'].join(''))
  },

  filterEntities: function (data) {
    return data
      .filter(e => e.type === 'entity')
      .map(e => e.key)
  },

  convertTable: function (req, res, data) {
    const arr = Object.keys(data).map(k => data[k])
    const beauty = req.sortedColumns.map(c => columnTitles[c])

    return json2csv({data: arr, fields: req.sortedColumns, fieldNames: beauty})
  },

  emailTable: function (request, response) {
    // AWS.config.loadFromPath('./aws/config.json')

    let s3 = new AWS.S3()
    let params = {
      Bucket: 'ez-table',
      Key: request.params.tableName,
      Body: request.xlsTable,
      ContentType: 'csv',
      ACL: 'public-read'
    }

    s3.putObject(params, function (err, data) {
      if (err) return console.log('error aws', err)
      console.log('data aws', data)
    })

    let postData = querystring.stringify({
      'email': request.query.email,
      'tname': request.params.tableName,
      'ext': 'csv'
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
    fs.writeFileSync(newTablePath, resultTable)
    res.download(newTablePath)
  }
}
