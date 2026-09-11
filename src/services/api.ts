import { 
  User, 
  Competency, 
  Experience, 
  ATSProfile, 
  Job, 
  Application, 
  PushNotification, 
  JobFilters 
} from '../types';

const TOKEN_KEY = 'vagamatch_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Erro na requisição: ${res.status}`);
  }
  return data as T;
}

export const api = {
  // Health
  checkHealth: () => request<{ status: string; database: string; neonHost: string }>('/api/health'),

  // Auth
  register: (payload: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    headline?: string;
    location?: string;
    salaryMin?: number;
    salaryMax?: number;
    modality?: string;
    avatarUrl?: string;
  }) => request<{ token: string; user: User }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  login: (payload: { email: string; password: string }) => 
    request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMe: () => request<{
    user: User;
    competencies: Competency[];
    experiences: Experience[];
    atsProfile: any;
  }>('/api/auth/me'),

  updateProfile: (profile: Partial<User>) => request<{ success: boolean; user: User }>('/api/user/profile', {
    method: 'PUT',
    body: JSON.stringify(profile),
  }),

  // Competencies
  addCompetency: (payload: { name: string; category: string; proficiency: string; yearsExperience: number }) =>
    request<Competency>('/api/user/competencies', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  deleteCompetency: (id: number) =>
    request<{ success: boolean }>('/api/user/competencies/' + id, {
      method: 'DELETE',
    }),

  // Experiences
  addExperience: (payload: {
    company: string;
    role: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    isCurrent?: boolean;
    description?: string;
    achievements?: string;
  }) => request<Experience>('/api/user/experiences', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  deleteExperience: (id: number) =>
    request<{ success: boolean }>('/api/user/experiences/' + id, {
      method: 'DELETE',
    }),

  updateExperience: (id: number, payload: Partial<Experience>) =>
    request<{ success: boolean; experience: Experience }>('/api/user/experiences/' + id, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteResume: () =>
    request<{ success: boolean; message: string }>('/api/user/resume', {
      method: 'DELETE',
    }),

  updateResume: (payload: { bio?: string; headline?: string; experiences?: any[] }) =>
    request<{ success: boolean; message: string }>('/api/user/resume', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  // AI ATS Generation
  generateATSProfile: () => request<ATSProfile>('/api/ai/generate-ats-profile', {
    method: 'POST',
  }),

  parseResume: (resumeText: string) => request<{
    success: boolean;
    data: {
      fullName?: string;
      headline?: string;
      competencies: Array<{ name: string; category: string; proficiency: string }>;
      experiences: Array<{ company: string; role: string; description?: string; achievements?: string }>;
    }
  }>('/api/ai/parse-resume', {
    method: 'POST',
    body: JSON.stringify({ resumeText }),
  }),

  // Jobs
  getJobs: (filters?: Partial<JobFilters>) => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.modality && filters.modality !== 'Todos') params.append('modality', filters.modality);
    if (filters?.source && filters.source !== 'Todas') params.append('source', filters.source);
    if (filters?.minMatch) params.append('minMatch', filters.minMatch.toString());
    if (filters?.minSalary) params.append('minSalary', filters.minSalary.toString());

    const url = '/api/jobs' + (params.toString() ? '?' + params.toString() : '');
    return request<Job[]>(url);
  },

  getJobMatch: (jobId: number) => request<{
    matchPercentage: number;
    matchingKeywords: string[];
    missingKeywords: string[];
    matchSummary: string;
    interviewTips: string[];
  }>('/api/jobs/' + jobId + '/match'),

  generateCoverLetter: (jobId: number) => request<{ coverLetter: string }>('/api/ai/generate-cover-letter', {
    method: 'POST',
    body: JSON.stringify({ jobId }),
  }),

  applyJob: (payload: { jobId: number; coverLetter?: string; matchPercentage?: number; notes?: string }) =>
    request<{ success: boolean; message: string; application: Application }>('/api/applications/apply', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  searchMoreJobs: () => request<{ success: boolean; message: string }>('/api/jobs/search-more', {
    method: 'POST',
  }),

  // Applications
  getApplications: () => request<Application[]>('/api/applications'),

  updateApplicationStatus: (id: number, status: string) =>
    request<{ success: boolean; status: string }>('/api/applications/' + id + '/status', {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // Notifications
  getNotifications: () => request<PushNotification[]>('/api/notifications'),

  markAllNotificationsRead: () => request<{ success: boolean }>('/api/notifications/read-all', {
    method: 'POST',
  }),
};
