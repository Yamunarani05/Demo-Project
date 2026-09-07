import { BookOpen } from 'lucide-react'
import AssignedProjectTaskPage from './AssignedProjectTaskPage'

type Props = {
    listMode?: 'assigned' | 'works'
}

export default function MagazineDesign({ listMode = 'assigned' }: Props) {
    return (
        <AssignedProjectTaskPage
            title="Magazine Design"
            projectType="Magazine Design"
            icon={<BookOpen size={20} className="text-pink-600" />}
            description="Design the magazine proof, submit your final link, and wait for CRM verification."
            listMode={listMode}
            roleLabel="Magazine Designer"
        />
    )
}
