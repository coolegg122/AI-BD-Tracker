// In local dev, Vite proxy forwards /api/* to the Python backend (no CORS needed).
// In production (Vercel), /api/* routes to serverless functions natively.
const API_BASE_URL = '/api/v1';

// Helper function to get the auth token from localStorage
const getAuthToken = () => {
  try {
    return localStorage.getItem('token');
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    return null;
  }
};

// Helper function to add auth header to requests
const getAuthHeaders = (includeContentType = true) => {
  const token = getAuthToken();
  const headers = {};

  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/** FastAPI often returns JSON; proxies may return HTML/plain text on 5xx — never assume JSON. */
async function readJsonSafe(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { detail: text.trim().slice(0, 400) };
  }
}

function detailFromBody(data) {
  if (!data || data.detail == null) return null;
  const d = data.detail;
  if (typeof d === 'string') return d;
  if (Array.isArray(d)) {
    return d.map((e) => (e && e.msg) ? e.msg : JSON.stringify(e)).join('; ');
  }
  return String(d);
}

export const api = {
  // Universal extraction from raw text using AI Engine
  extractInfo: async (raw_text, type = "project") => {
    try {
      const response = await fetch(`${API_BASE_URL}/extract`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ raw_text, type }),
      });

      if (!response.ok) {
        const errorData = await readJsonSafe(response);
        throw new Error(detailFromBody(errorData) || `AI Extraction failed: ${response.statusText}`);
      }
      return await readJsonSafe(response);
    } catch (error) {
      console.error('ExtractInfo API error:', error);
      throw error;
    }
  },

  // NEW (Phase 33): Universal extraction and auto-persistence
  extractUniversal: async (raw_text) => {
    try {
      const response = await fetch(`${API_BASE_URL}/smart-input/universal`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ raw_text }),
      });

      if (!response.ok) {
        const errorData = await readJsonSafe(response);
        throw new Error(detailFromBody(errorData) || `Universal AI Extraction failed: ${response.statusText}`);
      }
      return await readJsonSafe(response);
    } catch (error) {
      console.error('ExtractUniversal API error:', error);
      throw error;
    }
  },

  // Get all projects
  getProjects: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        headers: getAuthHeaders(false) // Don't include content-type for GET requests
      });
      if (!response.ok) {
          throw new Error(`Failed to fetch projects: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('GetProjects API error:', error);
      throw error;
    }
  },

  // Save/Create a new project
  createProject: async (projectData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(projectData),
      });
      if (!response.ok) {
        const errorData = await readJsonSafe(response);
        throw new Error(detailFromBody(errorData) || `Create project failed: ${response.statusText}`);
      }
      return await readJsonSafe(response);
    } catch (error) {
      console.error('CreateProject API error:', error);
      throw error;
    }
  },

  // Update a project's stage
  updateProjectStage: async (projectId, stage) => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ stage }),
      });
      if (!response.ok) {
          throw new Error(`Failed to update project stage: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('UpdateProjectStage API error:', error);
      throw error;
    }
  },

  // Get project history
  getProjectHistory: async (projectId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/history`, {
        headers: getAuthHeaders(false) // Don't include content-type for GET requests
      });
      if (!response.ok) {
          throw new Error(`Failed to fetch project history: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('GetProjectHistory API error:', error);
      throw error;
    }
  },

  createProjectHistory: async (projectId, historyData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/history`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(historyData),
      });
      if (!response.ok) {
          throw new Error(`Failed to create project history: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('CreateProjectHistory API error:', error);
      throw error;
    }
  },

  // --- Phase 13: Contacts ---
  getContacts: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/contacts`, {
        headers: getAuthHeaders(false) // Don't include content-type for GET requests
      });
      if (!response.ok) {
          throw new Error(`Failed to fetch contacts: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('GetContacts API error:', error);
      throw error;
    }
  },

  createContact: async (contactData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/contacts`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(contactData),
      });
      if (!response.ok) {
        let detail = `HTTP ${response.status}`;
        try {
          const text = await response.text();
          if (text) {
            try {
              const json = JSON.parse(text);
              detail = json.detail ? JSON.stringify(json.detail) : text;
            } catch (_) { detail = text; }
          }
        } catch (_) {}
        throw new Error(`Create contact failed: ${detail}`);
      }
      return response.json();
    } catch (error) {
      console.error('CreateContact API error:', error);
      throw error;
    }
  },

  // --- Phase 14: Competitive Intelligence ---
  getCompanyIntelligence: async (companyName) => {
    try {
      // URL encode the company name to handle spaces / special characters safely
      const response = await fetch(`${API_BASE_URL}/intelligence/${encodeURIComponent(companyName)}`, {
        headers: getAuthHeaders(false) // Don't include content-type for GET requests
      });
      if (!response.ok) {
          throw new Error(`Failed to fetch intelligence for ${companyName}: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('GetCompanyIntelligence API error:', error);
      throw error;
    }
  },

  // --- Phase 5: Mock UI Endpoints ---
  getDashboardMock: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/mock/dashboard`, {
        headers: getAuthHeaders(false) // Don't include content-type for GET requests
      });
      if (!response.ok) throw new Error('Failed to fetch dashboard mock');
      return response.json();
    } catch (error) {
      console.error('GetDashboardMock API error:', error);
      throw error;
    }
  },

  getScheduleMock: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/mock/schedule`, {
        headers: getAuthHeaders(false) // Don't include content-type for GET requests
      });
      if (!response.ok) throw new Error('Failed to fetch schedule mock');
      return response.json();
    } catch (error) {
      console.error('GetScheduleMock API error:', error);
      throw error;
    }
  },

  getNotificationsMock: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/mock/notifications`, {
        headers: getAuthHeaders(false) // Don't include content-type for GET requests
      });
      if (!response.ok) throw new Error('Failed to fetch notifications mock');
      return response.json();
    } catch (error) {
      console.error('GetNotificationsMock API error:', error);
      throw error;
    }
  },

  // --- Phase 22: Inbound Ingestion Inbox ---
  getPendingIngestions: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/ingestion/pending`, {
        headers: getAuthHeaders(false) // Don't include content-type for GET requests
      });
      if (!response.ok) throw new Error('Failed to fetch pending ingestions');
      return response.json();
    } catch (error) {
      console.error('GetPendingIngestions API error:', error);
      throw error;
    }
  },

  processIngestion: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ingestion/${id}/process`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        let detail = `HTTP ${response.status}`;
        try {
          const text = await response.text();
          if (text) {
            try {
              const json = JSON.parse(text);
              detail = json.detail ? JSON.stringify(json.detail) : text;
            } catch (_) { detail = text; }
          }
        } catch (_) {}
        throw new Error(`processIngestion failed: ${detail}`);
      }
      return response.json();
    } catch (error) {
      console.error('ProcessIngestion API error:', error);
      throw error;
    }
  },

  deleteIngestion: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ingestion/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to discard ingestion');
      return response.json();
    } catch (error) {
      console.error('DeleteIngestion API error:', error);
      throw error;
    }
  },

  // --- Phase 23: Zoho Mail Sync ---
  syncIngestion: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/ingestion/sync`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Mail sync failed');
      return response.json();
    } catch (error) {
      console.error('SyncIngestion API error:', error);
      throw error;
    }
  },

  // --- Phase 26: Project Attachments ---
  getProjectAttachments: async (projectId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/attachments`, {
        headers: getAuthHeaders(false) // Don't include content-type for GET requests
      });
      if (!response.ok) throw new Error(`Failed to fetch attachments for project ${projectId}`);
      return response.json();
    } catch (error) {
      console.error('GetProjectAttachments API error:', error);
      throw error;
    }
  },

  // --- Phase 28: Settings & Search ---
  searchGlobal: async (query) => {
    try {
      const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`, {
        headers: getAuthHeaders(false)
      });
      if (!response.ok) throw new Error('Global search failed');
      return response.json();
    } catch (error) {
      console.error('SearchGlobal API error:', error);
      throw error;
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to change password');
      }
      return data;
    } catch (error) {
      console.error('ChangePassword API error:', error);
      throw error;
    }
  },

  updatePreferences: async (prefs) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me/preferences`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(prefs),
      });
      
      if (!response.ok) throw new Error('Failed to update preferences');
      return response.json();
    } catch (error) {
      console.error('UpdatePreferences API error:', error);
      throw error;
    }
  },

  // --- Phase 28.1: AI Strategist ---
  getNegotiationPrep: async (projectId, force = false) => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/negotiation-prep?force=${force}`, {
        headers: getAuthHeaders(false)
      });
      if (!response.ok) throw new Error('Failed to fetch negotiation prep');
      return response.json();
    } catch (error) {
      console.error('GetNegotiationPrep API error:', error);
      throw error;
    }
  },

  sendStrategistMessage: async (projectId, message, history = []) => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/strategist-chat`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ message, history }),
      });
      if (!response.ok) throw new Error('Failed to send strategist message');
      return response.json();
    } catch (error) {
      console.error('SendStrategistMessage API error:', error);
      throw error;
    }
  },

  // --- Phase 30: User Management (Admin Only) ---
  getUsers: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: getAuthHeaders(false)
      });
      if (!response.ok) throw new Error('Failed to fetch user list');
      return response.json();
    } catch (error) {
      console.error('GetUsers API error:', error);
      throw error;
    }
  },

  updateUser: async (userId, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update user');
      }
      return response.json();
    } catch (error) {
      console.error('UpdateUser API error:', error);
      throw error;
    }
  },

  // --- Phase 31: General Edit API ---
  updateProject: async (projectId, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update project');
      }
      return response.json();
    } catch (error) {
      console.error('UpdateProject API error:', error);
      throw error;
    }
  },

  updateContact: async (contactId, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/contacts/${contactId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update contact');
      }
      return response.json();
    } catch (error) {
      console.error('UpdateContact API error:', error);
      throw error;
    }
  },

  getSmartInputHistory: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/smart-input/history`, {
        headers: getAuthHeaders(false)
      });
      if (!response.ok) {
        const errorData = await readJsonSafe(response);
        throw new Error(detailFromBody(errorData) || 'Failed to fetch smart input history');
      }
      return response.json();
    } catch (error) {
      console.error('GetSmartInputHistory API error:', error);
      throw error;
    }
  }
};

