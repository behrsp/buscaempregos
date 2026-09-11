import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  MapPin, 
  DollarSign, 
  Sparkles, 
  Check, 
  Database, 
  ShieldCheck,
  Camera,
  UploadCloud,
  Trash2,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states - clean for real user registration
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [headline, setHeadline] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('São Paulo, SP - Brasil');
  const [salaryMin, setSalaryMin] = useState(10000);
  const [salaryMax, setSalaryMax] = useState(18000);
  const [modality, setModality] = useState('Remoto');
  const [avatarUrl, setAvatarUrl] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register({
          email,
          password,
          fullName,
          headline: headline || 'Profissional de Tecnologia',
          phone,
          location,
          salaryMin,
          salaryMax,
          modality,
          avatarUrl: avatarUrl || '',
        });
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao processar autenticação.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-indigo-900/60 via-purple-900/60 to-slate-900 p-6 pb-4 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-300">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {mode === 'login' ? 'Acessar Conta' : 'Cadastro de Candidato'}
                </h2>
                <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Neon DB PostgreSQL + Autenticação Segura
                </p>
              </div>
            </div>
            <button
              onClick={closeAuthModal}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex p-1 mt-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                mode === 'register' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Criar Perfil Completo
            </button>
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                mode === 'login' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Já tenho conta (Login)
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 text-xs text-rose-300 bg-rose-950/40 border border-rose-800/60 rounded-xl">
              {error}
            </div>
          )}

          {mode === 'register' && (
            <>
              {/* Profile Photo selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Foto de Perfil para Recrutadores
                </label>

                {avatarUrl ? (
                  <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <img
                      src={avatarUrl}
                      alt="Sua foto de perfil"
                      className="w-16 h-16 rounded-xl object-cover ring-2 ring-indigo-500/50 bg-slate-900 shadow-md shrink-0"
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        Foto Carregada com Sucesso
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Esta foto será enviada às empresas junto com seu perfil.
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <label className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer flex items-center gap-1">
                          <Camera className="w-3.5 h-3.5" />
                          <span>Trocar foto</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                        </label>
                        <span className="text-slate-600">•</span>
                        <button
                          type="button"
                          onClick={() => setAvatarUrl('')}
                          className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remover</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-700/80 hover:border-indigo-500/80 rounded-2xl bg-slate-950/50 hover:bg-slate-950 transition-all cursor-pointer group text-center">
                    <div className="p-2.5 rounded-xl bg-indigo-950/50 text-indigo-400 group-hover:text-indigo-300 group-hover:scale-105 transition-all mb-2">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-200 group-hover:text-white">
                      Selecione a sua foto do perfil
                    </span>
                    <span className="text-[11px] text-slate-400 mt-0.5">
                      Clique para escolher um arquivo do seu dispositivo (JPG, PNG)
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                )}
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex: Carlos Oliveira"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Headline / Cargo Desejado */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Título Profissional / Headline ATS</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="Ex: Desenvolvedor Full Stack Sênior (React / Node / AWS)"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Phone & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">WhatsApp / Telefone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(11) 98765-4321"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Localização</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="São Paulo, SP"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Salary Expectations & Modality */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Salário Mín (R$)</label>
                  <input
                    type="number"
                    step="500"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Salário Máx (R$)</label>
                  <input
                    type="number"
                    step="500"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Modalidade</label>
                  <select
                    value={modality}
                    onChange={(e) => setModality(e.target.value)}
                    className="w-full px-2 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Remoto">Remoto</option>
                    <option value="Híbrido">Híbrido</option>
                    <option value="Presencial">Presencial</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">E-mail Corporativo ou Pessoal</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Senha Segura</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Clerk & Security Information Note */}
          <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-[11px] text-slate-300 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-indigo-200">Autenticação Integrada com Neon DB & Clerk</p>
              <p className="text-slate-400 mt-0.5">
                Suas senhas são criptografadas com bcrypt e persistidas diretamente na sua base PostgreSQL do Neon DB.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Processando...</span>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Entrar na Plataforma' : 'Criar Conta & Salvar no Neon DB'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
