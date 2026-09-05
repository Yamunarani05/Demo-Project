import React, { createContext, useContext, useState, useEffect } from 'react';
import bcrypt from 'bcryptjs';
import { api } from '../services/api';
import { toast } from 'sonner';
import { logRegistrationEmail, logApprovalEmail, logRejectionEmail } from '../services/emailService';
import {
  DemoStudio,
  DemoClient,
  DemoActivity,
  INITIAL_STUDIOS,
  INITIAL_CLIENTS,
  INITIAL_ACTIVITIES,
  PRE_WEDDING_STAGES_DEFAULT,
  POST_WEDDING_STAGES_DEFAULT,
  WorkflowStageItem,
} from '../data/demoData';

export type UserRole = 'super_admin' | 'studio_admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  studioId?: string;
  avatar?: string;
  passwordHash?: string;
}

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  activeStudio: DemoStudio | null;
  studiosList: DemoStudio[];
  pendingRequests: DemoStudio[];
  clientsList: DemoClient[];
  activitiesList: DemoActivity[];
  login: (email: string, password: string) => Promise<{ success: boolean; user: User; studio?: DemoStudio }>;
  registerStudioAccount: (accountData: any, studioData: any) => Promise<{ success: boolean; pending: boolean; user: User; studio: DemoStudio }>;
  approveStudio: (studioId: string) => Promise<void>;
  rejectStudio: (studioId: string, reason?: string) => Promise<void>;
  loginAsGreatMaster: () => void;
  loginAsStudioAdmin: (studioId?: string) => void;
  switchStudio: (studioId: string) => void;
  onboardClient: (clientData: {
    name: string;
    partnerName?: string;
    email: string;
    phone: string;
    eventType: string;
    shootType: 'Pre-Wedding' | 'Post-Wedding' | 'Both';
    eventDate: string;
    location: string;
    budget?: number;
    notes?: string;
  }) => DemoClient;
  updateClientStage: (
    clientId: string,
    workflowType: 'pre_wedding' | 'post_wedding',
    stageId: string,
    newStatus: 'completed' | 'in_progress' | 'scheduled' | 'pending'
  ) => void;
  getClientById: (clientId: string) => DemoClient | undefined;
  getStudioClients: (studioId?: string) => DemoClient[];
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial seed users
const INITIAL_USERS: User[] = [
  {
    id: 'usr_great_master',
    name: 'Rajesh Malhotra',
    email: 'master@greatmaster.io',
    role: 'super_admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    passwordHash: bcrypt.hashSync('123456789', 10),
  },
  {
    id: 'usr_studio_aurora',
    name: 'Priya Sharma',
    email: 'priya@studioaurora.in',
    role: 'studio_admin',
    studioId: 'studio_1',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    passwordHash: bcrypt.hashSync('123456789', 10),
  },
  ...INITIAL_STUDIOS.map((s) => ({
    id: `usr_${s.id}`,
    name: s.adminName,
    email: s.adminEmail,
    role: 'studio_admin' as UserRole,
    studioId: s.id,
    avatar: s.logo,
    passwordHash: bcrypt.hashSync('123456789', 10),
  })),
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. User state
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('demo_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // 2. Active Studio
  const [activeStudioId, setActiveStudioId] = useState<string>(() => {
    const saved = localStorage.getItem('demo_active_studio_id');
    return saved || 'studio_1';
  });

  // 3. Registered Users Store
  const [usersList, setUsersList] = useState<User[]>(() => {
    const saved = localStorage.getItem('demo_users_store');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return INITIAL_USERS;
  });

  useEffect(() => {
    localStorage.setItem('demo_users_store', JSON.stringify(usersList));
  }, [usersList]);

  // 4. Studios List Store
  const [studiosList, setStudiosList] = useState<DemoStudio[]>(() => {
    const saved = localStorage.getItem('demo_studios_store');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return INITIAL_STUDIOS;
  });

  // Persist studios store
  useEffect(() => {
    localStorage.setItem('demo_studios_store', JSON.stringify(studiosList));
  }, [studiosList]);

  // 5. Clients List Store
  const [clientsList, setClientsList] = useState<DemoClient[]>(() => {
    const saved = localStorage.getItem('demo_clients_store');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_CLIENTS;
      }
    }
    return INITIAL_CLIENTS;
  });

  // 6. Activities List Store
  const [activitiesList, setActivitiesList] = useState<DemoActivity[]>(() => {
    const saved = localStorage.getItem('demo_activities_store');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_ACTIVITIES;
      }
    }
    return INITIAL_ACTIVITIES;
  });

  // Persist clients & activities store
  useEffect(() => {
    localStorage.setItem('demo_clients_store', JSON.stringify(clientsList));
  }, [clientsList]);

  useEffect(() => {
    localStorage.setItem('demo_activities_store', JSON.stringify(activitiesList));
  }, [activitiesList]);

  const activeStudio = studiosList.find((s) => s.id === (user?.studioId || activeStudioId)) || studiosList[0];
  const pendingRequests = studiosList.filter((s) => s.status === 'pending');

  const login = async (email: string, password: string): Promise<{ success: boolean; user: User; studio?: DemoStudio }> => {
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Check local users store first
    let userRecord = usersList.find((u) => u.email.toLowerCase() === normalizedEmail);

    // If not found in usersList, check API fallback if available
    if (!userRecord) {
      try {
        const res = await api.login({ email: normalizedEmail, password });
        if (res && res.success && res.user) {
          userRecord = {
            id: res.user.id,
            name: res.user.name,
            email: res.user.email,
            role: res.user.role,
            studioId: res.user.studioId,
            avatar: res.user.avatar,
            passwordHash: bcrypt.hashSync(password, 10),
          };
        }
      } catch (e) {
        // Fallback local lookup
      }
    }

    if (!userRecord) {
      throw new Error('Invalid email or password');
    }

    // Verify Password Hash
    let isPasswordValid = false;
    if (userRecord.passwordHash) {
      isPasswordValid = bcrypt.compareSync(password, userRecord.passwordHash);
    }
    // Fallback for default demo password
    if (!isPasswordValid && password === '123456789') {
      isPasswordValid = true;
    }

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // 2. Check Studio Approval Status if user is studio_admin
    let matchedStudio: DemoStudio | undefined;
    if (userRecord.role === 'studio_admin') {
      matchedStudio = studiosList.find((s) => s.id === userRecord?.studioId || s.adminEmail.toLowerCase() === normalizedEmail);

      if (!matchedStudio) {
        throw new Error('Associated studio account not found.');
      }

      if (matchedStudio.status === 'pending') {
        throw new Error('Your studio access request is awaiting approval from the Great Master Admin. Please check your registered email for updates.');
      }

      if (matchedStudio.status === 'rejected') {
        throw new Error('Your studio access request was not approved. Please check your registered email for more information.');
      }
    }

    const authUser: User = {
      id: userRecord.id,
      name: userRecord.name,
      email: userRecord.email,
      role: userRecord.role,
      studioId: userRecord.studioId,
      avatar: userRecord.avatar || (userRecord.role === 'super_admin'
        ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'),
    };

    setUser(authUser);
    localStorage.setItem('demo_auth_user', JSON.stringify(authUser));

    if (authUser.studioId) {
      setActiveStudioId(authUser.studioId);
      localStorage.setItem('demo_active_studio_id', authUser.studioId);
    }

    return { success: true, user: authUser, studio: matchedStudio || activeStudio };
  };

  const registerStudioAccount = async (accountData: any, studioData: any): Promise<{ success: boolean; pending: boolean; user: User; studio: DemoStudio }> => {
    const normalizedEmail = accountData.email.trim().toLowerCase();

    // Check if email already registered
    const existingUser = usersList.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (existingUser) {
      throw new Error('An account with this email address already exists.');
    }

    const passwordHash = bcrypt.hashSync(accountData.password, 10);
    const newStudioId = `studio_${Date.now()}`;

    const newStudio: DemoStudio = {
      id: newStudioId,
      name: studioData.studioName.trim(),
      slug: studioData.studioName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      tagline: 'Professional Photography & Cinematic Storytelling',
      city: studioData.city.trim(),
      state: studioData.state.trim(),
      logo: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=150&auto=format&fit=crop&q=80',
      coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop&q=80',
      adminName: accountData.fullName.trim(),
      adminEmail: normalizedEmail,
      referenceEmail: accountData.referenceEmail ? accountData.referenceEmail.trim() : undefined,
      adminPhone: accountData.phone.trim(),
      plan: 'Studio Pro (Trial)',
      status: 'pending',
      totalRevenue: 0,
      activeClientsCount: 0,
      onboardedClientsCount: 0,
      totalEmployees: studioData.totalEmployees ? Number(studioData.totalEmployees) : 1,
      photographersCount: studioData.photographers ? Number(studioData.photographers) : 1,
      editorsCount: studioData.editors ? Number(studioData.editors) : 1,
      completedShootsCount: 0,
    };

    const newStudioUser: User = {
      id: `usr_${Date.now()}`,
      name: accountData.fullName.trim(),
      email: normalizedEmail,
      role: 'studio_admin',
      studioId: newStudioId,
      avatar: newStudio.logo,
      passwordHash,
    };

    // Save to local stores
    setStudiosList((prev) => [newStudio, ...prev]);
    setUsersList((prev) => [...prev, newStudioUser]);

    // Optional API call to sync backend if server running
    try {
      await api.registerStudio({
        studioName: studioData.studioName,
        adminName: accountData.fullName,
        email: accountData.email,
        phone: accountData.phone,
        password: accountData.password,
        address: studioData.address,
        city: studioData.city,
        state: studioData.state,
        totalEmployees: studioData.totalEmployees,
        photographers: studioData.photographers,
        editors: studioData.editors,
        referenceEmail: accountData.referenceEmail,
      });
    } catch (e) {
      // Graceful fallback to local persistence
    }

    // Log registration email dispatch
    logRegistrationEmail({
      adminName: newStudioUser.name,
      studioName: newStudio.name,
      adminEmail: normalizedEmail,
      referenceEmail: newStudio.referenceEmail,
      city: newStudio.city,
    });

    // Add activity log for Great Master monitoring
    const newActivity: DemoActivity = {
      id: `act_${Date.now()}`,
      studioId: newStudio.id,
      studioName: newStudio.name,
      clientName: newStudio.adminName,
      action: 'Studio Access Requested',
      details: `${newStudio.name} submitted access request (Pending Approval). Confirmation email sent to ${normalizedEmail}.`,
      timeAgo: 'Just now',
      type: 'onboarding',
    };
    setActivitiesList((prev) => [newActivity, ...prev]);

    // Note: Do NOT set user session for pending studio
    return { success: true, pending: true, user: newStudioUser, studio: newStudio };
  };

  const approveStudio = async (studioId: string) => {
    setStudiosList((prev) =>
      prev.map((s) => {
        if (s.id !== studioId) return s;
        return {
          ...s,
          status: 'active',
        };
      })
    );

    const studio = studiosList.find((s) => s.id === studioId);
    let emailSuccess = true;

    // Sync server API if running
    try {
      const res = await api.updateStudioStatus(studioId, 'active');
      if (res && res.emailSent === false) {
        emailSuccess = false;
      }
    } catch (e) {}

    logApprovalEmail({
      adminName: studio?.adminName || 'Admin',
      studioName: studio?.name || 'Studio',
      adminEmail: studio?.adminEmail || '',
      referenceEmail: studio?.referenceEmail,
    });

    if (emailSuccess) {
      toast.success('Studio approved successfully.', {
        description: `Approval email sent to ${studio?.adminEmail || 'studio admin'}.`,
      });
    } else {
      toast.success('Studio approved successfully.', {
        description: `However, the approval email could not be sent to ${studio?.adminEmail || 'studio admin'}.`,
      });
    }

    if (studio) {
      const activity: DemoActivity = {
        id: `act_${Date.now()}`,
        studioId: studio.id,
        studioName: studio.name,
        clientName: studio.adminName,
        action: 'Studio Access Approved',
        details: `${studio.name} was approved by Great Master Admin and is now active. Approval email sent to ${studio.adminEmail}.`,
        timeAgo: 'Just now',
        type: 'status_update',
      };
      setActivitiesList((prev) => [activity, ...prev]);
    }
  };

  const rejectStudio = async (studioId: string, reason?: string) => {
    setStudiosList((prev) =>
      prev.map((s) => {
        if (s.id !== studioId) return s;
        return {
          ...s,
          status: 'rejected',
        };
      })
    );

    const studio = studiosList.find((s) => s.id === studioId);
    let emailSuccess = true;

    // Sync server API if running
    try {
      const res = await api.updateStudioStatus(studioId, 'rejected');
      if (res && res.emailSent === false) {
        emailSuccess = false;
      }
    } catch (e) {}

    logRejectionEmail({
      adminName: studio?.adminName || 'Admin',
      studioName: studio?.name || 'Studio',
      adminEmail: studio?.adminEmail || '',
      referenceEmail: studio?.referenceEmail,
      reason,
    });

    if (emailSuccess) {
      toast.info('Studio access request rejected.', {
        description: `Rejection email sent to ${studio?.adminEmail || 'studio admin'}.`,
      });
    } else {
      toast.info('Studio access request rejected.', {
        description: `However, the rejection email could not be sent to ${studio?.adminEmail || 'studio admin'}.`,
      });
    }

    if (studio) {
      const activity: DemoActivity = {
        id: `act_${Date.now()}`,
        studioId: studio.id,
        studioName: studio.name,
        clientName: studio.adminName,
        action: 'Studio Access Request Rejected',
        details: `${studio.name} access request was rejected by Great Master Admin. Rejection email sent to ${studio.adminEmail}.`,
        timeAgo: 'Just now',
        type: 'status_update',
      };
      setActivitiesList((prev) => [activity, ...prev]);
    }
  };

  const loginAsGreatMaster = () => {
    const gmUser: User = {
      id: 'usr_great_master',
      name: 'Rajesh Malhotra',
      email: 'master@greatmaster.io',
      role: 'super_admin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    };
    setUser(gmUser);
    localStorage.setItem('demo_auth_user', JSON.stringify(gmUser));
  };

  const loginAsStudioAdmin = (studioId: string = 'studio_1') => {
    const targetStudio = studiosList.find((s) => s.id === studioId) || studiosList[0];
    setActiveStudioId(targetStudio.id);
    localStorage.setItem('demo_active_studio_id', targetStudio.id);

    const studioUser: User = {
      id: `usr_admin_${targetStudio.id}`,
      name: targetStudio.adminName,
      email: targetStudio.adminEmail,
      role: 'studio_admin',
      studioId: targetStudio.id,
      avatar: targetStudio.logo,
    };
    setUser(studioUser);
    localStorage.setItem('demo_auth_user', JSON.stringify(studioUser));
  };

  const switchStudio = (studioId: string) => {
    const targetStudio = studiosList.find((s) => s.id === studioId);
    if (targetStudio) {
      setActiveStudioId(targetStudio.id);
      localStorage.setItem('demo_active_studio_id', targetStudio.id);
      if (user && user.role === 'studio_admin') {
        const updatedUser: User = {
          ...user,
          name: targetStudio.adminName,
          email: targetStudio.adminEmail,
          studioId: targetStudio.id,
          avatar: targetStudio.logo,
        };
        setUser(updatedUser);
        localStorage.setItem('demo_auth_user', JSON.stringify(updatedUser));
      }
    }
  };

  const onboardClient = (clientData: {
    name: string;
    partnerName?: string;
    email: string;
    phone: string;
    eventType: string;
    shootType: 'Pre-Wedding' | 'Post-Wedding' | 'Both';
    eventDate: string;
    location: string;
    budget?: number;
    notes?: string;
  }): DemoClient => {
    const targetStudioId = user?.studioId || activeStudioId || 'studio_1';
    const targetStudio = studiosList.find((s) => s.id === targetStudioId) || studiosList[0];

    const currentCount = clientsList.length + 1;
    const newId = `client_${Date.now()}`;
    const newSerial = `LEAD-${100 + currentCount}`;

    const preWeddingStages: WorkflowStageItem[] =
      clientData.shootType === 'Post-Wedding'
        ? []
        : PRE_WEDDING_STAGES_DEFAULT.map((name, index) => ({
            id: `pw_${index + 1}_${Date.now()}`,
            name,
            status: index === 0 ? 'completed' : index === 1 ? 'in_progress' : 'pending',
            completedAt: index === 0 ? new Date().toISOString().split('T')[0] : undefined,
          }));

    const postWeddingStages: WorkflowStageItem[] =
      clientData.shootType === 'Pre-Wedding'
        ? []
        : POST_WEDDING_STAGES_DEFAULT.map((name, index) => ({
            id: `post_${index + 1}_${Date.now()}`,
            name,
            status: index === 0 ? 'scheduled' : 'pending',
          }));

    const newClient: DemoClient = {
      id: newId,
      studioId: targetStudioId,
      serialNumber: newSerial,
      name: clientData.name,
      partnerName: clientData.partnerName,
      email: clientData.email,
      phone: clientData.phone,
      eventType: clientData.eventType || 'Wedding Celebration',
      shootType: clientData.shootType,
      eventDate: clientData.eventDate,
      location: clientData.location,
      budget: clientData.budget || 200000,
      paidAmount: Math.round((clientData.budget || 200000) * 0.4),
      notes: clientData.notes,
      created_at: new Date().toISOString(),
      preWeddingStages,
      postWeddingStages,
      preWeddingProgress: clientData.shootType === 'Post-Wedding' ? 0 : 20,
      postWeddingProgress: 0,
    };

    setClientsList((prev) => [newClient, ...prev]);

    // Add activity
    const newActivity: DemoActivity = {
      id: `act_${Date.now()}`,
      studioId: targetStudioId,
      studioName: targetStudio.name,
      clientName: newClient.name,
      action: 'Client Onboarded',
      details: `New ${clientData.shootType} client project initialized with 40% booking advance.`,
      timeAgo: 'Just now',
      type: 'onboarding',
    };
    setActivitiesList((prev) => [newActivity, ...prev]);

    return newClient;
  };

  const updateClientStage = (
    clientId: string,
    workflowType: 'pre_wedding' | 'post_wedding',
    stageId: string,
    newStatus: 'completed' | 'in_progress' | 'scheduled' | 'pending'
  ) => {
    setClientsList((prev) =>
      prev.map((client) => {
        if (client.id !== clientId) return client;

        const stagesKey = workflowType === 'pre_wedding' ? 'preWeddingStages' : 'postWeddingStages';
        const progressKey = workflowType === 'pre_wedding' ? 'preWeddingProgress' : 'postWeddingProgress';

        const updatedStages = client[stagesKey].map((stage) => {
          if (stage.id !== stageId) return stage;
          return {
            ...stage,
            status: newStatus,
            completedAt: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : undefined,
          };
        });

        // Recalculate progress %
        const completedCount = updatedStages.filter((s) => s.status === 'completed').length;
        const inProgressCount = updatedStages.filter((s) => s.status === 'in_progress').length;
        const total = updatedStages.length;
        const calculatedProgress = total > 0 ? Math.round(((completedCount + inProgressCount * 0.5) / total) * 100) : 0;

        const updatedClient = {
          ...client,
          [stagesKey]: updatedStages,
          [progressKey]: calculatedProgress,
        };

        const targetStudio = studiosList.find((s) => s.id === client.studioId) || studiosList[0];
        const changedStage = updatedStages.find((s) => s.id === stageId);

        // Record activity
        const activity: DemoActivity = {
          id: `act_${Date.now()}`,
          studioId: client.studioId,
          studioName: targetStudio.name,
          clientName: client.name,
          action: `${workflowType === 'pre_wedding' ? 'Pre-Wedding' : 'Post-Wedding'}: ${changedStage?.name || 'Stage'} → ${newStatus}`,
          details: `Stage updated to ${newStatus} (${calculatedProgress}% overall complete).`,
          timeAgo: 'Just now',
          type: 'status_update',
        };
        setActivitiesList((prevAct) => [activity, ...prevAct]);

        return updatedClient;
      })
    );
  };

  const getClientById = (clientId: string) => {
    return clientsList.find((c) => c.id === clientId);
  };

  const getStudioClients = (studioId?: string) => {
    const targetId = studioId || user?.studioId || activeStudioId;
    return clientsList.filter((c) => c.studioId === targetId);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('demo_auth_user');
    localStorage.removeItem('demo_auth_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'studio_admin',
        isAuthenticated: !!user,
        activeStudio,
        studiosList,
        pendingRequests,
        clientsList,
        activitiesList,
        login,
        registerStudioAccount,
        approveStudio,
        rejectStudio,
        loginAsGreatMaster,
        loginAsStudioAdmin,
        switchStudio,
        onboardClient,
        updateClientStage,
        getClientById,
        getStudioClients,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

