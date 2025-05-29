const _ = require('lodash')

const dummy = (blogs) => 1

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) return null

  const topBlog = blogs.reduce((max, blog) => (blog.likes > max.likes ? blog : max), blogs[0])

  return {
    title: topBlog.title,
    author: topBlog.author,
    likes: topBlog.likes
  }
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) return null

  const authorCounts = _.countBy(blogs, 'author')
  const topAuthor = _.maxBy(Object.keys(authorCounts), (author) => authorCounts[author])

  return {
    author: topAuthor,
    blogs: authorCounts[topAuthor]
  }
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) return null

  const authorLikes = _(blogs)
    .groupBy('author')
    .map((blogs, author) => ({
      author,
      likes: _.sumBy(blogs, 'likes')
    }))
    .value()

  return _.maxBy(authorLikes, 'likes')
}

module.exports = { dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes }
