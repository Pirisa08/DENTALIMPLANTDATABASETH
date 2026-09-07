const resolveApiUrl = () => {
  const envUrl = import.meta?.env?.VITE_API_URL;
  if (envUrl && typeof envUrl === "string" && envUrl.trim()) {
    return envUrl.trim().replace(/\/$/, "");
  }

  if (typeof window !== "undefined" && window.location) {
    const { protocol, hostname, origin } = window.location;
    const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";

    if (isLocalhost) {
      const targetPort = "5000";
      return `${protocol}//${hostname}:${targetPort}/api`;
    }

    return `${origin.replace(/\/$/, "")}/api`;
  }

  return "http://localhost:5000/api";
};

const API_URL = resolveApiUrl();

const mockImplants = [];
const mockBlogs = [];
const mockMasterData = {
  countries: [],
  companies: [],
  levels: [],
  distributors: [],
  brands: [],
};

const TOKEN_STORAGE_KEYS = ["auth_token", "admin_token", "token"];

const extractTokenFromPayload = (payload) => {
  if (!payload || typeof payload !== "object") return null;

  return (
    payload.token ||
    payload.accessToken ||
    payload.access_token ||
    payload.jwt ||
    payload.idToken ||
    payload?.data?.token ||
    payload?.data?.accessToken ||
    payload?.data?.access_token ||
    payload?.user?.token ||
    payload?.user?.accessToken ||
    null
  );
};

const getAuthToken = () => {
  if (typeof window === "undefined") return null;

  for (const key of TOKEN_STORAGE_KEYS) {
    const value = localStorage.getItem(key);
    if (value && typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
};

const setAuthToken = (token) => {
  if (typeof window === "undefined" || !token) return;
  TOKEN_STORAGE_KEYS.forEach((key) => {
    localStorage.setItem(key, token);
  });
};

const clearAuthToken = () => {
  if (typeof window === "undefined") return;
  TOKEN_STORAGE_KEYS.forEach((key) => {
    localStorage.removeItem(key);
  });
};

const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const resolveImageUrl = (value) => {
  if (!value) return "";
  if (typeof value !== "string") return "";
  if (value.startsWith("data:")) return value;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;

  const apiRoot = API_URL.replace(/\/api$/, "");

  if (value.startsWith("/uploads/")) {
    return `${apiRoot}${value}`;
  }

  if (value.startsWith("uploads/")) {
    return `${apiRoot}/${value}`;
  }

  return value;
};

const apiCall = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  const token = getAuthToken();

  let headers = { ...(options.headers || {}) };
  let useTimeout = true;

  if (options.body instanceof FormData) {
    useTimeout = false;
  } else if (!headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  const fetchOptions = { ...options, headers };

  if (
    useTimeout &&
    typeof AbortSignal !== "undefined" &&
    typeof AbortSignal.timeout === "function"
  ) {
    fetchOptions.signal = AbortSignal.timeout(10000);
  }

  let response;
  try {
    response = await fetch(url, fetchOptions);
  } catch (err) {
    throw new Error(
      `Cannot connect to backend at ${API_URL}. Please start server on port 5000.`
    );
  }

  const contentType = response.headers.get("content-type") || "";

  if (!response.ok) {
    const errorText = await response.text();

    if (response.status === 401) {
      throw new Error("Unauthorized");
    }

    throw new Error(
      `API Error: ${response.status} - ${errorText.slice(0, 300)}`
    );
  }

  if (!contentType.includes("application/json")) {
    const text = await response.text();
    console.warn("Non-JSON response received:", text.slice(0, 200));
    return null;
  }

  return await response.json();
};

export const authAPI = {
  login: async (email, password) => {
    const result = await apiCall("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    const token = extractTokenFromPayload(result);
    if (token) setAuthToken(token);

    if (typeof window !== "undefined" && result?.user) {
      localStorage.setItem("admin_user", JSON.stringify(result.user));
    }

    return result;
  },

  register: async (username, password, email) => {
    const result = await apiCall("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, password, email }),
    });

    const token = extractTokenFromPayload(result);
    if (token) setAuthToken(token);

    if (typeof window !== "undefined" && result?.user) {
      localStorage.setItem("admin_user", JSON.stringify(result.user));
    }

    return result;
  },

  me: async () => {
    return await apiCall("/auth/me", {
      method: "GET",
      headers: getAuthHeaders(),
    });
  },

  logout: () => {
    clearAuthToken();
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin_user");
    }
  },

  getToken: () => getAuthToken(),
};

export const profileAPI = {
  getMe: async () => {
    return await apiCall("/profile/me", {
      method: "GET",
      headers: getAuthHeaders(),
    });
  },

  updateMe: async (data) => {
    return await apiCall("/profile/me", {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
  },
};

export const brandAPI = {
  getAll: async () => {
    try {
      const result = await apiCall("/brands");
      return Array.isArray(result) ? result : mockMasterData.brands;
    } catch (err) {
      console.warn("getAll brands failed:", err.message);
      return mockMasterData.brands;
    }
  },

  getById: async (id) => {
    try {
      return await apiCall(`/brands/${id}`);
    } catch (err) {
      console.warn("getById brand failed:", err.message);
      return null;
    }
  },

  create: async (data) =>
    apiCall("/brands", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: async (id, data) =>
    apiCall(`/brands/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: async (id) =>
    apiCall(`/brands/${id}`, { method: "DELETE" }),
};

export const masterDataAPI = {
  getCountries: async () => {
    try {
      const result = await apiCall("/master-data/countries");
      return Array.isArray(result) ? result : mockMasterData.countries;
    } catch (err) {
      console.warn("getCountries failed:", err.message);
      return mockMasterData.countries;
    }
  },

  createCountry: async (data) =>
    apiCall("/master-data/countries", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateCountry: async (id, data) =>
    apiCall(`/master-data/countries/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteCountry: async (id) =>
    apiCall(`/master-data/countries/${id}`, { method: "DELETE" }),

  getCompanies: async () => {
    try {
      const result = await apiCall("/master-data/companies");
      return Array.isArray(result) ? result : mockMasterData.companies;
    } catch (err) {
      console.warn("getCompanies failed:", err.message);
      return mockMasterData.companies;
    }
  },

  createCompany: async (data) =>
    apiCall("/master-data/companies", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateCompany: async (id, data) =>
    apiCall(`/master-data/companies/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteCompany: async (id) =>
    apiCall(`/master-data/companies/${id}`, { method: "DELETE" }),

  getLevels: async () => {
    try {
      const result = await apiCall("/master-data/levels");
      return Array.isArray(result) ? result : mockMasterData.levels;
    } catch (err) {
      console.warn("getLevels failed:", err.message);
      return mockMasterData.levels;
    }
  },

  createLevel: async (data) =>
    apiCall("/master-data/levels", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateLevel: async (id, data) =>
    apiCall(`/master-data/levels/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteLevel: async (id) =>
    apiCall(`/master-data/levels/${id}`, { method: "DELETE" }),

  getDistributors: async () => {
    try {
      const result = await apiCall("/master-data/distributors");
      return Array.isArray(result) ? result : mockMasterData.distributors;
    } catch (err) {
      console.warn("getDistributors failed:", err.message);
      return mockMasterData.distributors;
    }
  },

  createDistributor: async (data) =>
    apiCall("/master-data/distributors", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateDistributor: async (id, data) =>
    apiCall(`/master-data/distributors/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteDistributor: async (id) =>
    apiCall(`/master-data/distributors/${id}`, { method: "DELETE" }),

  getConnectionTypes: async () => {
    try {
      const result = await apiCall("/master-data/connection-types");
      return Array.isArray(result) ? result : [];
    } catch (err) {
      console.warn("getConnectionTypes failed:", err.message);
      return [];
    }
  },

  createConnectionType: async (data) =>
    apiCall("/master-data/connection-types", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateConnectionType: async (id, data) =>
    apiCall(`/master-data/connection-types/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteConnectionType: async (id) =>
    apiCall(`/master-data/connection-types/${id}`, { method: "DELETE" }),

  getConnectionShapes: async () => {
    try {
      const result = await apiCall("/master-data/connection-shapes");
      return Array.isArray(result) ? result : [];
    } catch (err) {
      console.warn("getConnectionShapes failed:", err.message);
      return [];
    }
  },

  createConnectionShape: async (data) =>
    apiCall("/master-data/connection-shapes", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateConnectionShape: async (id, data) =>
    apiCall(`/master-data/connection-shapes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteConnectionShape: async (id) =>
    apiCall(`/master-data/connection-shapes/${id}`, { method: "DELETE" }),

  getHeadShapes: async () => {
    try {
      const result = await apiCall("/master-data/head-shapes");
      return Array.isArray(result) ? result : [];
    } catch (err) {
      console.warn("getHeadShapes failed:", err.message);
      return [];
    }
  },

  createHeadShape: async (data) =>
    apiCall("/master-data/head-shapes", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateHeadShape: async (id, data) =>
    apiCall(`/master-data/head-shapes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteHeadShape: async (id) =>
    apiCall(`/master-data/head-shapes/${id}`, { method: "DELETE" }),

  getBodyShapes: async () => {
    try {
      const result = await apiCall("/master-data/body-shapes");
      return Array.isArray(result) ? result : [];
    } catch (err) {
      console.warn("getBodyShapes failed:", err.message);
      return [];
    }
  },

  createBodyShape: async (data) =>
    apiCall("/master-data/body-shapes", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateBodyShape: async (id, data) =>
    apiCall(`/master-data/body-shapes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteBodyShape: async (id) =>
    apiCall(`/master-data/body-shapes/${id}`, { method: "DELETE" }),

  getApexShapes: async () => {
    try {
      const result = await apiCall("/master-data/apex-shapes");
      return Array.isArray(result) ? result : [];
    } catch (err) {
      console.warn("getApexShapes failed:", err.message);
      return [];
    }
  },

  createApexShape: async (data) =>
    apiCall("/master-data/apex-shapes", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateApexShape: async (id, data) =>
    apiCall(`/master-data/apex-shapes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteApexShape: async (id) =>
    apiCall(`/master-data/apex-shapes/${id}`, { method: "DELETE" }),

  getScrewdriverShapes: async () => {
    try {
      const result = await apiCall("/master-data/screwdriver-shapes");
      return Array.isArray(result) ? result : [];
    } catch (err) {
      console.warn("getScrewdriverShapes failed:", err.message);
      return [];
    }
  },

  createScrewdriverShape: async (data) =>
    apiCall("/master-data/screwdriver-shapes", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateScrewdriverShape: async (id, data) =>
    apiCall(`/master-data/screwdriver-shapes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteScrewdriverShape: async (id) =>
    apiCall(`/master-data/screwdriver-shapes/${id}`, { method: "DELETE" }),

  seedBlogs: async () =>
    apiCall("/seed-blogs", {
      method: "POST",
    }),
};

const isDataUrl = (value) =>
  typeof value === "string" && value.startsWith("data:");

const dataUrlToFile = (dataUrl, filename) => {
  if (!isDataUrl(dataUrl)) return null;

  const arr = dataUrl.split(",");
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
  const bstr = atob(arr[1]);
  const n = bstr.length;
  const u8arr = new Uint8Array(n);

  for (let i = 0; i < n; i += 1) {
    u8arr[i] = bstr.charCodeAt(i);
  }

  return new File([u8arr], filename, { type: mime });
};

const appendImageToFormData = (formData, key, value, fallbackName) => {
  if (!value) return;

  if (value instanceof File) {
    formData.append(key, value);
    return;
  }

  if (isDataUrl(value)) {
    const file = dataUrlToFile(value, fallbackName);
    if (file) {
      formData.append(key, file);
    }
  }
};

export const implantsAPI = {
  getAll: async () => {
    try {
      const result = await apiCall("/implants");
      return Array.isArray(result) ? result : [];
    } catch (err) {
      console.warn("getAll implants failed:", err.message);
      return [];
    }
  },

  getById: async (id) => {
    try {
      return await apiCall(`/implants/${id}`);
    } catch (err) {
      console.warn("getById implant failed:", err.message);
      return null;
    }
  },

  create: async (data) => {
    const url = `${API_URL}/implants`;
    const token = getAuthToken();
    const formData = new FormData();

    Object.entries(data || {}).forEach(([key, value]) => {
      if (key.startsWith("image")) return;
      if (value !== null && value !== undefined && value !== "") {
        formData.append(key, String(value));
      }
    });

    appendImageToFormData(formData, "image1", data?.image1, "image1.jpg");
    appendImageToFormData(formData, "image2", data?.image2, "image2.jpg");
    appendImageToFormData(formData, "image3", data?.image3, "image3.jpg");

    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("implants:updated"));
    }
    return result;
  },

  update: async (id, data) => {
    const url = `${API_URL}/implants/${id}`;
    const token = getAuthToken();
    const formData = new FormData();

    Object.entries(data || {}).forEach(([key, value]) => {
      if (key.startsWith("image")) return;
      if (value !== null && value !== undefined && value !== "") {
        formData.append(key, String(value));
      }
    });

    appendImageToFormData(formData, "image1", data?.image1, "image1.jpg");
    appendImageToFormData(formData, "image2", data?.image2, "image2.jpg");
    appendImageToFormData(formData, "image3", data?.image3, "image3.jpg");

    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(url, {
      method: "PUT",
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("implants:updated"));
    }
    return result;
  },

  delete: async (id) => {
    const result = await apiCall(`/implants/${id}`, { method: "DELETE" });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("implants:updated"));
    }
    return result;
  },
};

export const blogsAPI = {
  getAll: async () => {
    return await apiCall("/blogs", {
      method: "GET",
    });
  },

  getById: async (id) => {
    return await apiCall(`/blogs/${id}`, {
      method: "GET",
    });
  },

  create: async (data) => {
    return await apiCall("/blogs", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id, data) => {
    return await apiCall(`/blogs/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: async (id) => {
    return await apiCall(`/blogs/${id}`, {
      method: "DELETE",
    });
  },
};

export const feedbackAPI = {
  submit: async (data) => {
    const payload = {
      name: data?.name?.trim() || "",
      email: data?.email?.trim() || "",
      subject: data?.subject || "general",
      message: data?.message?.trim() || "",
    };

    const result = await apiCall("/feedback", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (result && result.id) return result;
    throw new Error("No result from backend");
  },

  list: async () => {
    const result = await apiCall("/feedback", {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (Array.isArray(result)) return result;
    throw new Error("No result from backend");
  },

  updateStatus: async (id, status) => {
    const result = await apiCall(`/feedback/${id}/status`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });

    if (result) return result;
    throw new Error("Unable to update feedback status");
  },

  reply: async (id, payload) => {
    const responder = payload?.responder || "Admin";
    const adminReply = payload?.adminReply || "";

    const result = await apiCall(`/feedback/${id}/reply`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ adminReply, responder }),
    });

    if (result) return result;
    throw new Error("Unable to send reply");
  },

  delete: async (id) => {
    const result = await apiCall(`/feedback/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (result) return result;
    throw new Error("Unable to delete feedback");
  },
};

export {
  API_URL,
  apiCall,
  getAuthToken,
  setAuthToken,
  clearAuthToken,
};