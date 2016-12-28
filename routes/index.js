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
      excelMakerController.dataHandler(req, res).dbData.then(data => {
        req.xlsTable = excelMakerController.convertTable(data)
        next()
      })
      .catch(error => res.status(204).send(error.message))
    })
    .get(function (req, res) {
      excelMakerController.downloadTable(req, res)
    })
    .post(function (req, res) {
      excelMakerController.emailTable(req, res)
    })

  app.use('/', router)
}
