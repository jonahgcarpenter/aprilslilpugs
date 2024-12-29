require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const breederRoutes = require('./routes/breeders')

// Create an express app
const app = express();

// middleware
app.use(express.json())

app.use((req, res, next) => {
  console.log(req.path, req.method)
  next()
})

// routes
app.use('/api/breeders', breederRoutes)


// connect to mongodb
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    // listen
    app .listen(process.env.PORT, () => {
      console.log('Database connected, listening on port', process.env.PORT)
    })
  })
  .catch((error) => {
    console.log(error)
  })