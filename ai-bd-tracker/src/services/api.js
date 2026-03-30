const API_BASE_URL = 'http://localhost:8000/api/v1';

export const api = {
  // Extract project data from raw text using AI Engine
  extractProjects: async (raw_text) => {
    const response = await fetch(`${API_BASE_URL}/extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw_text }),
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
        throw new Error(`Failed to create project: ${response.statusText}`);
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
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactData),
    });
    if (!response.ok) {
        throw new Error(`Failed to create contact: ${response.statusText}`);
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
  }
};
