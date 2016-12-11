/*
 * Main controller
 * function actionHandler() <- TODO
 */

const json2xls = require('json2xls')
const fbase = require('../fbase/handler')

module.exports = {
  dbHandler: function (req, res) {
    let appName = req.params.appName
    let businessID = req.params.businessID
    let tableName = req.params.tableName
    let db = fbase[appName]()
    db.ref().child('businesses/' + businessID + '/information/' + tableName).once('value').then(function (tableObj) {
      let tableInfo = tableObj.val()
      let jsonArr = []
      for (var key in tableInfo) {
        if (tableInfo.hasOwnProperty(key)) {
          jsonArr.push(tableInfo[key])
        }
      }
      res.xls('test.xlsx', jsonArr)
    })
  }
}
