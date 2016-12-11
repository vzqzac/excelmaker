'use strict'

const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const firebase = require('./fbase/handler')
const routes = require('./routes/index')
const json2xls = require('json2xls')

let port = process.env.PORT || 3000

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use(json2xls.middleware)

firebase.initApps()

routes(app)

app.listen(port, function (error) {
  if (error) throw new Error(error)
})
