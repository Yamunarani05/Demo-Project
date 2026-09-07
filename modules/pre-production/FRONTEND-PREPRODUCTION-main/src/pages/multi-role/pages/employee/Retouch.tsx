import { Palette } from 'lucide-react'
import AssignedProjectTaskPage from './AssignedProjectTaskPage'

export default function Retouch() {
    return <AssignedProjectTaskPage title="Retouch" projectType="Retouching" icon={<Palette size={20} className="text-amber-600" />} description="Manage and design your assigned Retouch projects" />
}
