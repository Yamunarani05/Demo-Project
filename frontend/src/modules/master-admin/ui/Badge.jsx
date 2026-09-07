import React from 'react'
import { label } from '../utils'

const colors = {
  Assigned: ['#DBEAFE', '#2563EB'],
  Unassigned: ['#F3F4F6', '#6B7280'],
  Completed: ['#E8F5E9', '#2E7D32'],
  Pending: ['#FEF9C3', '#CA8A04'],
  Paid: ['#DCFCE7', '#16A34A'],
  Partial: ['#E0F2FE', '#0369A1'],
  Present: ['#DCFCE7', '#16A34A'],
  Absent: ['#FEE2E2', '#DC2626'],
  Active: ['#DCFCE7', '#16A34A'],
  'On Leave': ['#FEF9C3', '#CA8A04'],
  Inactive: ['#F3F4F6', '#6B7280'],
  Normal: ['#DCFCE7', '#16A34A'],
  Attention: ['#FEF9C3', '#CA8A04'],
  Critical: ['#FEE2E2', '#DC2626'],
  'Pre-wedding': ['#EDE9FE', '#5B5FC7'],
  'Post-wedding': ['#FFF3E0', '#F57C00'],
}

export default function Badge({ value }) {
  const text = label(value)
  const [bg, color] = colors[text] || ['#F3F4F6', '#6B7280']
  return <span className="badge" style={{ background: bg, color }}>{text}</span>
}
