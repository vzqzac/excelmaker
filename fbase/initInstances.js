const admin = require('firebase-admin')

/*
 * Here comes the json file with admin privs
 */
// var serviceAccount = require("path/to/serviceAccountKey.json")

let inleteApp
let ezTableApp

module.exports = {
  initApps: function () {
    inleteApp = admin.initializeApp(/*inleteConfig*/, 'inlete')
    ezTableApp = admin.initializeApp(/*ez-tableConfig*/, 'ez-table')
  },
  inlete: inleteApp.database(),
  ezTable: ezTableApp.database()
}
