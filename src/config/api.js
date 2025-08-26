// Point directly to Apache-served backend in local dev.
// Override with REACT_APP_API_BASE_URL for other environments.
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost/backend/api";


// Log the base URL being used
console.log('API Base URL:', API_BASE_URL);

export default API_BASE_URL; 