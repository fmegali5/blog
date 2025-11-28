import { useState, useEffect } from 'react'
import api from '../utils/api'
import PostCard from '../components/PostCard'
import SearchBar from '../components/SearchBar'
import Pagination from '../components/Pagination'
import Spinner from '../components/Spinner'

const Home = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchPosts = async (page = 1, search = '') => {
    setLoading(true)
    try {
      const response = await api.get('/posts', {
        params: { page, limit: 9, search }
      })
      setPosts(response.data.posts)
      setTotalPages(response.data.totalPages)
      setCurrentPage(response.data.currentPage)
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts(currentPage, searchTerm)
  }, [currentPage])

  const handleSearch = (term) => {
    setSearchTerm(term)
    setCurrentPage(1)
    fetchPosts(1, term)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome to Blog
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Discover amazing stories, share your thoughts, and connect with writers from around the world.
        </p>
      </div>

      {/* Search Bar */}
      <SearchBar onSearch={handleSearch} initialValue={searchTerm} />

      {/* Posts Grid */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <Spinner size="lg" />
        </div>
      ) : posts.length > 0 ? (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        <div className="text-center py-16">
          <svg 
            className="w-16 h-16 text-gray-400 mx-auto mb-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" 
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No posts found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try a different search term' : 'Be the first to create a post!'}
          </p>
        </div>
      )}
    </div>
  )
}

export default Home
