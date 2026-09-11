import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Competency, Experience, ATSProfile, PushNotification } from '../types';
import { api, getStoredToken, setStoredToken } from '../services/api';

interface ToastAlert {
  id: string;
  title: string;
  message: string;
  type?: 'success' | 'info' | 'warning';
}

interface AuthContextType {
  user: User | null;
  competencies: Competency[];
  experiences: Experience[];
  atsProfile: ATSProfile | null;
  notifications: PushNotification[];
  unreadCount: number;
  isLoading: boolean;
  dbStatus: { connected: boolean; message: string };
  isAuthModalOpen: boolean;
  pushEnabled: boolean;
  toast: ToastAlert | null;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshUserData: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  addCompetency: (comp: { name: string; category: string; proficiency: string; yearsExperience: number }) => Promise<void>;
  removeCompetency: (id: number) => Promise<void>;
  addExperience: (exp: any) => Promise<void>;
  updateExperience: (id: number, exp: Partial<Experience>) => Promise<void>;
  removeExperience: (id: number) => Promise<void>;
  deleteResume: () => Promise<void>;
  updateResume: (data: { bio?: string; headline?: string; experiences?: any[] }) => Promise<void>;
  generateATS: () => Promise<ATSProfile>;
  refreshNotifications: () => Promise<void>;
  markNotificationsAsRead: () => Promise<void>;
  togglePushNotifications: () => Promise<boolean>;
  simulateBrowserPushNotification: (title: string, body: string) => void;
  dismissToast: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [atsProfile, setAtsProfile] = useState<ATSProfile | null>(null);
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastAlert | null>(null);
  const [pushEnabled, setPushEnabled] = useState<boolean>(() => {
    return localStorage.getItem('vagamatch_push_enabled') === 'true';
  });

  const [dbStatus, setDbStatus] = useState<{ connected: boolean; message: string }>({
    connected: true,
    message: 'Neon DB Conectado',
  });

  const showToast = (title: string, message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    const id = Date.now().toString();
    setToast({ id, title, message, type });
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 4500);
  };

  const refreshUserData = async () => {
    try {
      const data = await api.getMe();
      setUser(data.user);
      setCompetencies(data.competencies || []);
      setExperiences(data.experiences || []);
      if (data.atsProfile) {
        let kw: string[] = [];
        let st: string[] = [];
        let rec: string[] = [];
        try {
          kw = typeof data.atsProfile.keywords === 'string' ? JSON.parse(data.atsProfile.keywords) : (data.atsProfile.keywords || []);
          st = typeof data.atsProfile.strengths === 'string' ? JSON.parse(data.atsProfile.strengths) : (data.atsProfile.strengths || []);
          rec = typeof data.atsProfile.recommendations === 'string' ? JSON.parse(data.atsProfile.recommendations) : (data.atsProfile.recommendations || []);
        } catch (e) {
          kw = ['React', 'TypeScript', 'Node.js'];
        }
        setAtsProfile({
          id: data.atsProfile.id,
          headline: data.atsProfile.headline,
          recruiterSummary: data.atsProfile.recruiter_summary,
          atsScore: data.atsProfile.ats_score,
          keywords: kw,
          strengths: st,
          recommendations: rec,
        });
      }
    } catch (err) {
      console.warn('Sessão não ativa ou token inválido.');
      setStoredToken(null);
      setUser(null);
    }
  };

  const refreshNotifications = async () => {
    try {
      const notifs = await api.getNotifications();
      setNotifications(notifs);
    } catch (err) {
      // ignore
    }
  };

  // Initial load
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        const h = await api.checkHealth();
        setDbStatus({
          connected: true,
          message: `${h.database} (${h.neonHost.split('.')[0]})`,
        });
      } catch (e) {
        setDbStatus({
          connected: false,
          message: 'Neon DB Conectando...',
        });
      }

      const token = getStoredToken();
      if (token) {
        try {
          const data = await api.getMe();
          if (data.user && (data.user.email === 'candidato.demo@vagamatch.com' || data.user.email === 'ana.dev@vagamatch.com')) {
            // User requested to remove demo profiles; clear demo session
            setStoredToken(null);
            setUser(null);
            setIsAuthModalOpen(true);
          } else {
            setUser(data.user);
            setCompetencies(data.competencies || []);
            setExperiences(data.experiences || []);
            if (data.atsProfile) {
              let kw: string[] = [];
              let st: string[] = [];
              let rec: string[] = [];
              try {
                kw = typeof data.atsProfile.keywords === 'string' ? JSON.parse(data.atsProfile.keywords) : (data.atsProfile.keywords || []);
                st = typeof data.atsProfile.strengths === 'string' ? JSON.parse(data.atsProfile.strengths) : (data.atsProfile.strengths || []);
                rec = typeof data.atsProfile.recommendations === 'string' ? JSON.parse(data.atsProfile.recommendations) : (data.atsProfile.recommendations || []);
              } catch (e) {
                kw = [];
              }
              setAtsProfile({
                id: data.atsProfile.id,
                headline: data.atsProfile.headline,
                recruiterSummary: data.atsProfile.recruiter_summary,
                atsScore: data.atsProfile.ats_score,
                keywords: kw,
                strengths: st,
                recommendations: rec,
              });
            }
            await refreshNotifications();
          }
        } catch (err) {
          setStoredToken(null);
          setUser(null);
          setIsAuthModalOpen(true);
        }
      } else {
        // No stored token: open registration modal so user can create their own profile
        setIsAuthModalOpen(true);
      }
      setIsLoading(false);
    };

    init();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    setStoredToken(res.token);
    await refreshUserData();
    await refreshNotifications();
    setIsAuthModalOpen(false);
    showToast('Login Realizado', `Bem-vindo de volta, ${res.user.fullName}!`, 'success');
  };

  const register = async (data: any) => {
    const res = await api.register(data);
    setStoredToken(res.token);
    await refreshUserData();
    await refreshNotifications();
    setIsAuthModalOpen(false);
    showToast('Conta Criada', 'Seu perfil foi salvo com sucesso no Neon DB!', 'success');
  };

  const logout = () => {
    setStoredToken(null);
    setUser(null);
    setCompetencies([]);
    setExperiences([]);
    setAtsProfile(null);
    setNotifications([]);
    showToast('Desconectado', 'Sua sessão foi encerrada.', 'info');
  };

  const updateUserProfile = async (data: Partial<User>) => {
    await api.updateProfile(data);
    await refreshUserData();
    showToast('Perfil Atualizado', 'Suas informações foram salvas no Neon DB.', 'success');
  };

  const addCompetency = async (comp: { name: string; category: string; proficiency: string; yearsExperience: number }) => {
    await api.addCompetency(comp);
    await refreshUserData();
    showToast('Competência Adicionada', `${comp.name} registrada no seu perfil ATS.`, 'success');
  };

  const removeCompetency = async (id: number) => {
    await api.deleteCompetency(id);
    await refreshUserData();
    showToast('Competência Removida', 'Item excluído do banco de dados.', 'info');
  };

  const addExperience = async (exp: any) => {
    await api.addExperience(exp);
    await refreshUserData();
    showToast('Experiência Adicionada', `${exp.role} em ${exp.company} registrado.`, 'success');
  };

  const updateExperience = async (id: number, exp: Partial<Experience>) => {
    await api.updateExperience(id, exp);
    await refreshUserData();
    showToast('Experiência Atualizada', 'Alterações salvas com sucesso.', 'success');
  };

  const removeExperience = async (id: number) => {
    await api.deleteExperience(id);
    await refreshUserData();
    showToast('Experiência Removida', 'Cargo excluído do histórico.', 'info');
  };

  const deleteResume = async () => {
    await api.deleteResume();
    await refreshUserData();
    await refreshNotifications();
    showToast('Currículo Excluído', 'Todas as experiências e dados do currículo foram removidos.', 'warning');
  };

  const updateResume = async (data: { bio?: string; headline?: string; experiences?: any[] }) => {
    await api.updateResume(data);
    await refreshUserData();
    await refreshNotifications();
    showToast('Currículo Atualizado', 'Dados do currículo salvos no Neon DB.', 'success');
  };

  const generateATS = async () => {
    const result = await api.generateATSProfile();
    setAtsProfile(result);
    await refreshUserData();
    await refreshNotifications();
    simulateBrowserPushNotification(
      `Perfil ATS Otimizado! (${result.atsScore}%) 🎯`,
      'Seu resumo para recrutadores e palavras-chave foram atualizados com IA.'
    );
    return result;
  };

  const markNotificationsAsRead = async () => {
    await api.markAllNotificationsRead();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const togglePushNotifications = async (): Promise<boolean> => {
    const newState = !pushEnabled;
    setPushEnabled(newState);
    localStorage.setItem('vagamatch_push_enabled', newState ? 'true' : 'false');

    if (newState) {
      // Try browser permission if supported and not blocked
      if (typeof window !== 'undefined' && 'Notification' in window) {
        try {
          if (Notification.permission === 'default') {
            await Notification.requestPermission();
          }
        } catch (e) {
          console.warn('Permissão de notificação do navegador não disponível no ambiente (iframe):', e);
        }
      }

      showToast(
        '🔔 Notificações Push Ativadas!',
        'Você receberá alertas instantâneos de novas vagas compatíveis e status de candidaturas.',
        'success'
      );
      simulateBrowserPushNotification(
        '🔔 Notificações Ativadas com Sucesso!',
        'O sistema de alertas em tempo real do VagaMatch ATS está ativo.'
      );
    } else {
      showToast(
        'Notificações Desativadas',
        'Você não receberá mais alertas automáticos nesta sessão.',
        'info'
      );
    }

    return newState;
  };

  const simulateBrowserPushNotification = (title: string, body: string) => {
    // Show in-app toast immediately so user ALWAYS sees the notification even in iframes
    showToast(title, body, 'info');

    // Also attempt native desktop notification if permissions allow
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
        });
      } catch (e) {
        // Silently handled
      }
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        competencies,
        experiences,
        atsProfile,
        notifications,
        unreadCount,
        isLoading,
        dbStatus,
        isAuthModalOpen,
        pushEnabled,
        toast,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        login,
        register,
        logout,
        refreshUserData,
        updateUserProfile,
        addCompetency,
        removeCompetency,
        addExperience,
        updateExperience,
        removeExperience,
        deleteResume,
        updateResume,
        generateATS,
        refreshNotifications,
        markNotificationsAsRead,
        togglePushNotifications,
        simulateBrowserPushNotification,
        dismissToast: () => setToast(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
