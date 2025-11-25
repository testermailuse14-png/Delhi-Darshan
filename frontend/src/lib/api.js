const API_URL = `https://dilli-darshan.onrender.com` ;

export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API error');
  }

  return response.json();
};

// Auth endpoints
export const authApi = {
  signUp: (email, password) =>
    apiCall('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  
  signIn: (email, password) =>
    apiCall('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  
  getMe: () => apiCall('/api/auth/me'),
};

// Hidden Gems endpoints
export const hiddenGemsApi = {
  getAll: () => apiCall('/api/hidden-gems'),
  
  getById: (id) => apiCall(`/api/hidden-gems/${id}`),
  
  create: (data) =>
    apiCall('/api/hidden-gems', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id, data) =>
    apiCall(`/api/hidden-gems/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id) =>
    apiCall(`/api/hidden-gems/${id}`, {
      method: 'DELETE',
    }),
};
