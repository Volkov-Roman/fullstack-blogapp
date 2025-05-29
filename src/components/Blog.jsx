import { useState } from 'react'

const Blog = ({ blog, likeBlog, user, deleteBlog }) => {
  const [visible, setVisible] = useState(false)

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  return (
    <div className='blog' style={blogStyle}>
      <div>
        {blog.title} {blog.author}
        <button onClick={() => setVisible(!visible)}>
          {visible ? 'hide' : 'view'}
        </button>
      </div>

      {visible && (
        <div>
          <div>{blog.url}</div>
          <div>likes: {blog.likes} <button onClick={() => likeBlog(blog)}>like</button></div>
          <div>{blog.user?.name}</div>
          <div>{user && blog.user?.username === user.username && (
            <button onClick={() => deleteBlog(blog)}>remove</button>
          )}</div>
        </div>
      )}
    </div>
  )
}

export default Blog
