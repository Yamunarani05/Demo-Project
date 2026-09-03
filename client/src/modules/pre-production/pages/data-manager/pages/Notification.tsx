import { getCurrentEmployeeId } from '../../../utils/currentUser';
import NotificationsPage from '../../../components/NotificationsPage';

export default function Notification() {
    const roles = ['data_manager'];
    const employeeId = getCurrentEmployeeId();
    return <NotificationsPage roles={roles} employeeId={employeeId} showRoleFilter={true} showStageFilter={true} />;
}
