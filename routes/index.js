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
    .post(function (req, res) {
      excelMakerController.dbHandler(req, res)
    })

  app.use('/', router)
}
