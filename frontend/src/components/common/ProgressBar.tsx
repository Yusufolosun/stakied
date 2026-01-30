import React from 'react'

interface ProgressBarProps {
  value: number
  max: number
  label?: string
  variant?: 'primary' | 'success' | 'warning' | 'danger'
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  label,
  variant = 'primary'
}) => {
  const percentage = Math.min((value / max) * 100, 100)

  return (
    <div className="progress-bar-container">
      {label && <div className="progress-label">{label}</div>}
      <div className="progress-bar">
        <div
          className={`progress-fill progress-fill-${variant}`}
          style={{ width: `${percentage}%` }}
        >
          <span className="progress-text">{percentage.toFixed(0)}%</span>
        </div>
      </div>
    </div>
  )
}
