import React, { useState } from 'react'

interface AccordionItem {
  id: string
  title: string
  content: React.ReactNode
}

interface AccordionProps {
  items: AccordionItem[]
  allowMultiple?: boolean
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  allowMultiple = false
}) => {
  const [openItems, setOpenItems] = useState<string[]>([])

  const toggleItem = (id: string) => {
    if (allowMultiple) {
      setOpenItems(prev =>
        prev.includes(id)
          ? prev.filter(item => item !== id)
          : [...prev, id]
      )
    } else {
      setOpenItems(prev =>
        prev.includes(id) ? [] : [id]
      )
    }
  }

  return (
    <div className="accordion">
      {items.map((item) => {
        const isOpen = openItems.includes(item.id)
        return (
          <div key={item.id} className="accordion-item">
            <button
              className="accordion-header"
              onClick={() => toggleItem(item.id)}
            >
              {item.title}
              <span className={`accordion-icon ${isOpen ? 'open' : ''}`}>
                ▼
              </span>
            </button>
            {isOpen && (
              <div className="accordion-content">
                {item.content}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
