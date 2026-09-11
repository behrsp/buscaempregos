import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  DollarSign, 
  Building, 
  Send, 
  Sparkles, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  RefreshCw,
  SlidersHorizontal,
  BookmarkCheck,
  Briefcase
} from 'lucide-react';
import { Job } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface JobsViewProps {
  onApplyJob: (job: Job) => void;
  onOpenAtsModal: () => void;
}

export const JobsView: React.FC<JobsViewProps> = ({ onApplyJob, onOpenAtsModal }) => {
  const { user, atsProfile, simulateBrowserPushNotification } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchingMore, setSearchingMore] = useState(false);
  const [selectedJobForModal, setSelectedJobForModal] = useState<Job | null>(null);
  const [aiMatchDetails, setAiMatchDetails] = useState<any>(null);
  const [loadingAiMatch, setLoadingAiMatch] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [modality, setModality] = useState('Todos');
  const [source, setSource] = useState('Todas');
  const [minMatch, setMinMatch] = useState(70);
  const [minSalary, setMinSalary] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await api.getJobs({
        search,
        modality,
        source,
        minMatch,
        minSalary: minSalary > 0 ? minSalary : undefined,
      });
      setJobs(data);
    } catch (err) {
      console.error('Erro ao buscar vagas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [search, modality, source, minMatch, minSalary]);

  const handleSearchMore = async () => {
    setSearchingMore(true);
    try {
      await api.searchMoreJobs();
      simulateBrowserPushNotification(
        '🔥 Novas Vagas Compatíveis Encontradas!',
        'Rastreamos novas oportunidades no LinkedIn e Google Jobs compatíveis com sua faixa salarial.'
      );
      await fetchJobs();
    } catch (err) {
      console.error(err);
    } finally {
      setSearchingMore(false);
    }
  };

  const handleOpenJobDetails = async (job: Job) => {
    setSelectedJobForModal(job);
    setLoadingAiMatch(true);
    try {
      const match = await api.getJobMatch(job.id);
      setAiMatchDetails(match);
    } catch (err) {
      setAiMatchDetails(null);
    } finally {
      setLoadingAiMatch(false);
    }
  };

  const getSourceBadgeStyle = (src: string) => {
    switch (src) {
      case 'LinkedIn':
        return 'bg-sky-950/80 text-sky-400 border-sky-800/60';
      case 'Google Jobs':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60';
      case 'Gupy':
        return 'bg-amber-950/80 text-amber-400 border-amber-800/60';
      default:
        return 'bg-indigo-950/80 text-indigo-400 border-indigo-800/60';
    }
  };

  const getMatchScoreBadge = (score: number) => {
    if (score >= 90) {
      return {
        text: `${score}% Chances Altíssimas`,
        bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
        bar: 'bg-emerald-500',
      };
    } else if (score >= 80) {
      return {
        text: `${score}% Alta Compatibilidade`,
        bg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40',
        bar: 'bg-cyan-500',
      };
    } else if (score >= 70) {
      return {
        text: `${score}% Bom Encaixe`,
        bg: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
        bar: 'bg-amber-500',
      };
    }
    return {
      text: `${score}% Compatível`,
      bg: 'bg-slate-700/30 text-slate-300 border-slate-700/50',
      bar: 'bg-indigo-500',
    };
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      
      {/* Top Banner / ATS Status Callout */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/70 via-slate-900 to-purple-950/60 border border-indigo-900/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Rastreamento Inteligente ATS
            </span>
            <span className="text-xs text-slate-400">
              LinkedIn & Google Jobs
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Vagas Otimizadas para o Seu Perfil
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Nosso algoritmo cruza suas competências técnicas com vagas ativas e calcula sua porcentagem real de chances com candidatura em 1-clique.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={handleSearchMore}
            disabled={searchingMore}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${searchingMore ? 'animate-spin' : ''}`} />
            <span>{searchingMore ? 'Rastreando Web...' : 'Buscar Novas Vagas com IA'}</span>
          </button>

          <button
            onClick={onOpenAtsModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 active:scale-95 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Otimizar ATS</span>
          </button>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por cargo, tecnologia (ex: React, Node, AWS), empresa..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-inner"
            />
          </div>

          {/* Quick Source Filter */}
          <div className="flex items-center gap-2">
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="px-3 py-2.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
            >
              <option value="Todas">Todas as Fontes</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Google Jobs">Google Jobs</option>
              <option value="Gupy">Gupy</option>
            </select>

            <select
              value={modality}
              onChange={(e) => setModality(e.target.value)}
              className="px-3 py-2.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
            >
              <option value="Todos">Todas Modalidades</option>
              <option value="Remoto">Remoto</option>
              <option value="Híbrido">Híbrido</option>
              <option value="Presencial">Presencial</option>
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2.5 rounded-xl border transition-colors flex items-center gap-1.5 text-xs font-semibold ${
                showFilters ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filtros</span>
            </button>
          </div>
        </div>

        {/* Expanded Advanced Filters Drawer */}
        {showFilters && (
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Min Match % Slider */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-300">Compatibilidade Mínima (Match %)</span>
                  <span className="text-cyan-400 font-bold">{minMatch}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="95"
                  step="5"
                  value={minMatch}
                  onChange={(e) => setMinMatch(Number(e.target.value))}
                  className="w-full accent-cyan-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>50% (Geral)</span>
                  <span>75% (Recomendado)</span>
                  <span>90%+ (Alta Prioridade)</span>
                </div>
              </div>

              {/* Min Salary Filter */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-300">Piso Salarial Mínimo</span>
                  <span className="text-emerald-400 font-bold">{minSalary === 0 ? 'Qualquer valor' : `R$ ${minSalary.toLocaleString()}/mês`}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20000"
                  step="2000"
                  value={minSalary}
                  onChange={(e) => setMinSalary(Number(e.target.value))}
                  className="w-full accent-emerald-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>R$ 0</span>
                  <span>R$ 10.000</span>
                  <span>R$ 20.000+</span>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Jobs Catalog */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="inline-block w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Rastreando oportunidades e calculando afinidade ATS...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
          <h3 className="text-base font-bold text-white">Nenhuma vaga encontrada com estes filtros</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Tente diminuir a porcentagem mínima de compatibilidade ou clique em "Buscar Novas Vagas com IA" para varrer novas posições.
          </p>
          <button
            onClick={() => { setMinMatch(50); setMinSalary(0); setSearch(''); }}
            className="px-4 py-2 text-xs font-semibold text-indigo-400 bg-indigo-950/50 border border-indigo-800 rounded-xl hover:bg-indigo-900/50 transition-colors"
          >
            Limpar Filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => {
            const badge = getMatchScoreBadge(job.matchPercentage || 80);
            return (
              <div
                key={job.id}
                className="group relative flex flex-col justify-between p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-indigo-500/60 hover:shadow-xl hover:shadow-indigo-500/10 transition-all"
              >
                <div>
                  
                  {/* Top Header: Company + Source + Match Score Badge */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={job.company_logo || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=80&h=80&fit=crop'}
                        alt={job.company}
                        className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-700 bg-slate-800"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                          {job.company}
                        </h4>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border mt-0.5 ${getSourceBadgeStyle(job.source)}`}>
                          {job.source}
                        </span>
                      </div>
                    </div>

                    {/* Match Score Badge */}
                    <div className="text-right">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-extrabold border ${badge.bg}`}>
                        <TrendingUp className="w-3.5 h-3.5" />
                        {badge.text}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-extrabold text-white leading-snug group-hover:text-indigo-300 transition-colors">
                    {job.title}
                  </h3>

                  {/* Location & Modality & Salary */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-2.5">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-300 font-medium">{job.modality}</span>
                    </span>
                    {job.salary_text && (
                      <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                        {job.salary_text}
                      </span>
                    )}
                  </div>

                  {/* Short Description */}
                  <p className="text-xs text-slate-400 mt-3 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  {/* ATS Matching Keywords */}
                  <div className="mt-3.5 flex flex-wrap gap-1.5">
                    {job.requirements.slice(0, 4).map((req, idx) => {
                      const isMatching = job.matchingSkills?.includes(req);
                      return (
                        <span
                          key={idx}
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${
                            isMatching
                              ? 'bg-indigo-950/70 text-indigo-300 border-indigo-700/60 font-semibold'
                              : 'bg-slate-950 text-slate-400 border-slate-800'
                          }`}
                        >
                          {isMatching && '✓ '}
                          {req}
                        </span>
                      );
                    })}
                    {job.requirements.length > 4 && (
                      <span className="text-[10px] text-slate-500 py-0.5">
                        +{job.requirements.length - 4} requisitos
                      </span>
                    )}
                  </div>

                </div>

                {/* Card Action Buttons */}
                <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center gap-2">
                  <button
                    onClick={() => onApplyJob(job)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Candidatura Rápida</span>
                  </button>

                  <button
                    onClick={() => handleOpenJobDetails(job)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs font-semibold flex items-center gap-1"
                    title="Ver análise detalhada de ATS"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="hidden sm:inline">Análise IA</span>
                  </button>

                  <a
                    href={job.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                    title={`Abrir vaga no ${job.source}`}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* AI Detailed Match Analysis Modal */}
      {selectedJobForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 my-8">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                  Relatório de Afinidade ATS & Entrevista
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  {selectedJobForModal.title}
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  {selectedJobForModal.company} • {selectedJobForModal.source}
                </p>
              </div>
              <button
                onClick={() => setSelectedJobForModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {loadingAiMatch ? (
              <div className="py-12 text-center space-y-2">
                <div className="inline-block w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-slate-400">Calculando compatibilidade e gerando dicas com Gemini...</p>
              </div>
            ) : aiMatchDetails ? (
              <div className="space-y-4 text-xs">
                
                {/* Match Score Display */}
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-950 to-slate-950 border border-indigo-800/50 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Chances Calculadas</span>
                    <p className="text-xl font-extrabold text-emerald-400">
                      {aiMatchDetails.matchPercentage}% de Compatibilidade
                    </p>
                  </div>
                  <Sparkles className="w-6 h-6 text-indigo-400" />
                </div>

                {/* Match Summary */}
                <div className="space-y-1">
                  <span className="font-bold text-slate-200">Parecer da IA:</span>
                  <p className="text-slate-400 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    {aiMatchDetails.matchSummary}
                  </p>
                </div>

                {/* Matching vs Missing Keywords */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="font-bold text-emerald-400 flex items-center gap-1 mb-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Suas Forças
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {aiMatchDetails.matchingKeywords.map((kw: string, i: number) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="font-bold text-amber-400 flex items-center gap-1 mb-1.5">
                      <AlertCircle className="w-3.5 h-3.5" /> Palavras a Enfatizar
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {aiMatchDetails.missingKeywords.length > 0 ? (
                        aiMatchDetails.missingKeywords.map((kw: string, i: number) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40">
                            {kw}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-500">Perfil 100% completo!</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Interview Tips */}
                {aiMatchDetails.interviewTips?.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="font-bold text-slate-200">Dicas Práticas para a Entrevista:</span>
                    <ul className="space-y-1 text-slate-300 list-disc list-inside">
                      {aiMatchDetails.interviewTips.map((tip: string, idx: number) => (
                        <li key={idx} className="leading-normal">{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

              </div>
            ) : null}

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => {
                  const job = selectedJobForModal;
                  setSelectedJobForModal(null);
                  onApplyJob(job);
                }}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Aplicar para Esta Vaga Agora</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
