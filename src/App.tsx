/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { JobsView } from './components/JobsView';
import { ApplicationsDashboard } from './components/ApplicationsDashboard';
import { CompetenciesView } from './components/CompetenciesView';
import { ProfileView } from './components/ProfileView';
import { AtsOptimizerModal } from './components/AtsOptimizerModal';
import { JobApplyModal } from './components/JobApplyModal';
import { NotificationsModal } from './components/NotificationsModal';
import { AuthModal } from './components/AuthModal';
import { Job } from './types';
import { Bell, CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('jobs');
  const [selectedJobForApply, setSelectedJobForApply] = useState<Job | null>(null);
  const [isAtsModalOpen, setIsAtsModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { isLoading, toast, dismissToast } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
        <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-lg font-bold">Iniciando VagaMatch ATS...</h2>
        <p className="text-xs text-slate-400 mt-1">Conectando ao Neon DB e inicializando perfil</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans'] antialiased selection:bg-indigo-500 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenAtsModal={() => setIsAtsModalOpen(true)}
      />

      {/* Main Content View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'jobs' && (
          <JobsView
            onApplyJob={(job) => setSelectedJobForApply(job)}
            onOpenAtsModal={() => setIsAtsModalOpen(true)}
          />
        )}

        {activeTab === 'applications' && <ApplicationsDashboard />}

        {activeTab === 'competencies' && <CompetenciesView />}

        {activeTab === 'profile' && (
          <ProfileView onOpenAtsModal={() => setIsAtsModalOpen(true)} />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAtsModal={() => setIsAtsModalOpen(true)}
      />

      {/* Modals */}
      <JobApplyModal
        job={selectedJobForApply}
        onClose={() => setSelectedJobForApply(null)}
        onSuccess={() => setActiveTab('applications')}
      />

      <AtsOptimizerModal
        isOpen={isAtsModalOpen}
        onClose={() => setIsAtsModalOpen(false)}
      />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      <AuthModal />

      {/* Floating Push / Real-time Toast Alert */}
      {toast && (
        <div className="fixed top-5 right-5 z-[100] max-w-sm w-full bg-slate-900/95 border border-indigo-500/50 rounded-2xl p-4 shadow-2xl backdrop-blur-md flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="p-2 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-400 shrink-0">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : toast.type === 'warning' ? (
              <AlertCircle className="w-5 h-5 text-amber-400" />
            ) : (
              <Bell className="w-5 h-5 text-cyan-400 animate-bounce" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-white leading-snug">{toast.title}</h4>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
          </div>
          <button
            onClick={dismissToast}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
