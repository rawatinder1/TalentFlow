'use client'

import { Button } from "@/components/ui/button"
import { Input } from '@/components/ui/input'
import React, { useState, useEffect } from 'react'
//@ts-ignore
import { useForm } from 'react-hook-form'
//@ts-ignore
import { toast } from "sonner"
//@ts-ignore
import { X, Plus, Briefcase } from 'lucide-react'

export interface Job {
  id?: number
  title: string
  slug: string
  status: "active" | "archived"
  tags: string[]
  order: number
  createdAt: Date
  updatedAt: Date
}

const CreateJobPage = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    defaultValues: { title: '', slug: '', status: 'active' }
  })

  const titleValue = watch('title')

  useEffect(() => {
    if (titleValue) {
      setValue(
        'slug',
        titleValue
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim()
      )
    }
  }, [titleValue, setValue])

  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag])
      setTagInput('')
    }
  }

  async function onSubmit(data: any) {
    setIsSubmitting(true)
    try {
      const response = await fetch('/mock/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, tags }),
      })
      if (!response.ok) throw new Error('Failed to create job')
      toast.success('Job created successfully!')
      reset()
      setTags([])
      onSuccess?.()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 flex items-center justify-center p-6">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 p-8 relative overflow-hidden">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Create New Job</h1>
          <p className="text-gray-600 text-sm">Fill in the details to create a new job posting</p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
            <Input
              {...register('title', { required: 'Title is required' })}
              placeholder="e.g. Senior Frontend Developer"
              className="h-12 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
          </div>

          {/* Slug Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">URL Slug</label>
            <Input
              {...register('slug', { required: 'Slug is required' })}
              placeholder="senior-frontend-developer"
              className="h-12 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
            />
            {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>}
          </div>

          {/* Tags Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Tags</label>
            <div className="flex gap-2 mb-4">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add a tag..."
                className="flex-1 h-12 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              />
              <Button
                type="button"
                onClick={addTag}
                disabled={!tagInput.trim()}
                className="h-12 w-12 rounded-xl bg-blue-500 hover:bg-blue-600 text-white shadow-md"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-800 rounded-lg text-sm font-medium border border-slate-200 hover:bg-slate-200"
                  >
                    {tag}
                    <X
                      className="w-4 h-4 cursor-pointer hover:text-red-500"
                      onClick={() => setTags(tags.filter((t) => t !== tag))}
                    />
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="w-full h-12 rounded-lg bg-blue-500 text-white font-medium text-base shadow-md hover:bg-blue-600 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                Processing...
              </div>
            ) : (
              'Create Job'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CreateJobPage
