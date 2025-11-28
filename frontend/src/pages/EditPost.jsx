import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import api from '../utils/api'
import toast from 'react-hot-toast'
import Spinner from '../components/Spinner'
import { useAuth } from '../context/AuthContext'

const EditPost = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    tags: '',
    coverImage: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean']
    ],
  }

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await api.get(`/posts/${id}`)
        const post = response.data
        
        // Check if user is the author
        if (post.author._id !== user?.id) {
          toast.error('You are not authorized to edit this post')
          navigate('/')
          return
        }

        setFormData({
          title: post.title,
          content: post.content,
          excerpt: post.excerpt || '',
          tags: post.tags?.join(', ') || '',
          coverImage: post.coverImage || ''
        })
      } catch (error) {
        console.error('Error fetching post:', error)
        toast.error('Post not found')
        navigate('/')
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [id, user, navigate])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleContentChange = (content) => {
    setFormData({
      ...formData,
      content
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error('Title is required')
      return
    }
    
    if (!formData.content.trim()) {
      toast.error('Content is required')
      return
    }

    setSaving(true)

    try {
      const postData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      }

      await api.put(`/posts/${id}`, postData)
      toast.success('Post updated successfully!')
      navigate(`/post/${id}`)
    } catch (error) {
      console.error('Error updating post:', error)
      toast.error(error.response?.data?.message || 'Failed to update post')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Edit Post</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label 
              htmlFor="title" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              maxLength={200}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter your post title"
            />
          </div>

          {/* Cover Image URL */}
          <div>
            <label 
              htmlFor="coverImage" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Cover Image URL (optional)
            </label>
            <input
              type="url"
              id="coverImage"
              name="coverImage"
              value={formData.coverImage}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Excerpt */}
          <div>
            <label 
              htmlFor="excerpt" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Excerpt (optional)
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              rows={2}
              maxLength={500}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              placeholder="Brief description of your post"
            />
          </div>

          {/* Tags */}
          <div>
            <label 
              htmlFor="tags" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Tags (comma separated)
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="react, javascript, web development"
            />
          </div>

          {/* Content - Rich Text Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <ReactQuill
              theme="snow"
              value={formData.content}
              onChange={handleContentChange}
              modules={modules}
              className="bg-white rounded-lg"
              placeholder="Write your post content here..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {saving ? <Spinner size="sm" /> : 'Update Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditPost
