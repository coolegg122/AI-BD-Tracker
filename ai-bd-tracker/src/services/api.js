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
  extractInfo: async (raw_text, type = "deal") => {
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

  // Get all deals
  getDeals: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/deals`, {
        headers: getAuthHeaders(false) // Don't include content-type for GET requests
      });
      if (!response.ok) {
          throw new Error(`Failed to fetch deals: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('GetDeals API error:', error);
      throw error;
    }
  },

  // Save/Create a new deal
  createDeal: async (dealData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/deals`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(dealData),
      });
      if (!response.ok) {
        const errorData = await readJsonSafe(response);
        throw new Error(detailFromBody(errorData) || `Create deal failed: ${response.statusText}`);
      }
      return await readJsonSafe(response);
    } catch (error) {
      console.error('CreateDeal API error:', error);
      throw error;
    }
  },

  // Update a deal's stage
  updateDealStage: async (dealId, stage) => {
    try {
      const response = await fetch(`${API_BASE_URL}/deals/${dealId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ stage }),
      });
      if (!response.ok) {
          throw new Error(`Failed to update deal stage: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('UpdateDealStage API error:', error);
      throw error;
    }
  },

  // Get deal history
  getDealHistory: async (dealId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/deals/${dealId}/history`, {
        headers: getAuthHeaders(false) // Don't include content-type for GET requests
      });
      if (!response.ok) {
          throw new Error(`Failed to fetch deal history: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('GetDealHistory API error:', error);
      throw error;
    }
  },

  createDealHistory: async (dealId, historyData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/deals/${dealId}/history`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(historyData),
      });
      if (!response.ok) {
          throw new Error(`Failed to create deal history: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('CreateDealHistory API error:', error);
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

  // --- Phase 26: Deal Attachments ---
  getDealAttachments: async (dealId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/deals/${dealId}/attachments`, {
        headers: getAuthHeaders(false) // Don't include content-type for GET requests
      });
      if (!response.ok) throw new Error(`Failed to fetch attachments for deal ${dealId}`);
      return response.json();
    } catch (error) {
      console.error('GetDealAttachments API error:', error);
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
  getNegotiationPrep: async (dealId, force = false) => {
    try {
      const response = await fetch(`${API_BASE_URL}/deals/${dealId}/negotiation-prep?force=${force}`, {
        headers: getAuthHeaders(false)
      });
      if (!response.ok) throw new Error('Failed to fetch negotiation prep');
      return response.json();
    } catch (error) {
      console.error('GetNegotiationPrep API error:', error);
      throw error;
    }
  },

  sendStrategistMessage: async (dealId, message, history = []) => {
    try {
      const response = await fetch(`${API_BASE_URL}/deals/${dealId}/strategist-chat`, {
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
  updateDeal: async (dealId, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/deals/${dealId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update deal');
      }
      return response.json();
    } catch (error) {
      console.error('UpdateDeal API error:', error);
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

  getSmartInputArchive: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/smart-input/archive`, {
        headers: getAuthHeaders(false)
      });
      if (!response.ok) {
        const errorData = await readJsonSafe(response);
        throw new Error(detailFromBody(errorData) || 'Failed to fetch smart input archive');
      }
      return response.json();
    } catch (error) {
      console.error('GetSmartInputArchive API error:', error);
      throw error;
    }
  },

  saveSmartInputArchive: async (archiveData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/smart-input/archive`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(archiveData)
      });
      if (!response.ok) {
        const errorData = await readJsonSafe(response);
        throw new Error(detailFromBody(errorData) || 'Failed to save smart input archive');
      }
      return response.json();
    } catch (error) {
      console.error('SaveSmartInputArchive API error:', error);
      throw error;
    }
  },

  // --- Phase 33: Asset Management ---
  getAssets: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/assets`, {
        headers: getAuthHeaders(false)
      });
      if (!response.ok) throw new Error('Failed to fetch assets');
      return response.json();
    } catch (error) {
      console.error('GetAssets API error:', error);
      throw error;
    }
  },

  createAsset: async (assetData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/assets`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(assetData),
      });
      if (!response.ok) throw new Error('Failed to create asset');
      return response.json();
    } catch (error) {
      console.error('CreateAsset API error:', error);
      throw error;
    }
  },

  getAssetDetail: async (assetId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/assets/${assetId}`, {
        headers: getAuthHeaders(false)
      });
      if (!response.ok) throw new Error('Failed to fetch asset detail');
      return response.json();
    } catch (error) {
      console.error('GetAssetDetail API error:', error);
      throw error;
    }
  },

  updateAsset: async (assetId, assetData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/assets/${assetId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(assetData),
      });
      if (!response.ok) throw new Error('Failed to update asset');
      return response.json();
    } catch (error) {
      console.error('UpdateAsset API error:', error);
      throw error;
    }
  },

  associateAssetToDeal: async (dealId, assetId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/deals/${dealId}/assets/${assetId}`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to link asset to deal');
      return response.json();
    } catch (error) {
      console.error('AssociateAssetToDeal API error:', error);
      throw error;
    }
  },

  disassociateAssetFromDeal: async (dealId, assetId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/deals/${dealId}/assets/${assetId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to unlink asset from deal');
      return response.json();
    } catch (error) {
      console.error('DisassociateAssetFromDeal API error:', error);
      throw error;
    }
  },

  // --- Phase 2: Professional BD Upgrade ---
  updateDealEconomics: async (dealId, econData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/deals/${dealId}/economics`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(econData),
      });
      if (!response.ok) throw new Error('Failed to update deal economics');
      return response.json();
    } catch (error) {
      console.error('UpdateDealEconomics API error:', error);
      throw error;
    }
  },

  addDealAgreement: async (dealId, agreementData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/deals/${dealId}/agreements`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(agreementData),
      });
      if (!response.ok) throw new Error('Failed to add deal agreement');
      return response.json();
    } catch (error) {
      console.error('AddDealAgreement API error:', error);
      throw error;
    }
  },

  updateDealAgreement: async (dealId, agreementId, agreementData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/deals/${dealId}/agreements/${agreementId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(agreementData),
      });
      if (!response.ok) throw new Error('Failed to update deal agreement');
      return response.json();
    } catch (error) {
      console.error('UpdateDealAgreement API error:', error);
      throw error;
    }
  },

  updateDealDueDiligence: async (dealId, ddData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/deals/${dealId}/due-diligence`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(ddData),
      });
      if (!response.ok) throw new Error('Failed to update deal due diligence');
      return response.json();
    } catch (error) {
      console.error('UpdateDealDueDiligence API error:', error);
      throw error;
    }
  }
};

