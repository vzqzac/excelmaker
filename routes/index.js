const express = require('express')
const router = express.Router()
const excelRouter = require('./excel')
const excelMakerController = require('../controllers/excelMaker')

module.exports = function (app) {
  // Middleware for CORS
  router.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    next()
  })

  // Prepare data
  router.use('*', function (req, res, next) {
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

  router.use('/excel', excelRouter)
  // router.use('/pdf', pdfRouter) <= tu router

  router.all('*', function (req, res) {
    res.status(400).send('Bad reqest')
  })

  app.use('/', router)
}
