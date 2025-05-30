import { useState } from 'react'

const BlogForm = ({ createBlog }) => {
  const [newTitle, setNewTitle] = useState('')
  const [newAuthor, setNewAuthor] = useState('')
  const [newUrl, setNewUrl] = useState('')

  const addBlog = async (event) => {
    event.preventDefault()

    createBlog({
      title: newTitle,
      author: newAuthor,
      url: newUrl
    })

    setNewTitle('')
    setNewAuthor('')
    setNewUrl('')
  }

  return (
    <div>
      <h2>Create a new blog</h2>

      <form onSubmit={addBlog}>
        <div>
          title:
          <input
            value={newTitle}
            onChange={event => setNewTitle(event.target.value)}
            placeholder="Title"
          />
        </div>
        <div>
          author:
          <input
            value={newAuthor}
            onChange={event => setNewAuthor(event.target.value)}
            placeholder="Author"
          />
        </div>
        <div>
          url:
          <input
            value={newUrl}
            onChange={event => setNewUrl(event.target.value)}
            placeholder="URL"
          />
        </div>
        <button type="submit">save</button>
      </form>
    </div>
  )
}

export default BlogForm
