'use strict'

const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const firebase = require('./fbase/handler')
const routes = require('./routes/index')

let port = process.env.PORT || 3000

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

firebase.initApps()

routes(app)

app.listen(port, function (error) {
  if (error) throw new Error(error)
})
