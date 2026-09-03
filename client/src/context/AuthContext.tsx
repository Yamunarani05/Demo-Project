import React, { createContext, useContext, useState, useEffect } from 'react';
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
}

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  activeStudio: DemoStudio | null;
  studiosList: DemoStudio[];
  clientsList: DemoClient[];
  activitiesList: DemoActivity[];
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

  // 3. Studios List
  const [studiosList] = useState<DemoStudio[]>(INITIAL_STUDIOS);

  // 4. Clients List
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

  // 5. Activities List
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

  // Persist clients store
  useEffect(() => {
    localStorage.setItem('demo_clients_store', JSON.stringify(clientsList));
  }, [clientsList]);

  // Persist activities store
  useEffect(() => {
    localStorage.setItem('demo_activities_store', JSON.stringify(activitiesList));
  }, [activitiesList]);

  const activeStudio = studiosList.find((s) => s.id === (user?.studioId || activeStudioId)) || studiosList[0];

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
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'studio_admin',
        isAuthenticated: !!user,
        activeStudio,
        studiosList,
        clientsList,
        activitiesList,
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
