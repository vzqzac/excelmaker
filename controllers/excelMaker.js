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

let newTablePath

module.exports = {
  dataHandler: function (req, res) {
    let appName = req.params.appName
    let businessID = req.params.businessID
    let tableName = req.params.tableName
    let db = fbase[appName]()
    let fetchedData = fbase.fetchData(db, 'businesses/' + businessID + '/information/' + tableName).then(data => data)
    return {
      dbData: fetchedData,
      tableName: tableName
    }
  },
  convertTable: function (data) {
    let jsonArr = []
    for (let key in data) {
      if (data.hasOwnProperty(key)) {
        let dataChild = data[key]
        let prettyTitles = {}
        for (let childKey in dataChild) {
          if (childKey !== 'created_at') {
            if (typeof dataChild[childKey] === 'object') {
              for (let innerChKey in dataChild[childKey]) {
                if (childKey !== 'created_at') {
                  prettyTitles[columnTitles[childKey] + ' ' + columnTitles[innerChKey]] = dataChild[childKey][innerChKey]
                }
              }
            } else {
              prettyTitles[columnTitles[childKey]] = dataChild[childKey]
            }
          }
        }
        jsonArr.push(prettyTitles)
      }
    }
    return json2csv({data: jsonArr})
  },
  emailTable: function (request, response) {
    AWS.config.loadFromPath('./aws/config.json')

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
    console.log('before call to other api')
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
