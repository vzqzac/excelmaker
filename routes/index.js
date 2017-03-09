const express = require('express')
const router = express.Router()
const excelMakerController = require('../controllers/excelMaker')

module.exports = function (app) {
  router.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    next()
  })

  router.route('/convert-table/:appName/:businessID/:tableName')
    .all(function (req, res, next) {
      excelMakerController.getColumns(req, res)
        .then(columns => {
          req.sortedColumns = excelMakerController.sortData(columns)
          req.entities = excelMakerController.filterEntities(columns)
          return excelMakerController.getRows(req, res)
        })
        .then(rows => {
          req.xlsTable = excelMakerController.convertTable(req, res, rows)
          next()
        })
        .catch(error => res.status(500).send(error))
    })
    .get(excelMakerController.downloadTable)
    .post(excelMakerController.emailTable)
    .all(function (req, res) {
      res.send({no: 'no'})
    })

  app.use('/', router)
}
