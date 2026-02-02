'use client'
import { useState } from 'react';

interface MathToolbarProps {
  onInsert: (symbol: string) => void
}

const MATH_SYMBOLS = [
  { symbol: '\\frac{a}{b}', name: 'Fraction' },
  { symbol: '\\sqrt{x}', name: 'Square Root' },
  { symbol: '\\sqrt[n]{x}', name: 'Nth Root' },
  { symbol: 'x^{2}', name: 'Exponent' },
  { symbol: 'x_{n}', name: 'Subscript' },
  { symbol: '\\sum_{i=1}^{n}', name: 'Summation' },
  { symbol: '\\int_{a}^{b}', name: 'Integral' },
  { symbol: '\\lim_{x \\to a}', name: 'Limit' },
  { symbol: '\\infty', name: 'Infinity' },
  { symbol: '\\pi', name: 'Pi' },
  { symbol: '\\alpha', name: 'Alpha' },
  { symbol: '\\beta', name: 'Beta' },
  { symbol: '\\theta', name: 'Theta' },
  { symbol: '\\pm', name: 'Plus/Minus' },
  { symbol: '\\neq', name: 'Not Equal' },
  { symbol: '\\leq', name: 'Less or Equal' },
  { symbol: '\\geq', name: 'Greater or Equal' },
  { symbol: '\\cdot', name: 'Dot' },
  { symbol: '\\times', name: 'Times' },
  { symbol: '\\div', name: 'Divide' },
]

const MATH_ENVIRONMENTS = [
  { symbol: '\\begin{matrix}a & b \\\\ c & d\\end{matrix}', name: 'Matrix' },
  { symbol: '\\begin{cases} x & \\text{if } y \\\\ z & \\text{otherwise} \\end{cases}', name: 'Cases' },
  { symbol: '\\begin{align} x &= y \\\\ z &= w \\end{align}', name: 'Align' },
]

export default function MathToolbar({ onInsert }: MathToolbarProps) {
  const [activeTab, setActiveTab] = useState<'symbols' | 'environments' | 'greek'>('symbols')

  const GREEK_LETTERS = [
    '\\alpha', '\\beta', '\\gamma', '\\delta', '\\epsilon', '\\zeta', '\\eta', '\\theta',
    '\\iota', '\\kappa', '\\lambda', '\\mu', '\\nu', '\\xi', '\\pi', '\\rho', '\\sigma',
    '\\tau', '\\upsilon', '\\phi', '\\chi', '\\psi', '\\omega',
    '\\Alpha', '\\Beta', '\\Gamma', '\\Delta', '\\Epsilon', '\\Zeta', '\\Eta', '\\Theta',
    '\\Iota', '\\Kappa', '\\Lambda', '\\Mu', '\\Nu', '\\Xi', '\\Pi', '\\Rho', '\\Sigma',
    '\\Tau', '\\Upsilon', '\\Phi', '\\Chi', '\\Psi', '\\Omega'
  ]

  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <div className="flex space-x-2 mb-4 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab('symbols')}
          className={`px-3 py-1 rounded text-sm ${activeTab === 'symbols' ? 'bg-accent text-white' : 'hover:bg-surface/50'}`}
        >
          Symbols
        </button>
        <button
          onClick={() => setActiveTab('greek')}
          className={`px-3 py-1 rounded text-sm ${activeTab === 'greek' ? 'bg-accent text-white' : 'hover:bg-surface/50'}`}
        >
          Greek Letters
        </button>
        <button
          onClick={() => setActiveTab('environments')}
          className={`px-3 py-1 rounded text-sm ${activeTab === 'environments' ? 'bg-accent text-white' : 'hover:bg-surface/50'}`}
        >
          Environments
        </button>
      </div>

      {activeTab === 'symbols' && (
        <div className="grid grid-cols-5 gap-2">
          {MATH_SYMBOLS.map((item) => (
            <button
              key={item.symbol}
              onClick={() => onInsert(item.symbol)}
              className="p-2 bg-background border border-border rounded hover:border-accent transition-colors text-sm"
              title={item.name}
            >
              {item.symbol}
            </button>
          ))}
        </div>
      )}

      {activeTab === 'greek' && (
        <div className="grid grid-cols-6 gap-2">
          {GREEK_LETTERS.map((letter) => (
            <button
              key={letter}
              onClick={() => onInsert(letter)}
              className="p-2 bg-background border border-border rounded hover:border-accent transition-colors text-sm"
              title={letter}
            >
              {letter.replace('\\', '')}
            </button>
          ))}
        </div>
      )}

      {activeTab === 'environments' && (
        <div className="space-y-3">
          {MATH_ENVIRONMENTS.map((env) => (
            <div key={env.symbol} className="space-y-1">
              <div className="text-xs text-gray-400">{env.name}</div>
              <button
                onClick={() => onInsert(env.symbol)}
                className="w-full p-2 bg-background border border-border rounded hover:border-accent transition-colors text-xs font-mono text-left"
              >
                {env.symbol}
              </button>
            </div>
          ))}
          
          <div className="pt-3 border-t border-border">
            <div className="text-xs text-gray-400 mb-2">Quick Templates:</div>
            <div className="space-y-2">
              <button
                onClick={() => onInsert('\\boxed{answer}')}
                className="w-full p-2 bg-background border border-border rounded hover:border-accent transition-colors text-xs"
              >
                Boxed Answer
              </button>
              <button
                onClick={() => onInsert('\\text{your text here}')}
                className="w-full p-2 bg-background border border-border rounded hover:border-accent transition-colors text-xs"
              >
                Text in Math
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-border text-xs text-gray-400">
        <p>Tip: Use $$ for display math and $ for inline math</p>
       <p>{"Example: $$\\frac{a}{b}$$ or $x^2 + y^2 = z^2$"}</p>
      </div>
    </div>
  )
}