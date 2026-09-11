import React, { useState } from 'react';
import { 
  Award, 
  Plus, 
  Trash2, 
  Sparkles, 
  Tag, 
  Layers, 
  Check, 
  Database,
  Cpu,
  Star,
  Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SUGGESTED_ATS_SKILLS = [
  { name: 'TypeScript', category: 'Frontend', proficiency: 'Avançado' },
  { name: 'React.js', category: 'Frontend', proficiency: 'Avançado' },
  { name: 'Node.js', category: 'Backend', proficiency: 'Avançado' },
  { name: 'PostgreSQL', category: 'Database', proficiency: 'Avançado' },
  { name: 'Docker', category: 'Cloud/DevOps', proficiency: 'Intermediário' },
  { name: 'AWS (Amazon Web Services)', category: 'Cloud/DevOps', proficiency: 'Intermediário' },
  { name: 'Next.js', category: 'Frontend', proficiency: 'Avançado' },
  { name: 'Tailwind CSS', category: 'Frontend', proficiency: 'Avançado' },
  { name: 'Python', category: 'Backend', proficiency: 'Intermediário' },
  { name: 'Arquitetura de Microsserviços', category: 'Backend', proficiency: 'Avançado' },
  { name: 'CI/CD Pipelines', category: 'Cloud/DevOps', proficiency: 'Intermediário' },
  { name: 'Testes com Jest / Cypress', category: 'Frontend', proficiency: 'Avançado' },
  { name: 'APIs RESTful & GraphQL', category: 'Backend', proficiency: 'Avançado' },
  { name: 'Inteligência Artificial & LLMs', category: 'AI/Data', proficiency: 'Avançado' },
  { name: 'Liderança Técnica & Mentoria', category: 'Soft Skill', proficiency: 'Especialista' },
];

export const CompetenciesView: React.FC = () => {
  const { competencies, addCompetency, removeCompetency, generateATS } = useAuth();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<any>('Frontend');
  const [proficiency, setProficiency] = useState<any>('Avançado');
  const [yearsExperience, setYearsExperience] = useState(3);
  const [adding, setAdding] = useState(false);
  const [filterCategory, setFilterCategory] = useState('Todas');
  const [search, setSearch] = useState('');

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setAdding(true);
    try {
      await addCompetency({
        name: name.trim(),
        category,
        proficiency,
        yearsExperience: Number(yearsExperience) || 1,
      });
      setName('');
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const handleQuickAdd = async (skill: typeof SUGGESTED_ATS_SKILLS[0]) => {
    const exists = competencies.some(c => c.name.toLowerCase() === skill.name.toLowerCase());
    if (exists) return;

    try {
      await addCompetency({
        name: skill.name,
        category: skill.category,
        proficiency: skill.proficiency,
        yearsExperience: 3,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = competencies.filter(c => {
    const matchCat = filterCategory === 'Todas' || c.category === filterCategory;
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const getProficiencyColor = (prof: string) => {
    switch (prof) {
      case 'Especialista':
        return 'bg-purple-950/80 text-purple-300 border-purple-800/60';
      case 'Avançado':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60';
      case 'Intermediário':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-800/60';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-indigo-400" />
            Competências Técnicas & Palavras-chave ATS
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Cadastre suas stacks, frameworks e soft skills para potencializar o cruzamento automático de vagas e o ranqueamento ATS.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-indigo-300">
            {competencies.length} Competências Ativas
          </span>
        </div>
      </div>

      {/* Add Competency Card */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Plus className="w-4 h-4 text-indigo-400" />
          Adicionar Nova Competência ao Neon DB
        </h2>

        <form onSubmit={handleAddSkill} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-1">
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Nome da Competência / Tech</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: React, PostgreSQL, Docker"
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Categoria</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-medium"
            >
              <option value="Frontend">Frontend</option>
              <option value="Backend">Backend</option>
              <option value="Database">Banco de Dados</option>
              <option value="Cloud/DevOps">Cloud & DevOps</option>
              <option value="Mobile">Mobile</option>
              <option value="AI/Data">IA & Dados</option>
              <option value="Soft Skill">Soft Skill</option>
              <option value="Geral">Geral</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Nível de Proficiência</label>
            <select
              value={proficiency}
              onChange={(e) => setProficiency(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-medium"
            >
              <option value="Iniciante">Iniciante</option>
              <option value="Intermediário">Intermediário</option>
              <option value="Avançado">Avançado</option>
              <option value="Especialista">Especialista</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={adding}
              className="w-full py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{adding ? 'Salvando...' : 'Adicionar'}</span>
            </button>
          </div>
        </form>

        {/* Quick Add Suggestions Bar */}
        <div className="pt-2 border-t border-slate-800/80">
          <p className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Adicionar rapidamente competências de alta demanda em ATS:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_ATS_SKILLS.map((s, idx) => {
              const alreadyHas = competencies.some(c => c.name.toLowerCase() === s.name.toLowerCase());
              return (
                <button
                  key={idx}
                  onClick={() => handleQuickAdd(s)}
                  disabled={alreadyHas}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                    alreadyHas
                      ? 'bg-slate-950 text-slate-600 border-slate-800/50 cursor-not-allowed'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-indigo-500 hover:text-white hover:bg-indigo-950/40'
                  }`}
                >
                  {alreadyHas ? <Check className="w-3 h-3 text-emerald-500" /> : <Plus className="w-3 h-3 text-indigo-400" />}
                  <span>{s.name}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrar por nome da tecnologia..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1">
          {['Todas', 'Frontend', 'Backend', 'Database', 'Cloud/DevOps', 'Soft Skill'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                filterCategory === cat ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Competencies List Grid */}
      {filtered.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <Tag className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-xs text-slate-400">Nenhuma competência encontrada neste filtro.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((comp) => (
            <div
              key={comp.id}
              className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/90 hover:border-slate-700 flex items-center justify-between gap-3 transition-all group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">{comp.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getProficiencyColor(comp.proficiency)}`}>
                    {comp.proficiency}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {comp.category} • {comp.years_experience} {comp.years_experience === 1 ? 'ano' : 'anos'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => removeCompetency(comp.id)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 transition-colors opacity-80 group-hover:opacity-100"
                title="Remover competência"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
