require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const breederRoutes = require('./routes/breeders')
const liveRoutes = require('./routes/live')

// Create an express app
const app = express();

// middleware
app.use(express.json())

// Serve images from public/uploads directory
app.use('/api/images', express.static(path.join(__dirname, 'public')))

app.use((req, _res, next) => {
  console.log(req.path, req.method)
  next()
})

// routes
app.use('/api/breeders', breederRoutes)
app.use('/api/live', liveRoutes)

// connect to mongodb
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    // listen
    app.listen(process.env.PORT, () => {
      console.log('Database connected, listening on port', process.env.PORT)
    })
  })
  .catch((error) => {
    console.log(error)
  })
