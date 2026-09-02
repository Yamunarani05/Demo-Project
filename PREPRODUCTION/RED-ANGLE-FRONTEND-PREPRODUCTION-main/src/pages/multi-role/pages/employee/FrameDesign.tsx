import { BookOpen } from 'lucide-react'
import AssignedProjectTaskPage from './AssignedProjectTaskPage'

type Props = {
    listMode?: 'assigned' | 'works'
}

export default function FrameDesign({ listMode = 'assigned' }: Props) {
    return (
        <AssignedProjectTaskPage
            title="Frame Design"
            projectType="Frame Design"
            icon={<BookOpen size={20} className="text-yellow-600" />}
            description="Design the frame proof, submit your final link, and wait for CRM verification."
            listMode={listMode}
            roleLabel="Frame Designer"
        />
    )
}
