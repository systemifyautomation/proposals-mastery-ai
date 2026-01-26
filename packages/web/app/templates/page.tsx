'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Copy } from 'lucide-react'

interface Template {
  id: string
  name: string
  content: string
  createdAt: string
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: '1',
      name: 'Web Development Template',
      content: 'Hello! I noticed your job posting for {{JOB_TITLE}}. With {{YEARS_EXPERIENCE}} years of experience in web development, I am confident I can deliver excellent results for your project...',
      createdAt: '2024-01-15',
    },
  ])

  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '', content: '' })
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCreate = () => {
    if (formData.name && formData.content) {
      const newTemplate: Template = {
        id: Date.now().toString(),
        name: formData.name,
        content: formData.content,
        createdAt: new Date().toISOString().split('T')[0],
      }
      setTemplates([...templates, newTemplate])
      setFormData({ name: '', content: '' })
      setIsCreating(false)
    }
  }

  const handleUpdate = () => {
    if (editingId && formData.name && formData.content) {
      setTemplates(templates.map(t => 
        t.id === editingId 
          ? { ...t, name: formData.name, content: formData.content }
          : t
      ))
      setEditingId(null)
      setFormData({ name: '', content: '' })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      setTemplates(templates.filter(t => t.id !== id))
    }
  }

  const handleEdit = (template: Template) => {
    setEditingId(template.id)
    setFormData({ name: template.name, content: template.content })
    setIsCreating(false)
  }

  const handleCancel = () => {
    setIsCreating(false)
    setEditingId(null)
    setFormData({ name: '', content: '' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-upwork-black text-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-upwork-green">
              Proposals Mastery AI
            </Link>
            <nav className="flex gap-6">
              <Link href="/templates" className="text-upwork-green border-b-2 border-upwork-green pb-1">
                Templates
              </Link>
              <Link href="/profile" className="hover:text-upwork-green transition-colors">
                Profile
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-upwork-black mb-2">Proposal Templates</h1>
            <p className="text-upwork-medium-gray">
              Create and manage your reusable proposal templates
            </p>
          </div>
          {!isCreating && !editingId && (
            <button
              onClick={() => setIsCreating(true)}
              className="bg-upwork-green text-white px-6 py-3 rounded-lg font-semibold hover:bg-upwork-green-dark transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Template
            </button>
          )}
        </div>

        {/* Template Form */}
        {(isCreating || editingId) && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-2 border-upwork-green">
            <h2 className="text-2xl font-bold text-upwork-black mb-4">
              {editingId ? 'Edit Template' : 'Create New Template'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-upwork-black mb-2">
                  Template Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Web Development Template"
                  className="w-full px-4 py-2 border-2 border-upwork-light-gray rounded-lg focus:border-upwork-green focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-upwork-black mb-2">
                  Template Content
                </label>
                <div className="mb-2 text-sm text-upwork-medium-gray">
                  Use placeholders like {`{{JOB_TITLE}}, {{COMPANY_NAME}}, {{YOUR_NAME}}`} to personalize
                </div>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write your proposal template here..."
                  rows={10}
                  className="w-full px-4 py-2 border-2 border-upwork-light-gray rounded-lg focus:border-upwork-green focus:outline-none font-mono text-sm"
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={editingId ? handleUpdate : handleCreate}
                  className="bg-upwork-green text-white px-6 py-2 rounded-lg font-semibold hover:bg-upwork-green-dark transition-colors"
                >
                  {editingId ? 'Update Template' : 'Create Template'}
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-300 text-upwork-black px-6 py-2 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Templates List */}
        <div className="grid gap-6">
          {templates.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-upwork-medium-gray text-lg mb-4">
                No templates yet. Create your first template to get started!
              </p>
              <button
                onClick={() => setIsCreating(true)}
                className="bg-upwork-green text-white px-6 py-3 rounded-lg font-semibold hover:bg-upwork-green-dark transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create Template
              </button>
            </div>
          ) : (
            templates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-lg shadow-md p-6 border-2 border-transparent hover:border-upwork-light-gray transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-upwork-black mb-1">
                      {template.name}
                    </h3>
                    <p className="text-sm text-upwork-medium-gray">
                      Created on {new Date(template.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(template)}
                      className="p-2 text-upwork-green hover:bg-upwork-green hover:text-white rounded-lg transition-colors"
                      title="Edit template"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(template.content)
                        setCopiedId(template.id)
                        setTimeout(() => setCopiedId(null), 2000)
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        copiedId === template.id
                          ? 'bg-upwork-green text-white'
                          : 'text-blue-600 hover:bg-blue-600 hover:text-white'
                      }`}
                      title={copiedId === template.id ? 'Copied!' : 'Copy template'}
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="p-2 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
                      title="Delete template"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-upwork-light-gray">
                  <p className="text-sm text-upwork-black whitespace-pre-wrap font-mono">
                    {template.content}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
