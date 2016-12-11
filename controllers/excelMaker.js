/*
 * Main controller
 * function actionHandler() <- TODO
 */

const json2xls = require('json2xls')
const fbase = require('../fbase/handler')
const columnTitle = require('../helpers/column-titles.json')

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
      res.xls(appName + Date.now() + '.xlsx', jsonArr)
    })
  }
}
