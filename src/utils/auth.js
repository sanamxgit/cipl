export const login = (userData) => {
  // Store user data including role
  localStorage.setItem('user', JSON.stringify(userData));
  localStorage.setItem('isAdmin', userData.role === 'admin' ? 'true' : 'false');
};

export const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('isAdmin');
};

export const isAuthenticated = () => {
  const user = localStorage.getItem('user');
  return user !== null;
};

export const isAdmin = () => {
  const user = localStorage.getItem('user');
  if (!user) return false;
  
  try {
    const userData = JSON.parse(user);
    return userData.role === 'admin';
  } catch (error) {
    console.error('Error parsing user data:', error);
    return false;
  }
};

export const getUser = () => {
  const user = localStorage.getItem('user');
  if (!user) return null;
  
  try {
    return JSON.parse(user);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
}; 