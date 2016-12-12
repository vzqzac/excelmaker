/*
 * Main controller
 * function actionHandler() <- TODO
 */

const fbase = require('../fbase/handler')
const columnTitle = require('../helpers/column-titles.json')
const json2csv = require('json2csv')
const path = require('path')
const fs = require('fs')
const tablesPath = path.join(__dirname, '../tables')

module.exports = {
  dbHandler: function (req, res) {
    let appName = req.params.appName
    let businessID = req.params.businessID
    let tableName = req.params.tableName
    let db = fbase[appName]()
    db.ref().child('businesses/' + businessID + '/information/' + tableName).once('value').then(function (tableObj) {
      let tableInfo = tableObj.val()
      let jsonArr = []
      for (let key in tableInfo) {
        if (tableInfo.hasOwnProperty(key)) {
          let child = tableInfo[key]
          let prettyTitles = {}
          for (let childKey in child) {
            if (childKey !== 'created_at') {
              prettyTitles[columnTitle[childKey]] = child[childKey]
            }
          }
          jsonArr.push(prettyTitles)
        }
      }

      let result = json2csv({data: jsonArr})
      let newTablePath = path.join(tablesPath, tableName + '.csv')
      if (!fs.existsSync(tablesPath)) {
        fs.mkdirSync(tablesPath)
      }
      fs.writeFileSync(newTablePath, result)
      res.download(newTablePath)

      // res.xls(tableName + '.xlsx', jsonArr)
    })
  }
}
