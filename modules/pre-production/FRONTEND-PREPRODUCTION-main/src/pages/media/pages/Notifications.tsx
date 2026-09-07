import { getCurrentEmployeeId } from '../../../utils/currentUser';
import NotificationsPage from '../../../components/NotificationsPage';
import { useMediaRole } from '../../../hooks/useMediaRole';

export default function Notifications() {
    const { fromRole } = useMediaRole();
    const roles = [fromRole];
    const employeeId = getCurrentEmployeeId();
    return <NotificationsPage roles={roles} employeeId={employeeId} showRoleFilter={true} showStageFilter={true} />;
}
