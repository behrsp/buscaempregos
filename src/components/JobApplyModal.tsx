import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  Building, 
  MapPin, 
  TrendingUp, 
  ExternalLink,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { Job } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface JobApplyModalProps {
  job: Job | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const JobApplyModal: React.FC<JobApplyModalProps> = ({ job, onClose, onSuccess }) => {
  const { user, refreshNotifications, simulateBrowserPushNotification } = useAuth();
  const [coverLetter, setCoverLetter] = useState('');
  const [generatingLetter, setGeneratingLetter] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (job) {
      // Auto generate tailored cover letter
      const generateLetter = async () => {
        setGeneratingLetter(true);
        try {
          const res = await api.generateCoverLetter(job.id);
          setCoverLetter(res.coverLetter);
        } catch (err) {
          setCoverLetter(
            `Olá equipe da ${job.company},\n\nTenho grande interesse na oportunidade de ${job.title}. Minhas competências técnicas e experiências em desenvolvimento de software estão totalmente alinhadas com os requisitos da vaga.\n\nAtenciosamente,\n${user?.fullName || 'Candidato'}`
          );
        } finally {
          setGeneratingLetter(false);
        }
      };

      generateLetter();
    }
  }, [job]);

  if (!job) return null;

  const handleApply = async () => {
    setSubmitting(true);
    try {
      await api.applyJob({
        jobId: job.id,
        coverLetter,
        matchPercentage: job.matchPercentage || 85,
        notes,
      });

      simulateBrowserPushNotification(
        `🚀 Candidatura Enviada para ${job.company}!`,
        `Sua aplicação para a vaga de ${job.title} (${job.source}) foi registrada com sucesso.`
      );

      await refreshNotifications();
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900/60 via-purple-900/60 to-slate-900 p-6 pb-4 border-b border-slate-800">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <img
                src={job.company_logo || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=60&h=60&fit=crop'}
                alt={job.company}
                className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-700 bg-slate-800"
              />
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-700/60">
                  {job.source}
                </span>
                <h3 className="text-base font-bold text-white mt-1 leading-snug">
                  {job.title}
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  {job.company} • {job.location}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Match compatibility banner */}
          <div className="mt-4 p-3 rounded-xl bg-slate-950/70 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300">Compatibilidade ATS:</span>
              <span className="text-emerald-400 font-extrabold">{job.matchPercentage || 85}%</span>
            </div>
            <span className="text-[10px] text-slate-400">
              {job.salary_text}
            </span>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          
          {/* Candidate information summary */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&h=160&fit=crop&crop=face'}
              alt={user?.fullName}
              className="w-10 h-10 rounded-xl object-cover ring-1 ring-indigo-500/60"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.fullName || 'Alexandre Silva'}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.headline || 'Desenvolvedor Full Stack'}</p>
              <p className="text-[10px] text-emerald-400 truncate">{user?.phone || '+55 (11) 98765-4321'} • {user?.email}</p>
            </div>
          </div>

          {/* Cover Letter */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Carta de Apresentação Gerada com IA (Personalizada)
              </label>
              {generatingLetter && (
                <span className="text-[10px] text-cyan-400 animate-pulse flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Redigindo com IA...
                </span>
              )}
            </div>
            <textarea
              rows={6}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="w-full p-3 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed"
            />
          </div>

          {/* Platform Auto-Apply Notice */}
          <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-[11px] text-slate-300 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-indigo-200">Envio Direto pela Plataforma VagaMatch</p>
              <p className="text-slate-400 mt-0.5 leading-relaxed">
                Nossa plataforma submeterá seu perfil completo, foto e currículo formatado para o canal da vaga ({job.source}) e registrará o acompanhamento em tempo real no seu painel.
              </p>
            </div>
          </div>

        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleApply}
            disabled={submitting}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Enviando Candidatura...' : 'Confirmar Envio da Candidatura'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
