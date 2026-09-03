import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

/**
 * GreatMasterEntry – accessed via http://localhost:5173/greatmaster
 *
 * This is the exclusive direct entry point for the Great Master Admin.
 * It silently logs in as Great Master and immediately redirects to the dashboard.
 * It is NOT reachable from the public /login page (which is Studio Admin only).
 */
export default function GreatMasterEntry() {
  const { loginAsGreatMaster } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loginAsGreatMaster();
    toast.success('Great Master Admin', {
      description: 'Logged in as overall platform administrator.',
    });
    navigate('/master/dashboard', { replace: true });
  }, []);

  return null;
}
