const admin = require('firebase-admin')
const ezTableConfg = require('./config/ez-table.json')

/*
 * Here comes the json file with admin privs
 */
// var serviceAccount = require("path/to/serviceAccountKey.json")

// let inleteApp
let ezTableApp

module.exports = {
  initApps: function () {
    // inleteApp = admin.initializeApp(/*inleteConfig*/, 'inlete')
    ezTableApp = admin.initializeApp({
      credential: admin.credential.cert(ezTableConfg),
      databaseURL: 'https://ez-table-80d9c.firebaseio.com'
    }, 'ez-table')
  },
  // inlete: inleteApp.database(),
  ezTable: function () {
    return ezTableApp.database()
  }
}
