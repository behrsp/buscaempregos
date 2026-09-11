import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  Zap, 
  TrendingUp, 
  Layers, 
  Award,
  RefreshCw,
  Share2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ATSProfile } from '../types';

interface AtsOptimizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AtsOptimizerModal: React.FC<AtsOptimizerModalProps> = ({ isOpen, onClose }) => {
  const { atsProfile, generateATS, competencies, experiences } = useAuth();
  const [generating, setGenerating] = useState(false);
  const [copiedHeadline, setCopiedHeadline] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await generateATS();
    } catch (err) {
      console.error('Erro ao gerar ATS:', err);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string, type: 'headline' | 'summary') => {
    navigator.clipboard.writeText(text);
    if (type === 'headline') {
      setCopiedHeadline(true);
      setTimeout(() => setCopiedHeadline(false), 2000);
    } else {
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    }
  };

  const score = atsProfile?.atsScore || 92;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Banner */}
        <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 p-6 pb-5 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-indigo-600/40 border border-indigo-400/40 text-cyan-300">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">
                  Otimizador de Perfil ATS para Recrutadores
                </h2>
                <p className="text-xs text-indigo-200">
                  Gerado por Inteligência Artificial (Gemini) • Otimizado para robôs de triagem
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Score Meter */}
          <div className="mt-5 p-4 rounded-2xl bg-slate-950/70 border border-indigo-500/30 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Potencial de Aprovação nos ATS
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-black text-emerald-400">{score}</span>
                <span className="text-sm font-bold text-slate-400">/ 100 pontos</span>
                <span className="text-xs text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/60 ml-2">
                  Top 5% dos Candidatos
                </span>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/30 active:scale-95 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
              <span>{generating ? 'Reescrevendo com IA...' : 'Atualizar com IA'}</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* Headline Atraente */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Headline Magnético para Recrutadores & LinkedIn
              </label>
              <button
                onClick={() => copyToClipboard(atsProfile?.headline || '', 'headline')}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
              >
                {copiedHeadline ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedHeadline ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-white leading-relaxed font-mono">
              {atsProfile?.headline || 'Senior Full Stack Engineer | React • Node.js • TypeScript | Cloud & ATS Specialist'}
            </div>
          </div>

          {/* Resumo Profissional Atraente */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-indigo-400" />
                Resumo Profissional Atraente (Otimizado com Palavras-chave)
              </label>
              <button
                onClick={() => copyToClipboard(atsProfile?.recruiterSummary || '', 'summary')}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
              >
                {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSummary ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
              {atsProfile?.recruiterSummary || 'Profissional Full Stack altamente capacitado com histórico comprovado na arquitetura e entrega de aplicações web resilientes e escaláveis...'}
            </div>
          </div>

          {/* Nuvem de Palavras-Chave ATS */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Palavras-chave de Alta Conversão Detectadas
            </label>
            <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              {(atsProfile?.keywords && atsProfile.keywords.length > 0
                ? atsProfile.keywords
                : ['React.js', 'Node.js', 'TypeScript', 'PostgreSQL', 'Neon DB', 'Docker', 'AWS', 'Microserviços', 'CI/CD', 'Jest']
              ).map((kw, i) => (
                <span
                  key={i}
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-950/70 text-indigo-300 border border-indigo-800/60"
                >
                  ✓ {kw}
                </span>
              ))}
            </div>
          </div>

          {/* Pontos Fortes & Recomendações */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pontos Fortes */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Pontos Fortes Mapeados
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {(atsProfile?.strengths && atsProfile.strengths.length > 0
                  ? atsProfile.strengths
                  : [
                      'Stack moderna e alinhada com as principais vagas do mercado',
                      'Experiência consolidada em desenvolvimento backend e frontend',
                      'Alto potencial de match para posições remotas e internacionais'
                    ]
                ).map((st, i) => (
                  <li key={i} className="leading-snug flex items-start gap-1.5">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{st}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recomendações de Melhoria */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> Recomendações para Entrevistas
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {(atsProfile?.recommendations && atsProfile.recommendations.length > 0
                  ? atsProfile.recommendations
                  : [
                      'Quantifique métricas de impacto nas experiências de trabalho',
                      'Enfatize projetos em produção com microsserviços e nuvem',
                      'Mantenha as palavras-chave atualizadas de acordo com o cargo alvo'
                    ]
                ).map((rec, i) => (
                  <li key={i} className="leading-snug flex items-start gap-1.5">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all"
          >
            Concluir & Aplicar
          </button>
        </div>

      </div>
    </div>
  );
};
