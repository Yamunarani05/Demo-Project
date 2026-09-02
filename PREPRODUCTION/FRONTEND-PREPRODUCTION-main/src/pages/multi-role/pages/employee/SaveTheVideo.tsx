import { Film } from 'lucide-react'
import AssignedProjectTaskPage from './AssignedProjectTaskPage'

export default function SaveTheVideo() {
    return <AssignedProjectTaskPage title="Save the Video" projectType="Save the Video" icon={<Film size={20} className="text-amber-600" />} description="Manage and design your assigned Save the Video projects" />
}
