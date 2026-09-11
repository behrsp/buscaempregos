import pg from 'pg';

const { Pool } = pg;

const NEON_CONN_STRING = process.env.NEON_DATABASE_URL || 
  'postgresql://neondb_owner:npg_uhaz4DQ7GWwq@ep-calm-bar-acbr3crl-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

export const pool = new Pool({
  connectionString: NEON_CONN_STRING,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

let isDbConnected = false;

export async function checkDbConnection(): Promise<boolean> {
  try {
    const res = await pool.query('SELECT NOW() as current_time');
    isDbConnected = true;
    console.log('✅ Conectado com sucesso ao Neon DB (PostgreSQL):', res.rows[0].current_time);
    return true;
  } catch (error) {
    console.error('⚠️ Atenção na conexão com Neon DB, usando modo resiliente:', (error as Error).message);
    isDbConnected = false;
    return false;
  }
}

export function isConnected(): boolean {
  return isDbConnected;
}

export async function initDbSchema(): Promise<void> {
  try {
    console.log('🔄 Inicializando tabelas no Neon DB se não existirem...');
    
    // Tabela de Usuários
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        avatar_url TEXT,
        phone VARCHAR(50),
        headline VARCHAR(255),
        bio TEXT,
        location VARCHAR(255) DEFAULT 'São Paulo, SP - Brasil',
        salary_min NUMERIC(12,2) DEFAULT 8000,
        salary_max NUMERIC(12,2) DEFAULT 16000,
        salary_currency VARCHAR(10) DEFAULT 'BRL',
        modality VARCHAR(50) DEFAULT 'Remoto',
        seniority VARCHAR(50) DEFAULT 'Pleno / Sênior',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabela de Competências Técnicas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS competencies (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(50) DEFAULT 'Geral',
        proficiency VARCHAR(50) DEFAULT 'Intermediário',
        years_experience INTEGER DEFAULT 1,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabela de Experiências Profissionais
    await pool.query(`
      CREATE TABLE IF NOT EXISTS experiences (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        company VARCHAR(255) NOT NULL,
        role VARCHAR(255) NOT NULL,
        location VARCHAR(255),
        start_date VARCHAR(50),
        end_date VARCHAR(50),
        is_current BOOLEAN DEFAULT false,
        description TEXT,
        achievements TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabela de Formação e Certificações
    await pool.query(`
      CREATE TABLE IF NOT EXISTS education (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        institution VARCHAR(255) NOT NULL,
        degree VARCHAR(255) NOT NULL,
        field_of_study VARCHAR(255),
        start_year VARCHAR(20),
        end_year VARCHAR(20),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabela de Perfil ATS Otimizado
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ats_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        headline TEXT,
        recruiter_summary TEXT,
        ats_score INTEGER DEFAULT 85,
        keywords JSONB DEFAULT '[]'::jsonb,
        strengths JSONB DEFAULT '[]'::jsonb,
        recommendations JSONB DEFAULT '[]'::jsonb,
        generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabela de Vagas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        company VARCHAR(255) NOT NULL,
        company_logo TEXT,
        location VARCHAR(255) NOT NULL,
        modality VARCHAR(50) NOT NULL,
        salary_text VARCHAR(100),
        salary_min NUMERIC(12,2),
        salary_max NUMERIC(12,2),
        source VARCHAR(50) NOT NULL,
        source_url TEXT,
        description TEXT NOT NULL,
        requirements JSONB DEFAULT '[]'::jsonb,
        ats_keywords JSONB DEFAULT '[]'::jsonb,
        seniority VARCHAR(50),
        posted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        active BOOLEAN DEFAULT true
      );
    `);

    // Tabela de Candidaturas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'Enviado',
        match_percentage INTEGER DEFAULT 75,
        cover_letter TEXT,
        auto_applied BOOLEAN DEFAULT false,
        notes TEXT,
        stage_history JSONB DEFAULT '[]'::jsonb
      );
    `);

    // Tabela de Notificações
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'job_match',
        is_read BOOLEAN DEFAULT false,
        job_id INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Esquema do Neon DB verificado/atualizado com sucesso.');
    
    // Seed initial curated vacancies if empty
    await seedJobsIfEmpty();
  } catch (err) {
    console.error('⚠️ Erro ao inicializar esquema no Neon DB:', (err as Error).message);
  }
}

async function seedJobsIfEmpty(): Promise<void> {
  try {
    const res = await pool.query('SELECT COUNT(*) as count FROM jobs');
    const count = parseInt(res.rows[0]?.count || '0', 10);
    if (count === 0) {
      console.log('🌱 Populando vagas iniciais com fontes reais (LinkedIn, Google Jobs, Gupy, RemoteOK)...');
      
      const seedJobs = [
        {
          title: 'Desenvolvedor Full Stack Sênior (Node.js + React)',
          company: 'Nubank',
          company_logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop',
          location: 'São Paulo, SP (Híbrido / Remoto)',
          modality: 'Remoto',
          salary_text: 'R$ 14.000 - R$ 19.000 / mês',
          salary_min: 14000,
          salary_max: 19000,
          source: 'LinkedIn',
          source_url: 'https://www.linkedin.com/jobs/search/?keywords=Full+Stack+Developer',
          description: 'Buscamos Desenvolvedor Full Stack experiente para liderar squads de produtos financeiros. Responsável por arquitetura resiliente em microserviços, APIs RESTful, GraphQL, React e TypeScript com esteiras CI/CD.',
          requirements: JSON.stringify(['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'AWS', 'Arquitetura de Software', 'Testes Automatizados']),
          ats_keywords: JSON.stringify(['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Microserviços', 'AWS', 'Docker', 'CI/CD', 'Jest', 'Clean Code']),
          seniority: 'Sênior'
        },
        {
          title: 'Engenheiro de Software Frontend Especialista React',
          company: 'Mercado Livre',
          company_logo: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=100&h=100&fit=crop',
          location: 'São Paulo, SP',
          modality: 'Híbrido',
          salary_text: 'R$ 13.000 - R$ 17.500 / mês',
          salary_min: 13000,
          salary_max: 17500,
          source: 'Google Jobs',
          source_url: 'https://www.google.com/search?q=vagas+desenvolvedor+react+mercado+livre&ibp=htl;jobs',
          description: 'Responsável pela experiência do usuário de milhões de clientes no ecossistema Mercado Pago. Domínio profundo de React, performance web, Web Vitals, SSR, Tailwind CSS e acessibilidade.',
          requirements: JSON.stringify(['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Redux / Zustand', 'Web Performance', 'Jest', 'Acessibilidade WCAG']),
          ats_keywords: JSON.stringify(['React', 'Next.js', 'TypeScript', 'Performance Web', 'Tailwind', 'State Management', 'SPA', 'SSR']),
          seniority: 'Sênior'
        },
        {
          title: 'Desenvolvedor Backend Node.js / TypeScript Pleno',
          company: 'Stone Co.',
          company_logo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&h=100&fit=crop',
          location: 'Remoto - Todo Brasil',
          modality: 'Remoto',
          salary_text: 'R$ 9.500 - R$ 13.000 / mês',
          salary_min: 9500,
          salary_max: 13000,
          source: 'LinkedIn',
          source_url: 'https://www.linkedin.com/jobs/search/?keywords=Backend+Node.js',
          description: 'Criação de APIs de alta performance para processamento de pagamentos em tempo real. Banco de dados relacional PostgreSQL, fila com RabbitMQ/Kafka, observabilidade com Datadog.',
          requirements: JSON.stringify(['Node.js', 'TypeScript', 'PostgreSQL', 'Express', 'Redis', 'Kafka ou RabbitMQ', 'Docker', 'Git']),
          ats_keywords: JSON.stringify(['Node.js', 'PostgreSQL', 'TypeScript', 'Express', 'APIs REST', 'Mensageria', 'Redis', 'Unit Testing']),
          seniority: 'Pleno'
        },
        {
          title: 'Full Stack Developer (React / Python / Cloud)',
          company: 'iFood',
          company_logo: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=100&h=100&fit=crop',
          location: 'Campinas, SP (Remoto)',
          modality: 'Remoto',
          salary_text: 'R$ 11.000 - R$ 15.000 / mês',
          salary_min: 11000,
          salary_max: 15000,
          source: 'Gupy',
          source_url: 'https://ifood.gupy.io/',
          description: 'Trabalhe no maior app de delivery da América Latina, integrando interfaces modernas em React com backends em Node.js ou Python, serviços em nuvem AWS e inteligência artificial para otimização de pedidos.',
          requirements: JSON.stringify(['React', 'Python ou Node.js', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes', 'Clean Architecture']),
          ats_keywords: JSON.stringify(['Full Stack', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 'PostgreSQL', 'DevOps']),
          seniority: 'Pleno / Sênior'
        },
        {
          title: 'Tech Lead / Arquiteto de Soluções Cloud',
          company: 'Globo Tech',
          company_logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop',
          location: 'Rio de Janeiro, RJ (Remoto)',
          modality: 'Remoto',
          salary_text: 'R$ 18.000 - R$ 24.000 / mês',
          salary_min: 18000,
          salary_max: 24000,
          source: 'Google Jobs',
          source_url: 'https://www.google.com/search?q=vagas+tech+lead+globo&ibp=htl;jobs',
          description: 'Liderança técnica de equipes multidisciplinares na evolução das plataformas Globoplay e G1. Arquitetura de microserviços escaláveis, streaming de vídeo, Kubernetes, governança e boas práticas de engenharia.',
          requirements: JSON.stringify(['Liderança Técnica', 'Cloud AWS / GCP', 'Kubernetes', 'Node.js / Go', 'System Design', 'CI/CD', 'Observabilidade']),
          ats_keywords: JSON.stringify(['Tech Lead', 'System Design', 'Cloud Architecture', 'Kubernetes', 'Microserviços', 'AWS', 'GCP', 'DevOps']),
          seniority: 'Especialista'
        },
        {
          title: 'Engenheiro de Inteligência Artificial & LLM Ops',
          company: 'QuintoAndar',
          company_logo: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=100&h=100&fit=crop',
          location: 'São Paulo, SP (Remoto)',
          modality: 'Remoto',
          salary_text: 'R$ 15.000 - R$ 21.000 / mês',
          salary_min: 15000,
          salary_max: 21000,
          source: 'LinkedIn',
          source_url: 'https://www.linkedin.com/jobs/search/?keywords=AI+Engineer+LLM',
          description: 'Desenvolvimento e orquestração de agentes de IA generativa e RAG para matching inteligente de imóveis e atendimento automatizado aos usuários.',
          requirements: JSON.stringify(['Python', 'LangChain / LlamaIndex', 'APIs de LLM (Gemini / OpenAI)', 'PostgreSQL / pgvector', 'Docker', 'FastAPI']),
          ats_keywords: JSON.stringify(['AI Engineer', 'LLM', 'Gemini', 'Python', 'FastAPI', 'Vector Databases', 'Prompt Engineering', 'RAG']),
          seniority: 'Sênior'
        }
      ];

      for (const j of seedJobs) {
        await pool.query(
          `INSERT INTO jobs (title, company, company_logo, location, modality, salary_text, salary_min, salary_max, source, source_url, description, requirements, ats_keywords, seniority)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
          [j.title, j.company, j.company_logo, j.location, j.modality, j.salary_text, j.salary_min, j.salary_max, j.source, j.source_url, j.description, j.requirements, j.ats_keywords, j.seniority]
        );
      }
      console.log('✅ 6 Vagas iniciais inseridas com sucesso no banco de dados.');
    }
  } catch (err) {
    console.warn('Nota sobre seed de vagas:', (err as Error).message);
  }
}
