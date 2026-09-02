import { Image } from 'lucide-react'
import AssignedProjectTaskPage from './AssignedProjectTaskPage'

export default function SaveTheDate() {
    return <AssignedProjectTaskPage title="Save the Date" projectType="Save the Date" icon={<Image size={20} className="text-amber-600" />} description="Manage and design your assigned Save the Date projects" />
}
