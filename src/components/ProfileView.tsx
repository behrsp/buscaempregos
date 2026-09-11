import React, { useState } from 'react';
import { 
  User, 
  Camera, 
  MapPin, 
  Phone, 
  Mail, 
  DollarSign, 
  Briefcase, 
  Sparkles, 
  UploadCloud, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Calendar,
  FileText,
  Save,
  Building,
  ArrowRight,
  Edit3,
  AlertTriangle,
  X,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Experience } from '../types';

export const ProfileView: React.FC<{ onOpenAtsModal: () => void }> = ({ onOpenAtsModal }) => {
  const { 
    user, 
    experiences, 
    competencies,
    updateUserProfile, 
    addExperience, 
    updateExperience,
    removeExperience,
    deleteResume,
    updateResume,
    refreshUserData,
    simulateBrowserPushNotification 
  } = useAuth();

  // Profile Form States
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [headline, setHeadline] = useState(user?.headline || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [location, setLocation] = useState(user?.location || 'São Paulo, SP - Brasil');
  const [salaryMin, setSalaryMin] = useState(user?.salaryMin || 10000);
  const [salaryMax, setSalaryMax] = useState(user?.salaryMax || 18000);
  const [modality, setModality] = useState(user?.modality || 'Remoto');
  const [seniority, setSeniority] = useState(user?.seniority || 'Sênior');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Resume Upload & AI Parser State
  const [resumeText, setResumeText] = useState('');
  const [parsingResume, setParsingResume] = useState(false);
  const [resumeParsedSuccess, setResumeParsedSuccess] = useState(false);

  // Edit Resume Modal State
  const [isEditResumeModalOpen, setIsEditResumeModalOpen] = useState(false);
  const [editBio, setEditBio] = useState(user?.bio || '');
  const [editHeadline, setEditHeadline] = useState(user?.headline || '');
  const [savingResume, setSavingResume] = useState(false);

  // Delete Resume Confirmation Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingResume, setDeletingResume] = useState(false);

  // Add / Edit Experience State
  const [isAddingExp, setIsAddingExp] = useState(false);
  const [editingExpId, setEditingExpId] = useState<number | null>(null);
  const [expCompany, setExpCompany] = useState('');
  const [expRole, setExpRole] = useState('');
  const [expLocation, setExpLocation] = useState('');
  const [expStartDate, setExpStartDate] = useState('');
  const [expEndDate, setExpEndDate] = useState('');
  const [expIsCurrent, setExpIsCurrent] = useState(false);
  const [expDesc, setExpDesc] = useState('');
  const [expAchievements, setExpAchievements] = useState('');

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateUserProfile({
        fullName,
        headline,
        bio,
        phone,
        location,
        salaryMin: Number(salaryMin),
        salaryMax: Number(salaryMax),
        modality,
        seniority,
        avatarUrl,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleParseResume = async () => {
    if (!resumeText.trim()) return;
    setParsingResume(true);
    try {
      const result = await api.parseResume(resumeText);
      if (result.success && result.data) {
        if (result.data.fullName) setFullName(result.data.fullName);
        if (result.data.headline) setHeadline(result.data.headline);
        
        // Add parsed experiences
        if (result.data.experiences) {
          for (const exp of result.data.experiences) {
            await addExperience({
              company: exp.company,
              role: exp.role,
              location: 'Brasil',
              startDate: '2022',
              endDate: 'Atual',
              isCurrent: true,
              description: exp.description || '',
              achievements: exp.achievements || '',
            });
          }
        }
        await refreshUserData();
        setResumeParsedSuccess(true);
        simulateBrowserPushNotification(
          '📄 Currículo Processado com Sucesso!',
          'Seus dados e experiências foram estruturados e salvos no Neon DB.'
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setParsingResume(false);
    }
  };

  // Open Edit Resume Modal
  const openEditResume = () => {
    setEditBio(user?.bio || '');
    setEditHeadline(user?.headline || '');
    setIsEditResumeModalOpen(true);
  };

  // Save Edit Resume
  const handleSaveEditedResume = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingResume(true);
    try {
      await updateResume({
        bio: editBio,
        headline: editHeadline,
      });
      setHeadline(editHeadline);
      setBio(editBio);
      setIsEditResumeModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingResume(false);
    }
  };

  // Confirm Delete Resume
  const handleConfirmDeleteResume = async () => {
    setDeletingResume(true);
    try {
      await deleteResume();
      setResumeText('');
      setBio('');
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingResume(false);
    }
  };

  // Start Editing Specific Experience
  const startEditExperience = (exp: Experience) => {
    setEditingExpId(exp.id);
    setExpCompany(exp.company);
    setExpRole(exp.role);
    setExpLocation(exp.location || '');
    setExpStartDate(exp.start_date || '');
    setExpEndDate(exp.end_date || '');
    setExpIsCurrent(Boolean(exp.is_current));
    setExpDesc(exp.description || '');
    setExpAchievements(exp.achievements || '');
    setIsAddingExp(true);
  };

  const cancelExpForm = () => {
    setIsAddingExp(false);
    setEditingExpId(null);
    setExpCompany('');
    setExpRole('');
    setExpLocation('');
    setExpStartDate('');
    setExpEndDate('');
    setExpIsCurrent(false);
    setExpDesc('');
    setExpAchievements('');
  };

  const handleSaveExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expCompany || !expRole) return;

    try {
      if (editingExpId) {
        await updateExperience(editingExpId, {
          company: expCompany,
          role: expRole,
          location: expLocation || 'Brasil',
          start_date: expStartDate || '2022',
          end_date: expIsCurrent ? 'Atual' : (expEndDate || '2023'),
          is_current: expIsCurrent,
          description: expDesc,
          achievements: expAchievements,
        });
      } else {
        await addExperience({
          company: expCompany,
          role: expRole,
          location: expLocation || 'Brasil',
          startDate: expStartDate || '2022',
          endDate: expIsCurrent ? 'Atual' : (expEndDate || '2023'),
          isCurrent: expIsCurrent,
          description: expDesc,
          achievements: expAchievements,
        });
      }

      cancelExpForm();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <User className="w-6 h-6 text-indigo-400" />
            Perfil do Candidato & Currículo
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Configure suas informações de contato, foto oficial, preferências de salário e experiências para auto-preenchimento e candidaturas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAtsModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Score & Otimizador ATS</span>
          </button>
        </div>
      </div>

      {/* Dedicated Resume Action Box: Edit & Delete Buttons */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-800/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">
              Currículo Cadastrado no Neon DB
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
              {experiences.length} Cargos • {competencies.length} Competências
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Você pode editar os dados profissionais ou excluir o currículo completo a qualquer momento.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Botão Editar Currículo */}
          <button
            onClick={openEditResume}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
            title="Editar informações do currículo"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editar Currículo</span>
          </button>

          {/* Botão Excluir Currículo */}
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 font-bold text-xs active:scale-95 transition-all"
            title="Excluir currículo e experiências do banco de dados"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Excluir Currículo</span>
          </button>
        </div>
      </div>

      {/* Main Form: Personal & Career Settings */}
      <form onSubmit={handleSaveProfile} className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-xl">
        
        {/* Profile Photo & Headline */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-slate-800">
          <div className="relative group">
            {(avatarUrl || user?.avatarUrl) ? (
              <img
                src={avatarUrl || user?.avatarUrl}
                alt="Foto do perfil"
                className="w-20 h-20 rounded-2xl object-cover ring-2 ring-indigo-500/60 bg-slate-800 shadow-md"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-slate-700/80 flex flex-col items-center justify-center text-slate-400">
                <User className="w-8 h-8 text-indigo-400 mb-1" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Sem foto</span>
              </div>
            )}
            <label className="absolute inset-0 flex items-center justify-center bg-slate-950/70 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="w-6 h-6 text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </label>
          </div>

          <div className="flex-1 space-y-1">
            <h3 className="text-sm font-bold text-white">Sua Foto de Perfil Oficial</h3>
            <p className="text-xs text-slate-400">
              Esta foto será anexada ao formulário de envio rápido para empresas no LinkedIn e Google Jobs.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <label className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer">
                <Camera className="w-3.5 h-3.5" />
                <span>{(avatarUrl || user?.avatarUrl) ? 'Trocar foto do dispositivo' : 'Enviar foto do dispositivo'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>

              {(avatarUrl || user?.avatarUrl) && (
                <button
                  type="button"
                  onClick={() => {
                    setAvatarUrl('');
                    updateUserProfile({ avatarUrl: '' });
                  }}
                  className="inline-flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remover foto</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Basic Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Nome Completo</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp / Telefone de Contato</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+55 (11) 98765-4321"
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Headline */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Título Profissional (Headline ATS)
          </label>
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="Ex: Senior Full Stack Engineer | React • Node.js • TypeScript | Cloud & Microsserviços"
            className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Location & Seniority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Localização Base</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="São Paulo, SP - Brasil"
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Nível de Senioridade</label>
            <select
              value={seniority}
              onChange={(e) => setSeniority(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-medium"
            >
              <option value="Júnior">Júnior</option>
              <option value="Pleno">Pleno</option>
              <option value="Sênior">Sênior</option>
              <option value="Tech Lead">Tech Lead</option>
              <option value="Especialista">Especialista / Principal</option>
            </select>
          </div>
        </div>

        {/* Preferences: Salary Range & Modality */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
          <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Preferências Salariais e Modalidade (Usadas para Notificações Push em Tempo Real)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Pretensão Salarial Mínima (R$)</label>
              <input
                type="number"
                step="500"
                value={salaryMin}
                onChange={(e) => setSalaryMin(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Pretensão Salarial Máxima (R$)</label>
              <input
                type="number"
                step="500"
                value={salaryMax}
                onChange={(e) => setSalaryMax(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Modalidade Preferida</label>
              <select
                value={modality}
                onChange={(e) => setModality(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="Remoto">Remoto</option>
                <option value="Híbrido">Híbrido</option>
                <option value="Presencial">Presencial</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess ? (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Alterações salvas com sucesso no Neon DB!
            </span>
          ) : <span />}

          <button
            type="submit"
            disabled={savingProfile}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{savingProfile ? 'Salvando...' : 'Salvar Alterações'}</span>
          </button>
        </div>

      </form>

      {/* Automatic Resume Parser Box */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-900/50 space-y-4 shadow-xl">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-cyan-400" />
              Upload Automático de Currículo com IA
            </h3>
            <p className="text-xs text-slate-300">
              Cole o texto do seu currículo ou perfil do LinkedIn para que nossa IA extraia suas experiências e competências automaticamente.
            </p>
          </div>
        </div>

        <textarea
          rows={4}
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder="Cole aqui o texto do seu currículo ou resumo profissional (ex: histórico de cargos, empresas, tecnologias e conquistas)..."
          className="w-full p-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
        />

        <div className="flex items-center justify-between">
          {resumeParsedSuccess && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Currículo extraído e integrado ao banco de dados!
            </span>
          )}

          <button
            onClick={handleParseResume}
            disabled={parsingResume || !resumeText.trim()}
            className="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white font-bold text-xs shadow-md shadow-cyan-600/20 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{parsingResume ? 'Analisando com Gemini...' : 'Extrair & Preencher com IA'}</span>
          </button>
        </div>
      </div>

      {/* Experiences Timeline Section */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-400" />
              Experiências Profissionais
            </h3>
            <p className="text-xs text-slate-400">
              Histórico de empresas, cargos e realizações técnicas que alimentam os robôs de ATS.
            </p>
          </div>

          <button
            onClick={() => {
              if (isAddingExp) {
                cancelExpForm();
              } else {
                setIsAddingExp(true);
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-indigo-300 border border-slate-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{isAddingExp ? 'Cancelar' : 'Adicionar Cargo'}</span>
          </button>
        </div>

        {/* Add / Edit Experience Form */}
        {isAddingExp && (
          <form onSubmit={handleSaveExperience} className="p-4 rounded-xl bg-slate-950 border border-slate-700/80 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                {editingExpId ? <Edit3 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                <span>{editingExpId ? 'Editar Experiência Profissional' : 'Nova Experiência Profissional'}</span>
              </h4>
              <button
                type="button"
                onClick={cancelExpForm}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Empresa</label>
                <input
                  type="text"
                  required
                  value={expCompany}
                  onChange={(e) => setExpCompany(e.target.value)}
                  placeholder="Ex: Nubank, Mercado Livre"
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Cargo</label>
                <input
                  type="text"
                  required
                  value={expRole}
                  onChange={(e) => setExpRole(e.target.value)}
                  placeholder="Ex: Desenvolvedor Full Stack Sênior"
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Início</label>
                <input
                  type="text"
                  value={expStartDate}
                  onChange={(e) => setExpStartDate(e.target.value)}
                  placeholder="Ex: 2022"
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Término</label>
                <input
                  type="text"
                  disabled={expIsCurrent}
                  value={expEndDate}
                  onChange={(e) => setExpEndDate(e.target.value)}
                  placeholder={expIsCurrent ? 'Atual' : 'Ex: 2024'}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 disabled:opacity-40"
                />
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={expIsCurrent}
                    onChange={(e) => setExpIsCurrent(e.target.checked)}
                    className="rounded accent-indigo-500"
                  />
                  <span>Trabalho atualmente aqui</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Descrição das Responsabilidades</label>
              <textarea
                rows={2}
                value={expDesc}
                onChange={(e) => setExpDesc(e.target.value)}
                placeholder="Principais atribuições técnicas, ferramentas e liderança..."
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Principais Conquistas & Métricas de Impacto</label>
              <input
                type="text"
                value={expAchievements}
                onChange={(e) => setExpAchievements(e.target.value)}
                placeholder="Ex: Reduziu a latência da API em 40% e liderou migração para microserviços"
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={cancelExpForm}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-md"
              >
                {editingExpId ? 'Salvar Alterações no Cargo' : 'Adicionar Cargo'}
              </button>
            </div>
          </form>
        )}

        {/* Experiences List */}
        {experiences.length === 0 ? (
          <div className="p-6 text-center rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
            Nenhuma experiência profissional cadastrada ainda. Adicione acima para otimizar suas candidaturas.
          </div>
        ) : (
          <div className="space-y-3">
            {experiences.map((exp) => (
              <div
                key={exp.id}
                className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all flex items-start justify-between gap-3 group"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{exp.role}</h4>
                    <span className="text-xs font-semibold text-indigo-400">@ {exp.company}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    <span>{exp.start_date} — {exp.is_current ? 'Atual' : exp.end_date}</span>
                    {exp.location && <span>• {exp.location}</span>}
                  </p>
                  {exp.description && (
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {exp.description}
                    </p>
                  )}
                  {exp.achievements && (
                    <p className="text-xs text-emerald-400 font-medium mt-1">
                      ★ {exp.achievements}
                    </p>
                  )}
                </div>

                {/* Edit & Delete Action Buttons */}
                <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 shrink-0">
                  <button
                    onClick={() => startEditExperience(exp)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-indigo-950/40 transition-colors"
                    title="Editar cargo"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => removeExperience(exp.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
                    title="Remover experiência"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Modal: Editar Currículo Completo */}
      {isEditResumeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4 my-8 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Editar Currículo Profissional</h3>
              </div>
              <button
                onClick={() => setIsEditResumeModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedResume} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Título Profissional (Headline do CV)
                </label>
                <input
                  type="text"
                  value={editHeadline}
                  onChange={(e) => setEditHeadline(e.target.value)}
                  placeholder="Ex: Engenheiro de Software Sênior | Full Stack"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Resumo Profissional / Apresentação
                </label>
                <textarea
                  rows={6}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Descreva sua trajetória, principais realizações, projetos entregues e objetivos de carreira..."
                  className="w-full p-3 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400">
                💡 <strong>Dica:</strong> As experiências profissionais detalhadas e competências podem ser editadas diretamente na aba de cada seção.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditResumeModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingResume}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
                >
                  {savingResume ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirmação de Exclusão de Currículo */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-rose-800/40 rounded-3xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800/60">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Excluir Currículo?</h3>
                <p className="text-xs text-rose-300">Esta ação não pode ser desfeita.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Você está prestes a excluir seu currículo e limpar todas as experiências profissionais registradas no Neon DB.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteResume}
                disabled={deletingResume}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/30 transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{deletingResume ? 'Excluindo...' : 'Sim, Excluir Currículo'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
