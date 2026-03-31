const API_BASE_URL = window.location.origin.includes('localhost') ? 'http://localhost:8000/api/v1' : '/api/v1';

export const api = {
  // Universal extraction from raw text using AI Engine
  extractInfo: async (raw_text, type = "project") => {
    const response = await fetch(`${API_BASE_URL}/extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw_text, type }),
    });
    
    if (!response.ok) {
        throw new Error(`AI Extraction failed: ${response.statusText}`);
    }
    return response.json();
  },

  // Get all projects
  getProjects: async () => {
    const response = await fetch(`${API_BASE_URL}/projects`);
    if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }
    return response.json();
  },

  // Save/Create a new project
  createProject: async (projectData) => {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
    });
    if (!response.ok) {
      let detail = response.statusText;
      try {
        const errBody = await response.json();
        detail = JSON.stringify(errBody.detail || errBody);
      } catch (_) {}
      throw new Error(detail);
    }
    return response.json();
  },

  // Update a project's stage
  updateProjectStage: async (projectId, stage) => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ stage }),
    });
    if (!response.ok) {
        throw new Error(`Failed to update project stage: ${response.statusText}`);
    }
    return response.json();
  },

  // Get project history
  getProjectHistory: async (projectId) => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/history`);
    if (!response.ok) {
        throw new Error(`Failed to fetch project history: ${response.statusText}`);
    }
    return response.json();
  },
  
  createProjectHistory: async (projectId, historyData) => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(historyData),
    });
    if (!response.ok) {
        throw new Error(`Failed to create project history: ${response.statusText}`);
    }
    return response.json();
  },

  // --- Phase 13: Contacts ---
  getContacts: async () => {
    const response = await fetch(`${API_BASE_URL}/contacts`);
    if (!response.ok) {
        throw new Error(`Failed to fetch contacts: ${response.statusText}`);
    }
    return response.json();
  },

  createContact: async (contactData) => {
    const response = await fetch(`${API_BASE_URL}/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contactData),
    });
    if (!response.ok) {
      let detail = response.statusText;
      try { const e = await response.json(); detail = JSON.stringify(e.detail || e); } catch (_) {}
      throw new Error(detail);
    }
    return response.json();
  },

  // --- Phase 14: Competitive Intelligence ---
  getCompanyIntelligence: async (companyName) => {
    // URL encode the company name to handle spaces / special characters safely
    const response = await fetch(`${API_BASE_URL}/intelligence/${encodeURIComponent(companyName)}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch intelligence for ${companyName}: ${response.statusText}`);
    }
    return response.json();
  },

  // --- Phase 5: Mock UI Endpoints ---
  getDashboardMock: async () => {
    const response = await fetch(`${API_BASE_URL}/mock/dashboard`);
    if (!response.ok) throw new Error('Failed to fetch dashboard mock');
    return response.json();
  },

  getScheduleMock: async () => {
    const response = await fetch(`${API_BASE_URL}/mock/schedule`);
    if (!response.ok) throw new Error('Failed to fetch schedule mock');
    return response.json();
  },

  getNotificationsMock: async () => {
    const response = await fetch(`${API_BASE_URL}/mock/notifications`);
    if (!response.ok) throw new Error('Failed to fetch notifications mock');
    return response.json();
  },

  // --- Phase 22: Inbound Ingestion Inbox ---
  getPendingIngestions: async () => {
    const response = await fetch(`${API_BASE_URL}/ingestion/pending`);
    if (!response.ok) throw new Error('Failed to fetch pending ingestions');
    return response.json();
  },

  processIngestion: async (id) => {
    const response = await fetch(`${API_BASE_URL}/ingestion/${id}/process`, { method: 'POST' });
    if (!response.ok) {
      let detail = response.statusText;
      try { const e = await response.json(); detail = JSON.stringify(e.detail || e); } catch (_) {}
      throw new Error(`processIngestion failed: ${detail}`);
    }
    return response.json();
  },

  deleteIngestion: async (id) => {
    const response = await fetch(`${API_BASE_URL}/ingestion/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to discard ingestion');
    return response.json();
  },

  // --- Phase 23: Zoho Mail Sync ---
  syncIngestion: async () => {
    const response = await fetch(`${API_BASE_URL}/ingestion/sync`, {
      method: 'POST'
    });
    if (!response.ok) throw new Error('Mail sync failed');
    return response.json();
  }
};
