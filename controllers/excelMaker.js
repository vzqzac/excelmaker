/*
 * Main controller
 * function actionHandler() <- TODO
 */

const fbase = require('../fbase/handler')

module.exports = {
  dbHandler: function (req, res) {
    let appName = req.params.appName
    let businessID = req.params.businessID
    let tableName = req.params.tableName
    let db = fbase[appName]()
    db.ref().child('businesses/' + businessID + '/information/' + tableName).once('value').then(function (obj) {
      res.send(obj.val())
    })
  }
}
