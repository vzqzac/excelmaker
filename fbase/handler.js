const admin = require('firebase-admin')
const ezTableConfg = require('./config/ez-table.json') // JSON config for ezTable firebase data

// let inleteApp
let ezTableApp

module.exports = {
  initApps: function () {
    // inleteApp = admin.initializeApp(inleteConfig, 'inlete')
    ezTableApp = admin.initializeApp({
      credential: admin.credential.cert(ezTableConfg),
      databaseURL: 'https://ez-table-80d9c.firebaseio.com'
    }, 'ez-table')
  },
  // inlete: () => inleteApp.database().ref(),
  ezTable: () => ezTableApp.database().ref(),
  fetchData: (db, childPath) => db.child(childPath).once('value').then((childObj) => childObj.val())
}
