import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Building, 
  FileText, 
  ExternalLink, 
  Calendar, 
  ArrowRight,
  Filter,
  Sparkles,
  ChevronRight,
  Award
} from 'lucide-react';
import { Application, ApplicationStatus } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PIPELINE_STAGES: ApplicationStatus[] = [
  'Enviado',
  'Em Triagem',
  'Entrevista RH',
  'Entrevista Técnica',
  'Proposta',
];

export const ApplicationsDashboard: React.FC = () => {
  const { refreshNotifications, simulateBrowserPushNotification } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const data = await api.getApplications();
      setApplications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleAdvanceStatus = async (appId: number, currentStatus: ApplicationStatus) => {
    const currentIndex = PIPELINE_STAGES.indexOf(currentStatus);
    const nextIndex = Math.min(PIPELINE_STAGES.length - 1, currentIndex + 1);
    const nextStatus = PIPELINE_STAGES[nextIndex];

    try {
      await api.updateApplicationStatus(appId, nextStatus);
      await fetchApps();
      await refreshNotifications();
      simulateBrowserPushNotification(
        `🎉 Parabéns! Você avançou para: ${nextStatus}`,
        'Seu processo seletivo foi atualizado no painel em tempo real.'
      );
    } catch (err) {
      console.error(err);
    }
  };

  const filteredApps = statusFilter === 'Todos'
    ? applications
    : applications.filter(a => a.status.includes(statusFilter));

  const total = applications.length;
  const inScreening = applications.filter(a => a.status === 'Em Triagem').length;
  const inInterview = applications.filter(a => a.status.includes('Entrevista')).length;
  const inOffer = applications.filter(a => a.status === 'Proposta').length;
  const avgMatch = total > 0 
    ? Math.round(applications.reduce((acc, curr) => acc + (curr.match_percentage || 80), 0) / total)
    : 0;

  const getStatusBadgeColor = (status: ApplicationStatus) => {
    switch (status) {
      case 'Proposta':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-700';
      case 'Entrevista Técnica':
      case 'Entrevista RH':
        return 'bg-purple-950/80 text-purple-300 border-purple-700';
      case 'Em Triagem':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-700';
      case 'Enviado':
        return 'bg-indigo-950/80 text-indigo-300 border-indigo-700';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      
      {/* Header & Metrics */}
      <div className="space-y-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Painel de Candidaturas & Acompanhamento
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Acompanhe o status em tempo real de todas as vagas aplicadas diretamente pela plataforma.
          </p>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400">Total de Candidaturas</span>
            <p className="text-2xl font-extrabold text-white mt-1">{total}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[11px] font-semibold text-cyan-400">Em Triagem RH</span>
            <p className="text-2xl font-extrabold text-cyan-300 mt-1">{inScreening}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[11px] font-semibold text-purple-400">Entrevistas Agendadas</span>
            <p className="text-2xl font-extrabold text-purple-300 mt-1">{inInterview}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[11px] font-semibold text-emerald-400">Média de Chances ATS</span>
            <p className="text-2xl font-extrabold text-emerald-300 mt-1">
              {avgMatch > 0 ? `${avgMatch}%` : '--'}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 w-fit">
        {['Todos', 'Enviado', 'Em Triagem', 'Entrevista', 'Proposta'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === st ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="py-16 text-center space-y-2">
          <div className="inline-block w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Carregando histórico de candidaturas...</p>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="p-10 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
          <Send className="w-10 h-10 text-indigo-400 mx-auto" />
          <h3 className="text-base font-bold text-white">Nenhuma candidatura registrada neste filtro</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Vá até a aba "Vagas & Match" e use a "Candidatura Rápida em 1-Clique" para aplicar para posições com alta afinidade ATS.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <img
                    src={app.company_logo || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=60&h=60&fit=crop'}
                    alt={app.company}
                    className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-700 bg-slate-800"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400">{app.company}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                        {app.source || 'LinkedIn'}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-extrabold text-white mt-0.5">
                      {app.job_title}
                    </h3>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                      <span>{app.job_location}</span>
                      <span>•</span>
                      <span>{app.salary_text}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Calendar className="w-3 h-3" />
                        {new Date(app.applied_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Match Score & Status Badge */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${getStatusBadgeColor(app.status)}`}>
                    {app.status}
                  </span>
                  <span className="text-xs font-extrabold text-emerald-400 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {app.match_percentage}% de Chances
                  </span>
                </div>
              </div>

              {/* Progress Pipeline Visualization */}
              <div className="pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                  <span className="font-semibold text-slate-300">Etapa do Processo:</span>
                  <button
                    onClick={() => handleAdvanceStatus(app.id, app.status)}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 transition-colors"
                    title="Simular evolução pelo recrutador"
                  >
                    <span>Avançar Etapa (Simular RH)</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="grid grid-cols-5 gap-1.5">
                  {PIPELINE_STAGES.map((st, idx) => {
                    const currentIdx = PIPELINE_STAGES.indexOf(app.status);
                    const isCompleted = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;
                    return (
                      <div key={st} className="space-y-1">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            isCompleted ? (isCurrent ? 'bg-cyan-400' : 'bg-emerald-500') : 'bg-slate-800'
                          }`}
                        />
                        <p className={`text-[9px] truncate text-center font-medium ${
                          isCurrent ? 'text-cyan-300 font-bold' : isCompleted ? 'text-emerald-400' : 'text-slate-500'
                        }`}>
                          {st}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions: View Cover Letter */}
              {app.cover_letter && (
                <div className="pt-1 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedApp(app)}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Ver Carta de Apresentação Enviada</span>
                  </button>

                  {app.source_url && (
                    <a
                      href={app.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      <span>Canal Oficial</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}

            </div>
          ))}
        </div>
      )}

      {/* Cover Letter View Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Carta de Apresentação Otimizada</h3>
                <p className="text-xs text-slate-400">{selectedApp.job_title} • {selectedApp.company}</p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto font-mono">
              {selectedApp.cover_letter}
            </div>

            <div className="text-right">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
