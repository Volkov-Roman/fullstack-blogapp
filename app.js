const express = require('express')
require('express-async-errors')
const cors = require('cors')
const mongoose = require('mongoose')
const config = require('./utils/config')
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')

const app = express()

mongoose.set('strictQuery', false)

logger.info('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI)
  .then(() => logger.info('Connected to MongoDB'))
  .catch(error => logger.error('Error connecting to MongoDB:', error.message))

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
app.use(middleware.tokenExtractor)
app.use(middleware.requestLogger)

app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/testing')
  app.use('/api/testing', testingRouter)
}

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
