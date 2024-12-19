export const login = () => {
  // Replace with actual authentication logic
  localStorage.setItem('isAdmin', 'true');
};

export const logout = () => {
  localStorage.removeItem('isAdmin');
};

export const isAuthenticated = () => {
  return localStorage.getItem('isAdmin') === 'true';
}; 