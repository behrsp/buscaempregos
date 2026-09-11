import React from 'react';
import { 
  Briefcase, 
  Sparkles, 
  Bell, 
  User as UserIcon, 
  Database, 
  CheckCircle2, 
  LogOut, 
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNotifications: () => void;
  onOpenAtsModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNotifications,
  onOpenAtsModal,
}) => {
  const { user, logout, openAuthModal, unreadCount, atsProfile, dbStatus } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo & DB Tag */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('jobs')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-blue-600 text-white shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
              <Briefcase className="w-5 h-5" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-slate-950 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white font-['Plus_Jakarta_Sans']">
                  Vaga<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Match</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-700/50">
                  <Sparkles className="w-3 h-3 text-cyan-400" /> ATS IA
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Database className="w-3 h-3 text-emerald-400" />
                <span className="truncate max-w-[120px] sm:max-w-[180px] font-mono text-[10px] text-emerald-400 font-medium">
                  {dbStatus.connected ? 'Neon DB Online' : 'Neon DB'}
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'jobs'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700/80'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              Vagas & Match
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'applications'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700/80'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              Candidaturas
            </button>
            <button
              onClick={() => setActiveTab('competencies')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'competencies'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700/80'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              Competências
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'profile'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700/80'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              Currículo
            </button>
          </nav>

          {/* Right Action Items */}
          <div className="flex items-center gap-2.5">
            
            {/* ATS Score quick pill */}
            <button
              onClick={onOpenAtsModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-950/80 to-purple-950/80 border border-indigo-800/50 hover:border-indigo-500/80 text-xs font-semibold text-indigo-200 transition-all hover:scale-105 active:scale-95"
              title="Otimizar Perfil ATS com IA"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Score ATS:</span>
              <span className="text-emerald-400 font-bold">{atsProfile?.atsScore ? `${atsProfile.atsScore}%` : 'Otimizar'}</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 transition-colors border border-transparent hover:border-slate-800"
              aria-label="Notificações"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full ring-2 ring-slate-950 animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* User Profile / Auth button */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <button
                  onClick={() => setActiveTab('profile')}
                  className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-900/70 transition-all text-left"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.fullName}
                      className="w-9 h-9 rounded-lg object-cover ring-2 ring-indigo-500/40 bg-slate-800"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-center text-xs font-bold text-indigo-300">
                      {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <div className="hidden lg:block">
                    <p className="text-xs font-bold text-slate-100 truncate max-w-[110px] leading-tight">
                      {user.fullName}
                    </p>
                    <p className="text-[10px] text-emerald-400 font-medium truncate max-w-[110px]">
                      {user.modality || 'Remoto'}
                    </p>
                  </div>
                </button>
                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition-colors"
                  title="Sair da conta"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 rounded-xl transition-all shadow-md shadow-indigo-600/20"
              >
                <UserIcon className="w-4 h-4" />
                <span>Entrar / Cadastrar</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
