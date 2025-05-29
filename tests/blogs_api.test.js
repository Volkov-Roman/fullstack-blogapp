const { test, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const assert = require('node:assert')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')

const api = supertest(app)

const initialBlogs = [
  {
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
  },
  {
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
  }
]

let authToken = ''

beforeEach(async () => {
  await User.deleteMany({})
  await Blog.deleteMany({})

  const newUser = {
    username: 'testuser',
    name: 'Test User',
    password: 'password123'
  }

  await api.post('/api/users').send(newUser)

  const loginResponse = await api
    .post('/api/login')
    .send({ username: 'testuser', password: 'password123' })

  authToken = loginResponse.body.token

  await Blog.insertMany(initialBlogs.map(b => ({ ...b, user: loginResponse.body.id })))
})

test('blogs are returned as JSON and the count is correct', async () => {
  const response = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.length, initialBlogs.length)
})

test('blog posts have id field instead of _id', async () => {
  const response = await api.get('/api/blogs')

  response.body.forEach(blog => {
    assert.ok(blog.id, 'Expected blog to have an "id" field')
    assert.strictEqual(blog._id, undefined, 'Expected blog._id to be undefined')
  })
})

test('successfully creates a new blog post', async () => {
  const newBlog = {
    title: 'New Blog Post',
    author: 'John Doe',
    url: 'http://example.com/new-blog',
    likes: 15
  }

  await api.post('/api/blogs')
    .set('Authorization', `Bearer ${authToken}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  // Fetch all blogs from DB
  const response = await api.get('/api/blogs')
  const blogs = response.body

  // Check that number of blogs increased by 1
  assert.strictEqual(blogs.length, initialBlogs.length + 1)

  // Verify that the saved blog exists in the database
  const titles = blogs.map(b => b.title)
  assert.ok(titles.includes(newBlog.title), 'Expected new blog title to be in database')
})

test('if likes property is missing, it defaults to 0', async () => {
  const newBlog = {
    title: 'Blog Without Likes',
    author: 'Anonymous',
    url: 'http://example.com/no-likes'
  }

  const response = await api.post('/api/blogs')
    .set('Authorization', `Bearer ${authToken}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.likes, 0, 'Expected default likes to be 0')
})

test('if title is missing, respond with 400 Bad Request', async () => {
  const newBlog = {
    author: 'Anonymous',
    url: 'http://example.com/missing-title',
    likes: 4
  }

  await api.post('/api/blogs')
    .set('Authorization', `Bearer ${authToken}`)
    .send(newBlog)
    .expect(400)
})

test('if url is missing, respond with 400 Bad Request', async () => {
  const newBlog = {
    title: 'Blog Without URL',
    author: 'Anonymous',
    likes: 10
  }

  await api.post('/api/blogs')
    .set('Authorization', `Bearer ${authToken}`)
    .send(newBlog)
    .expect(400)
})

test('deleting an existing blog returns 204 No Content', async () => {
  const responseBefore = await api.get('/api/blogs')
  const blogToDelete = responseBefore.body[0]

  await api.delete(`/api/blogs/${blogToDelete.id}`)
    .set('Authorization', `Bearer ${authToken}`)
    .expect(204)

  const responseAfter = await api.get('/api/blogs')
  const blogIds = responseAfter.body.map(blog => blog.id)

  assert.ok(!blogIds.includes(blogToDelete.id), 'Deleted blog should not exist in database')
})

test('deleting a non-existing blog returns 404 Not Found', async () => {
  const nonExistingId = new mongoose.Types.ObjectId().toString()

  await api.delete(`/api/blogs/${nonExistingId}`)
    .set('Authorization', `Bearer ${authToken}`)
    .expect(404)
})

test('successfully updates an existing blog', async () => {
  const responseBefore = await api.get('/api/blogs')
  const blogToUpdate = responseBefore.body[0]

  const updatedData = {
    title: 'Updated Blog Title',
    author: 'Updated Author',
    url: 'http://example.com/updated',
    likes: 100
  }

  const response = await api.put(`/api/blogs/${blogToUpdate.id}`)
    .send(updatedData)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  // Verify response data matches updates
  assert.strictEqual(response.body.title, updatedData.title)
  assert.strictEqual(response.body.author, updatedData.author)
  assert.strictEqual(response.body.url, updatedData.url)
  assert.strictEqual(response.body.likes, updatedData.likes)

  // Verify changes in the database
  const responseAfter = await api.get(`/api/blogs/${blogToUpdate.id}`)
  assert.strictEqual(responseAfter.body.title, updatedData.title)
})

test('adding a blog fails with 401 Unauthorized if token is not provided', async () => {
  const newBlog = {
    title: 'Unauthorized Blog',
    author: 'No Token',
    url: 'http://example.com/unauthorized',
    likes: 1
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(401)
})


after(async () => {
  await mongoose.connection.close()
})
