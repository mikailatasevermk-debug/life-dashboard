"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Plus, Link as LinkIcon, ExternalLink, Video, FileText, 
  Users, Wrench, Star, Trash2, Edit3, Copy, Check,
  Youtube, Globe, BookOpen, Target
} from "lucide-react"

interface SportLink {
  id: string
  sportId: string
  title: string
  url: string
  description?: string
  type: 'video' | 'article' | 'tool' | 'community' | 'course' | 'other'
  category?: 'technique' | 'training' | 'nutrition' | 'equipment' | 'motivation' | 'general'
  isFavorite: boolean
  tags: string[]
  addedAt: Date
  clickCount: number
}

interface ResourceLinksProps {
  sportId: string
  sportName: string
}

export function ResourceLinks({ sportId, sportName }: ResourceLinksProps) {
  const [links, setLinks] = useState<SportLink[]>([])
  const [showAddLink, setShowAddLink] = useState(false)
  const [filterType, setFilterType] = useState<'all' | SportLink['type']>('all')
  const [filterCategory, setFilterCategory] = useState<'all' | SportLink['category']>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const linkTypes = [
    { id: 'video', name: 'Videos', icon: Video, color: '#EF4444' },
    { id: 'article', name: 'Articles', icon: FileText, color: '#3B82F6' },
    { id: 'tool', name: 'Tools', icon: Wrench, color: '#10B981' },
    { id: 'community', name: 'Communities', icon: Users, color: '#8B5CF6' },
    { id: 'course', name: 'Courses', icon: BookOpen, color: '#F59E0B' },
    { id: 'other', name: 'Other', icon: Globe, color: '#6B7280' }
  ]

  const categories = [
    { id: 'technique', name: 'Technique', emoji: '🎯' },
    { id: 'training', name: 'Training', emoji: '💪' },
    { id: 'nutrition', name: 'Nutrition', emoji: '🥗' },
    { id: 'equipment', name: 'Equipment', emoji: '🛠️' },
    { id: 'motivation', name: 'Motivation', emoji: '🔥' },
    { id: 'general', name: 'General', emoji: '📚' }
  ]

  // Load links from localStorage
  useEffect(() => {
    const savedLinks = localStorage.getItem(`sport_links_${sportId}`)
    if (savedLinks) {
      setLinks(JSON.parse(savedLinks).map((link: any) => ({
        ...link,
        addedAt: new Date(link.addedAt)
      })))
    }
  }, [sportId])

  // Save links to localStorage
  useEffect(() => {
    localStorage.setItem(`sport_links_${sportId}`, JSON.stringify(links))
  }, [links, sportId])

  const addLink = (linkData: Omit<SportLink, 'id' | 'sportId' | 'addedAt' | 'clickCount' | 'isFavorite'>) => {
    const newLink: SportLink = {
      ...linkData,
      id: Date.now().toString(),
      sportId,
      addedAt: new Date(),
      clickCount: 0,
      isFavorite: false
    }
    setLinks([newLink, ...links])
    setShowAddLink(false)
  }

  const deleteLink = (linkId: string) => {
    setLinks(links.filter(link => link.id !== linkId))
  }

  const toggleFavorite = (linkId: string) => {
    setLinks(links.map(link => 
      link.id === linkId 
        ? { ...link, isFavorite: !link.isFavorite }
        : link
    ))
  }

  const incrementClickCount = (linkId: string) => {
    setLinks(links.map(link => 
      link.id === linkId 
        ? { ...link, clickCount: link.clickCount + 1 }
        : link
    ))
  }

  const copyToClipboard = async (url: string, linkId: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(linkId)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  const getTypeIcon = (type: SportLink['type']) => {
    const typeData = linkTypes.find(t => t.id === type)
    return typeData ? typeData.icon : Globe
  }

  const getTypeColor = (type: SportLink['type']) => {
    const typeData = linkTypes.find(t => t.id === type)
    return typeData ? typeData.color : '#6B7280'
  }

  const filteredLinks = links
    .filter(link => {
      if (filterType !== 'all' && link.type !== filterType) return false
      if (filterCategory !== 'all' && link.category !== filterCategory) return false
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        return (
          link.title.toLowerCase().includes(searchLower) ||
          link.description?.toLowerCase().includes(searchLower) ||
          link.tags.some(tag => tag.toLowerCase().includes(searchLower))
        )
      }
      return true
    })
    .sort((a, b) => {
      // Favorites first, then by click count, then by date
      if (a.isFavorite && !b.isFavorite) return -1
      if (!a.isFavorite && b.isFavorite) return 1
      if (a.clickCount !== b.clickCount) return b.clickCount - a.clickCount
      return b.addedAt.getTime() - a.addedAt.getTime()
    })

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Resource Links</h3>
          <p className="text-sm text-gray-600">Collect useful videos, articles, and tools</p>
        </div>
        <motion.button
          onClick={() => setShowAddLink(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-4 h-4" />
          Add Link
        </motion.button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Search links..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              filterType === 'all' 
                ? 'bg-orange-100 text-orange-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Types
          </button>
          {linkTypes.map(type => (
            <button
              key={type.id}
              onClick={() => setFilterType(type.id as SportLink['type'])}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                filterType === type.id 
                  ? 'bg-orange-100 text-orange-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <type.icon className="w-3 h-3" />
              {type.name}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              filterCategory === 'all' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Categories
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setFilterCategory(category.id as SportLink['category'])}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                filterCategory === category.id 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-xs">{category.emoji}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Links Grid */}
      {filteredLinks.length === 0 ? (
        <div className="text-center py-12">
          <LinkIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No links yet</h3>
          <p className="text-gray-600 mb-4">Start building your resource collection</p>
          <button
            onClick={() => setShowAddLink(true)}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Add Your First Link
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLinks.map(link => {
            const TypeIcon = getTypeIcon(link.type)
            const typeColor = getTypeColor(link.type)

            return (
              <motion.div
                key={link.id}
                className="p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
                whileHover={{ scale: 1.02 }}
                layout
              >
                <div className="flex items-start gap-3 mb-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${typeColor}20` }}
                  >
                    <TypeIcon className="w-5 h-5" style={{ color: typeColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                      {link.title}
                    </h4>
                    <p className="text-xs text-gray-500 mb-2">
                      {link.type} • {link.category}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleFavorite(link.id)}
                    className={`p-1 rounded-full transition-colors ${
                      link.isFavorite 
                        ? 'text-yellow-500 hover:text-yellow-600' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${link.isFavorite ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {link.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {link.description}
                  </p>
                )}

                {link.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {link.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {link.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{link.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => incrementClickCount(link.id)}
                      className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs hover:bg-blue-200 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Open
                    </a>
                    <button
                      onClick={() => copyToClipboard(link.url, link.id)}
                      className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs hover:bg-gray-200 transition-colors"
                    >
                      {copiedId === link.id ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {link.clickCount > 0 && (
                      <span className="text-xs text-gray-500">
                        {link.clickCount} clicks
                      </span>
                    )}
                    <button
                      onClick={() => deleteLink(link.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Add Link Modal */}
      <AnimatePresence>
        {showAddLink && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Resource Link</h3>
              
              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target as HTMLFormElement)
                const tags = (formData.get('tags') as string)
                  .split(',')
                  .map(tag => tag.trim())
                  .filter(tag => tag.length > 0)
                
                addLink({
                  title: formData.get('title') as string,
                  url: formData.get('url') as string,
                  description: formData.get('description') as string,
                  type: formData.get('type') as SportLink['type'],
                  category: formData.get('category') as SportLink['category'],
                  tags
                })
              }} className="space-y-4">
                <input
                  name="title"
                  type="text"
                  placeholder="Link title"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                
                <input
                  name="url"
                  type="url"
                  placeholder="https://..."
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                
                <textarea
                  name="description"
                  placeholder="Optional description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
                
                <select
                  name="type"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select type</option>
                  {linkTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
                
                <select
                  name="category"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select category (optional)</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
                
                <input
                  name="tags"
                  type="text"
                  placeholder="Tags (comma-separated)"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddLink(false)}
                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Add Link
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}