require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const breederRoutes = require('./routes/breeders')
const dogRoutes = require('./routes/dogs')

// Create an express app
const app = express();

// middleware
app.use(express.json())

// Configure static file serving for all uploads
app.use('/api/images/uploads', express.static(path.join(__dirname, 'public/uploads')))
// Keep original upload paths for backward compatibility
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')))

app.use((req, res, next) => {
  console.log(req.path, req.method)
  next()
})

// routes
app.use('/api/breeders', breederRoutes)
app.use('/api/dogs', dogRoutes)

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