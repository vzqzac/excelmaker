const express = require('express')
const router = express.Router()
const excelMakerController = require('../controllers/excelMaker')

module.exports = function (app) {

  // Middleware for CORS
  router.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    next()
  })

  // Handle route to convert firebase data to CSV table object
  router.route('/convert-table/:appName/:businessID/:tableName')
    // Prepare data
    .all(function (req, res, next) {
      excelMakerController.getColumns(req, res)
        .then(columns => {
          // Sort columns as in DB
          let cols = excelMakerController.sortData(columns)
          //return res.send({cols})
          req.sortedColumns = cols.keys
          req.columnTitles = cols.titles
          // Filter entities to handle before convert
          // req.entities = excelMakerController.filterEntities(columns)
          return excelMakerController.getRows(req, res)
        })
        .then(rows => {
          // Create CSV table
          req.xlsTable = excelMakerController.convertTable(req, res, rows)
          next()
        })
        .catch(error => {
          console.log('error', error);
          res.status(500).send(error)
        })
    })
    .get(function (req, res) {
          excelMakerController.downloadTable(req, res)
      }
    )
    .post(excelMakerController.emailTable)
    .all(function (req, res) {
      res.send({no: 'no'})
    })

  app.use('/', router)
}
