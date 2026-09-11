import React from 'react';
import { Briefcase, Send, Award, User, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAtsModal: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenAtsModal,
}) => {
  const { atsProfile } = useAuth();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5 shadow-2xl">
      <div className="grid grid-cols-5 items-center justify-around">
        
        {/* Vagas */}
        <button
          onClick={() => setActiveTab('jobs')}
          className={`flex flex-col items-center justify-center py-1 rounded-lg transition-colors ${
            activeTab === 'jobs' ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Briefcase className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Vagas</span>
        </button>

        {/* Candidaturas */}
        <button
          onClick={() => setActiveTab('applications')}
          className={`flex flex-col items-center justify-center py-1 rounded-lg transition-colors ${
            activeTab === 'applications' ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Send className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Aplicações</span>
        </button>

        {/* ATS IA Center Button */}
        <button
          onClick={onOpenAtsModal}
          className="flex flex-col items-center justify-center -mt-4 py-1"
        >
          <div className="flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 text-white shadow-lg shadow-indigo-500/40 ring-2 ring-slate-950 active:scale-95 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-cyan-300 mt-0.5">
            {atsProfile?.atsScore ? `${atsProfile.atsScore}%` : 'ATS IA'}
          </span>
        </button>

        {/* Competências */}
        <button
          onClick={() => setActiveTab('competencies')}
          className={`flex flex-col items-center justify-center py-1 rounded-lg transition-colors ${
            activeTab === 'competencies' ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Skills</span>
        </button>

        {/* Perfil */}
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center justify-center py-1 rounded-lg transition-colors ${
            activeTab === 'profile' ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Perfil</span>
        </button>

      </div>
    </div>
  );
};
