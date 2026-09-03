import React from 'react'

export default function StatCard({ title, value, subtitle, icon }) {
  return (
    <div className="stat-card">
      <div>
        <p>{title}</p>
        <strong>{value}</strong>
        {subtitle && <span>{subtitle}</span>}
      </div>
      <div className="stat-icon">{icon}</div>
    </div>
  )
}
