const { test, beforeEach, describe, after } = require('node:test')
const mongoose = require('mongoose')
const assert = require('node:assert')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const bcrypt = require('bcrypt')
const User = require('../models/user')

const api = supertest(app)

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('medved', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test.only('creation fails if password is missing', async () => {
    const newUser = {
      username: 'testuser',
      name: 'Test User',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    assert(result.body.error.includes('Username and password are required'))
  })

  test('creation fails if password is too short', async () => {
    const newUser = {
      username: 'testuser',
      name: 'Test User',
      password: '12'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    assert(result.body.error.includes('Password must be at least 3 characters long'))
  })

  test('creation fails if username is too short', async () => {
    const newUser = {
      username: 'ab',
      name: 'Test User',
      password: 'password123'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    assert(result.body.error.includes('Username must be at least 3 characters long'))
  })
})

after(async () => {
  await mongoose.connection.close()
})
