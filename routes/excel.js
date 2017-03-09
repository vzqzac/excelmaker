const router = require('express').Router({ mergeParams: true })

// Handle route to convert firebase data to CSV table object
router.route('/convert-table/:appName/:businessID/:tableName')
  .get(excelMakerController.downloadTable)
  .post(excelMakerController.emailTable)
  .all(function (req, res) {
    res.send({no: 'no'})
  })

module.exports = router
