const resolveApiUrl = () => {
  const envUrl = import.meta?.env?.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.trim().replace(/\/$/, '');
  }

  if (typeof window !== 'undefined' && window.location) {
    const { protocol, hostname, port, origin } = window.location;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

    if (isLocalhost) {
      const targetPort = port && port !== '5000' ? '5000' : port || '5000';
      return `${protocol}//${hostname}:${targetPort}/api`;
    }

    return `${origin.replace(/\/$/, '')}/api`;
  }

  return 'http://localhost:5000/api';
};

const API_URL = resolveApiUrl();

// Import mock data as fallback
import { mockImplants, mockMasterData, mockBlogs } from '../admin/data/implantsMockData.js';

const getAdminHeaders = () => {
  if (typeof window === 'undefined') return {};
  const adminToken = localStorage.getItem('admin_token');
  return adminToken ? { Authorization: `Bearer ${adminToken}` } : {};
};

const FEEDBACK_STORAGE_KEY = 'contact_feedback_v1';

const readLocalFeedback = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeLocalFeedback = (items) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore quota errors
  }
};

const normalizeFeedbackItem = (item = {}, overrides = {}) => {
  const now = new Date().toISOString();
  return {
    id: item.id,
    name: item.name || '',
    email: item.email || '',
    subject: item.subject || 'General Inquiry',
    message: item.message || '',
    status: item.status || 'new',
    adminReply: item.adminReply || '',
    responder: item.responder || '',
    respondedAt: item.respondedAt || null,
    createdAt: item.createdAt || now,
    updatedAt: item.updatedAt || item.createdAt || now,
    ...overrides,
  };
};

const mergeFeedbackLists = (primary = [], secondary = []) => {
  const map = new Map();
  [...secondary, ...primary].forEach((entry) => {
    if (!entry || !entry.id) return;
    map.set(entry.id, entry);
  });
  return Array.from(map.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

// Helper function สำหรับ request
const apiCall = async (endpoint, options = {}) => {
  try {
    const url = `${API_URL}${endpoint}`;
    const token = localStorage.getItem('auth_token');

    let headers = { ...options.headers };
    let useTimeout = true;
    // ถ้า body เป็น FormData ไม่ต้อง set Content-Type (browser จะจัดการ boundary ให้เอง)
    if (options.body instanceof FormData) {
      useTimeout = false;
    } else {
      headers['Content-Type'] = 'application/json';
    }
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const fetchOptions = {
      ...options,
      headers,
    };
    if (useTimeout) {
      fetchOptions.signal = AbortSignal.timeout(5000);
    }

    const response = await fetch(url, fetchOptions);
    const contentType = response.headers.get('content-type') || '';

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText.slice(0, 200)}`);
    }

    if (!contentType.includes('application/json')) {
      const text = await response.text();
      console.warn('Non-JSON response received:', text.slice(0, 200));
      return null;
    }

    return response.json();
  } catch (err) {
    // Return null to signal fallback should be used
    console.warn('API call failed, will try fallback:', err.message);
    return null;
  }
};

// AUTH API
export const authAPI = {
  login: (username, password) => 
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  register: (username, password, email) => 
    apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, email }),
    }),
};

// MASTER DATA API
export const masterDataAPI = {
  // COUNTRIES
  getCountries: async () => {
    const result = await apiCall('/master-data/countries');
    if (result) return result;
    // Fallback to mock data
    return mockMasterData.countries;
  },
  createCountry: (data) => 
    apiCall('/master-data/countries', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateCountry: (id, data) => 
    apiCall(`/master-data/countries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteCountry: (id) => 
    apiCall(`/master-data/countries/${id}`, { method: 'DELETE' }),

  // COMPANIES
  getCompanies: async () => {
    const result = await apiCall('/master-data/companies');
    if (result) return result;
    // Fallback to mock data
    return mockMasterData.companies;
  },
  createCompany: (data) => 
    apiCall('/master-data/companies', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateCompany: (id, data) => 
    apiCall(`/master-data/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteCompany: (id) => 
    apiCall(`/master-data/companies/${id}`, { method: 'DELETE' }),

  // LEVELS
  getLevels: async () => {
    const result = await apiCall('/master-data/levels');
    if (result) return result;
    // Fallback to mock data
    return mockMasterData.levels;
  },
  createLevel: (data) => 
    apiCall('/master-data/levels', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateLevel: (id, data) => 
    apiCall(`/master-data/levels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteLevel: (id) => 
    apiCall(`/master-data/levels/${id}`, { method: 'DELETE' }),

  // DISTRIBUTORS
  getDistributors: async () => {
    const result = await apiCall('/master-data/distributors');
    if (result) return result;
    // Fallback to mock data
    return mockMasterData.distributors;
  },
  createDistributor: (data) => 
    apiCall('/master-data/distributors', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateDistributor: (id, data) => 
    apiCall(`/master-data/distributors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteDistributor: (id) => 
    apiCall(`/master-data/distributors/${id}`, { method: 'DELETE' }),
};

// Helper to convert data URL to File object
const dataUrlToFile = (dataUrl, filename) => {
  if (!dataUrl || !dataUrl.startsWith('data:')) return null;
  
  const arr = dataUrl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const bstr = atob(arr[1]);
  const n = bstr.length;
  const u8arr = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    u8arr[i] = bstr.charCodeAt(i);
  }
  return new File([u8arr], filename, { type: mime });
};

// IMPLANTS API
export const implantsAPI = {
  getAll: async () => {
    const result = await apiCall('/implants');
    if (result) return result;
    // Fallback to mock data
    return mockImplants;
  },
  getById: async (id) => {
    const result = await apiCall(`/implants/${id}`);
    if (result) return result;
    // Fallback to mock data
    return mockImplants.find(i => i.id === Number(id));
  },
  create: async (data) => {
    try {
      const url = `${API_URL}/implants`;
      const token = localStorage.getItem('auth_token');
      
      // Create FormData for multipart upload
      const formData = new FormData();
      
      // Add all form fields except images
      Object.entries(data).forEach(([key, value]) => {
        if (key.startsWith('image') && value) {
          // Skip for now, will handle separately
        } else if (value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      });
      
      // Add images as files if they exist
      if (data.image1) {
        const file1 = dataUrlToFile(data.image1, 'image1.jpg');
        if (file1) formData.append('image1', file1);
      }
      if (data.image2) {
        const file2 = dataUrlToFile(data.image2, 'image2.jpg');
        if (file2) formData.append('image2', file2);
      }
      if (data.image3) {
        const file3 = dataUrlToFile(data.image3, 'image3.jpg');
        if (file3) formData.append('image3', file3);
      }
      
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      console.log('Creating implant with fields:');
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}: ${typeof value === 'object' ? value.name : String(value).substring(0, 50)}`);
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
        signal: AbortSignal.timeout(10000), // 10 second timeout for file uploads
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API response error:', response.status, errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Create implant success:', result);
      return result;
    } catch (err) {
      console.error('Create API call failed:', err.message);
      throw err;
    }
  },
  update: async (id, data) => {
    try {
      const url = `${API_URL}/implants/${id}`;
      const token = localStorage.getItem('auth_token');
      
      // Create FormData for multipart upload
      const formData = new FormData();
      
      // Add all form fields except images
      Object.entries(data).forEach(([key, value]) => {
        if (key.startsWith('image') && value) {
          // Skip for now, will handle separately
        } else if (value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      });
      
      // Add images as files if they exist
      if (data.image1) {
        const file1 = dataUrlToFile(data.image1, 'image1.jpg');
        if (file1) formData.append('image1', file1);
      }
      if (data.image2) {
        const file2 = dataUrlToFile(data.image2, 'image2.jpg');
        if (file2) formData.append('image2', file2);
      }
      if (data.image3) {
        const file3 = dataUrlToFile(data.image3, 'image3.jpg');
        if (file3) formData.append('image3', file3);
      }
      
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      console.log('Updating implant', id, 'with fields:');
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}: ${typeof value === 'object' ? value.name : String(value).substring(0, 50)}`);
      }
      
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: formData,
        signal: AbortSignal.timeout(10000), // 10 second timeout for file uploads
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API response error:', response.status, errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Update implant success:', result);
      return result;
    } catch (err) {
      console.error('Update API call failed:', err.message);
      throw err;
    }
  },
  delete: (id) => 
    apiCall(`/implants/${id}`, { method: 'DELETE' }),
};

// BLOGS API
export const blogsAPI = {
  getAll: async () => {
    const result = await apiCall('/blogs');
    if (result) return result;
    // Fallback to mock data
    return mockBlogs;
  },
  getById: async (id) => {
    const result = await apiCall(`/blogs/${id}`);
    if (result) return result;
    // Fallback to mock data
    return mockBlogs.find(b => b.id === Number(id));
  },
  create: (data) => 
    apiCall('/blogs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id, data) => 
    apiCall(`/blogs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id) => 
    apiCall(`/blogs/${id}`, { method: 'DELETE' }),
};

export const feedbackAPI = {
  submit: async (data) => {
    const payload = {
      name: data?.name?.trim() || '',
      email: data?.email?.trim() || '',
      subject: data?.subject || 'general',
      message: data?.message?.trim() || '',
    };

    const result = await apiCall('/feedback', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (result) {
      const normalized = normalizeFeedbackItem(result, { isLocal: false });
      const merged = mergeFeedbackLists([normalized], readLocalFeedback());
      writeLocalFeedback(merged);
      return normalized;
    }

    const localEntry = normalizeFeedbackItem(
      {
        ...payload,
        id: `local-${Date.now()}`,
      },
      { isLocal: true }
    );

    const merged = mergeFeedbackLists([localEntry], readLocalFeedback());
    writeLocalFeedback(merged);
    return localEntry;
  },
  list: async () => {
    const localSnapshot = readLocalFeedback();
    const result = await apiCall('/feedback', {
      method: 'GET',
      headers: getAdminHeaders(),
    });

    if (Array.isArray(result)) {
      const normalizedServer = result.map((item) => normalizeFeedbackItem(item, { isLocal: false }));
      const merged = mergeFeedbackLists(normalizedServer, localSnapshot);
      writeLocalFeedback(merged);
      return merged;
    }

    return localSnapshot;
  },
  updateStatus: async (id, status) => {
    const localSnapshot = readLocalFeedback();
    const target = localSnapshot.find((item) => item.id === id);

    const result = await apiCall(`/feedback/${id}/status`, {
      method: 'PATCH',
      headers: getAdminHeaders(),
      body: JSON.stringify({ status }),
    });

    if (result) {
      const normalized = normalizeFeedbackItem(result, { isLocal: false });
      const merged = mergeFeedbackLists([normalized], localSnapshot);
      writeLocalFeedback(merged);
      return normalized;
    }

    if (target && target.isLocal) {
      const updatedLocal = normalizeFeedbackItem({ ...target, status }, { isLocal: true });
      const merged = mergeFeedbackLists([updatedLocal], localSnapshot.filter((item) => item.id !== id));
      writeLocalFeedback(merged);
      return updatedLocal;
    }

    throw new Error('Unable to update feedback status');
  },
  reply: async (id, payload) => {
    const localSnapshot = readLocalFeedback();
    const target = localSnapshot.find((item) => item.id === id);
    const responder = payload?.responder || 'Admin';
    const adminReply = payload?.adminReply || '';

    const result = await apiCall(`/feedback/${id}/reply`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify({ adminReply, responder }),
    });

    if (result) {
      const normalized = normalizeFeedbackItem(result, { isLocal: false });
      const merged = mergeFeedbackLists([normalized], localSnapshot);
      writeLocalFeedback(merged);
      return normalized;
    }

    if (target) {
      const updatedLocal = normalizeFeedbackItem(
        {
          ...target,
          adminReply,
          responder,
          status: 'resolved',
          respondedAt: new Date().toISOString(),
        },
        { isLocal: true }
      );
      const merged = mergeFeedbackLists([updatedLocal], localSnapshot.filter((item) => item.id !== id));
      writeLocalFeedback(merged);
      return updatedLocal;
    }

    throw new Error('Unable to send reply');
  },
};
