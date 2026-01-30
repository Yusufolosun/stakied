import React, { useState } from 'react'

interface DropdownProps {
  label: string
  options: { value: string; label: string }[]
  value?: string
  onChange: (value: string) => void
}

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  options,
  value,
  onChange
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  const selectedLabel = options.find(opt => opt.value === value)?.label || label

  return (
    <div className="dropdown">
      <button
        className="dropdown-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedLabel}
        <span className="dropdown-arrow">▼</span>
      </button>
      {isOpen && (
        <div className="dropdown-menu">
          {options.map((option) => (
            <div
              key={option.value}
              className="dropdown-item"
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
