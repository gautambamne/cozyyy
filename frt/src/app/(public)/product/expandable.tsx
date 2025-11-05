"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Minus } from "lucide-react"

interface ExpandableSectionProps {
  title: string
  children: React.ReactNode
}

export default function ExpandableSection({ title, children }: ExpandableSectionProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-border pb-2 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-3 hover:bg-secondary/50 px-2 rounded transition-colors"
      >
        <span className="font-medium text-foreground">{title}</span>
        <div className="bg-primary text-primary-foreground p-1 rounded">
          {isOpen ? <Minus size={16} /> : <Plus size={16} />}
        </div>
      </button>
      {isOpen && <div className="px-2 pb-3 text-muted-foreground">{children}</div>}
    </div>
  )
}
