'use client'

import { useState, useEffect } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

interface KaTeXBlockProps {
  value: string
  onChange: (value: string) => void
}

export default function KaTeXBlock({ value, onChange }: KaTeXBlockProps) {
  const [preview, setPreview] = useState<string>('')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    try {
      if (value.trim()) {
        const html = katex.renderToString(value, {
          throwOnError: false,
          displayMode: true,
        })
        setPreview(html)
        setError('')
      } else {
        setPreview('')
        setError('')
      }
    } catch (err) {
      setError('Invalid LaTeX syntax')
      setPreview('')
    }
  }, [value])

  return (
    <div className="space-y-4">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-32 bg-background border border-border rounded-lg px-4 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        placeholder="Enter LaTeX math (e.g., \frac{a}{b} = c^{2})"
      />
      
      {error && (
        <div className="text-red-400 text-sm">{error}</div>
      )}
      
      {preview && (
        <div className="border border-border rounded-lg p-4 bg-surface/50">
          <div 
            className="text-center"
            dangerouslySetInnerHTML={{ __html: preview }}
          />
        </div>
      )}

      <div className="text-sm text-gray-400">
        <p>Quick reference: Use $...$ for inline math, $$...$$ for display math.</p>
        <p>Common symbols: \alpha, \beta, \sqrt{x}, \frac{a}{b}, \sum_{i=1}^n</p>
      </div>
    </div>
  )
}