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
          req.sortedColumns = excelMakerController.sortData(columns)
          // Filter entities to handle before convert
          req.entities = excelMakerController.filterEntities(columns)
          return excelMakerController.getRows(req, res)
        })
        .then(rows => {
          // Create CSV table
          req.xlsTable = excelMakerController.convertTable(req, res, rows)
          next()
        })
        .catch(error => res.status(500).send(error))
    })
    .get(function (req, res) {
      switch (req.query.doctype) {
        case 'excel':
          excelMakerController.downloadTable(req, res)
          break
        case 'pdf':
          // pdfController.downloadPDF(req, res) o algo asi
          break
        default:
          res.status(400).send('Bad request')
      }
    })
    .post(excelMakerController.emailTable)
    .all(function (req, res) {
      res.send({no: 'no'})
    })

  app.use('/', router)
}
