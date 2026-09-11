export interface User {
  id: number;
  email: string;
  fullName: string;
  avatarUrl: string;
  phone?: string;
  headline?: string;
  bio?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  modality?: string;
  seniority?: string;
  createdAt?: string;
}

export interface Competency {
  id: number;
  user_id?: number;
  name: string;
  category: 'Frontend' | 'Backend' | 'Database' | 'Cloud/DevOps' | 'Mobile' | 'AI/Data' | 'Soft Skill' | 'Geral';
  proficiency: 'Iniciante' | 'Intermediário' | 'Avançado' | 'Especialista';
  years_experience: number;
}

export interface Experience {
  id: number;
  user_id?: number;
  company: string;
  role: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
  description?: string;
  achievements?: string;
}

export interface Education {
  id: number;
  user_id?: number;
  institution: string;
  degree: string;
  field_of_study?: string;
  start_year?: string;
  end_year?: string;
}

export interface ATSProfile {
  id?: number;
  user_id?: number;
  headline: string;
  recruiterSummary: string;
  atsScore: number;
  keywords: string[];
  strengths: string[];
  recommendations: string[];
  generatedAt?: string;
}

export interface Job {
  id: number;
  title: string;
  company: string;
  company_logo?: string;
  location: string;
  modality: 'Remoto' | 'Híbrido' | 'Presencial';
  salary_text: string;
  salary_min?: number;
  salary_max?: number;
  source: 'LinkedIn' | 'Google Jobs' | 'Gupy' | 'Indeed' | 'RemoteOK' | 'Catho';
  source_url: string;
  description: string;
  requirements: string[];
  ats_keywords: string[];
  seniority?: string;
  matchPercentage?: number;
  matchingSkills?: string[];
  missingSkills?: string[];
}

export type ApplicationStatus = 'Enviado' | 'Em Triagem' | 'Entrevista RH' | 'Entrevista Técnica' | 'Proposta' | 'Rejeitado';

export interface Application {
  id: number;
  user_id: number;
  job_id: number;
  applied_at: string;
  status: ApplicationStatus;
  match_percentage: number;
  cover_letter?: string;
  auto_applied?: boolean;
  notes?: string;
  job_title?: string;
  company?: string;
  company_logo?: string;
  job_location?: string;
  modality?: string;
  salary_text?: string;
  source?: string;
  source_url?: string;
}

export interface PushNotification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'job_match' | 'application_update' | 'ats_alert' | 'system';
  is_read: boolean;
  job_id?: number;
  created_at: string;
}

export interface JobFilters {
  search: string;
  modality: string;
  source: string;
  minMatch: number;
  minSalary: number;
}
