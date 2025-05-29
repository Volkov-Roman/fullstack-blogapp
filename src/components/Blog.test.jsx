import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'

test('renders blog title and author, but not url or likes by default', () => {
  const blog = {
    title: 'Testing React components',
    author: 'Roma',
    url: 'http://example.com',
    likes: 420
  }

  render(<Blog blog={blog} />)

  expect(screen.getByText(/Testing React components/)).toBeDefined()
  expect(screen.getByText(/Roma/)).toBeDefined()

  const urlElement = screen.queryByText('http://example.com')
  const likesElement = screen.queryByText('likes')

  expect(urlElement).toBeNull()
  expect(likesElement).toBeNull()
})

test('shows blog URL and likes when details button is clicked', async () => {
  const blog = {
    title: 'Testing React components',
    author: 'Roma',
    url: 'http://example.com',
    likes: 420
  }

  render(<Blog blog={blog} />)

  const user = userEvent.setup()
  const button = screen.getByText('view')
  await user.click(button)

  expect(screen.getByText('http://example.com')).toBeDefined()
  expect(screen.getByText(/420/)).toBeDefined()
})

test('clicking the like button twice calls event handler twice', async () => {
  const blog = {
    title: 'Testing React components',
    author: 'Roma',
    url: 'http://example.com',
    likes: 420
  }

  const mockHandler = vi.fn()

  render(<Blog blog={blog} likeBlog={mockHandler} />)

  const user = userEvent.setup()

  const viewButton = screen.getByText('view')
  await user.click(viewButton)

  const likeButton = screen.getByText('like')
  await user.click(likeButton)
  await user.click(likeButton)

  expect(mockHandler.mock.calls).toHaveLength(2)
})
