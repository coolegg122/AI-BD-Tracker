// In local dev, Vite proxy forwards /api/* to the Python backend (no CORS needed).
// In production (Vercel), /api/* routes to serverless functions natively.
const API_BASE_URL = '/api/v1';

// Helper function to get the auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
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

export const api = {
  // Universal extraction from raw text using AI Engine
  extractInfo: async (raw_text, type = "project") => {
    const response = await fetch(`${API_BASE_URL}/extract`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ raw_text, type }),
    });

    if (!response.ok) {
        throw new Error(`AI Extraction failed: ${response.statusText}`);
    }
    return response.json();
  },

  // Get all projects
  getProjects: async () => {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      headers: getAuthHeaders(false) // Don't include content-type for GET requests
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }
    return response.json();
  },

  // Save/Create a new project
  createProject: async (projectData) => {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(projectData),
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
      throw new Error(`Create project failed: ${detail}`);
    }
    return response.json();
  },

  // Update a project's stage
  updateProjectStage: async (projectId, stage) => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ stage }),
    });
    if (!response.ok) {
        throw new Error(`Failed to update project stage: ${response.statusText}`);
    }
    return response.json();
  },

  // Get project history
  getProjectHistory: async (projectId) => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/history`, {
      headers: getAuthHeaders(false) // Don't include content-type for GET requests
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch project history: ${response.statusText}`);
    }
    return response.json();
  },

  createProjectHistory: async (projectId, historyData) => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/history`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(historyData),
    });
    if (!response.ok) {
        throw new Error(`Failed to create project history: ${response.statusText}`);
    }
    return response.json();
  },

  // --- Phase 13: Contacts ---
  getContacts: async () => {
    const response = await fetch(`${API_BASE_URL}/contacts`, {
      headers: getAuthHeaders(false) // Don't include content-type for GET requests
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch contacts: ${response.statusText}`);
    }
    return response.json();
  },

  createContact: async (contactData) => {
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
  },

  // --- Phase 14: Competitive Intelligence ---
  getCompanyIntelligence: async (companyName) => {
    // URL encode the company name to handle spaces / special characters safely
    const response = await fetch(`${API_BASE_URL}/intelligence/${encodeURIComponent(companyName)}`, {
      headers: getAuthHeaders(false) // Don't include content-type for GET requests
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch intelligence for ${companyName}: ${response.statusText}`);
    }
    return response.json();
  },

  // --- Phase 5: Mock UI Endpoints ---
  getDashboardMock: async () => {
    const response = await fetch(`${API_BASE_URL}/mock/dashboard`, {
      headers: getAuthHeaders(false) // Don't include content-type for GET requests
    });
    if (!response.ok) throw new Error('Failed to fetch dashboard mock');
    return response.json();
  },

  getScheduleMock: async () => {
    const response = await fetch(`${API_BASE_URL}/mock/schedule`, {
      headers: getAuthHeaders(false) // Don't include content-type for GET requests
    });
    if (!response.ok) throw new Error('Failed to fetch schedule mock');
    return response.json();
  },

  getNotificationsMock: async () => {
    const response = await fetch(`${API_BASE_URL}/mock/notifications`, {
      headers: getAuthHeaders(false) // Don't include content-type for GET requests
    });
    if (!response.ok) throw new Error('Failed to fetch notifications mock');
    return response.json();
  },

  // --- Phase 22: Inbound Ingestion Inbox ---
  getPendingIngestions: async () => {
    const response = await fetch(`${API_BASE_URL}/ingestion/pending`, {
      headers: getAuthHeaders(false) // Don't include content-type for GET requests
    });
    if (!response.ok) throw new Error('Failed to fetch pending ingestions');
    return response.json();
  },

  processIngestion: async (id) => {
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
  },

  deleteIngestion: async (id) => {
    const response = await fetch(`${API_BASE_URL}/ingestion/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to discard ingestion');
    return response.json();
  },

  // --- Phase 23: Zoho Mail Sync ---
  syncIngestion: async () => {
    const response = await fetch(`${API_BASE_URL}/ingestion/sync`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Mail sync failed');
    return response.json();
  },

  // --- Phase 26: Project Attachments ---
  getProjectAttachments: async (projectId) => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/attachments`, {
      headers: getAuthHeaders(false) // Don't include content-type for GET requests
    });
    if (!response.ok) throw new Error(`Failed to fetch attachments for project ${projectId}`);
    return response.json();
  }
};
