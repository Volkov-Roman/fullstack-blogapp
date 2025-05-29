import { render, screen } from '@testing-library/react'
import BlogForm from './BlogForm'
import userEvent from '@testing-library/user-event'

test('<BlogForm /> calls createBlog with correct data when form is submitted', async () => {
  const createBlog = vi.fn()
  const user = userEvent.setup()

  render(<BlogForm createBlog={createBlog} />)

  const titleInput = screen.getByPlaceholderText('Title')
  const authorInput = screen.getByPlaceholderText('Author')
  const urlInput = screen.getByPlaceholderText('URL')
  const saveButton = screen.getByText('save')

  await user.type(titleInput, 'React test')
  await user.type(authorInput, 'Author')
  await user.type(urlInput, 'https://example.com')
  await user.click(saveButton)

  expect(createBlog.mock.calls).toHaveLength(1)
  expect(createBlog).toHaveBeenCalledWith({
    title: 'React test',
    author: 'Author',
    url: 'https://example.com'
  })
})
