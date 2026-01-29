const config = {
  development: {
    API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/',
    APP_URL: 'http://localhost:3000',
  },
  production: {
    API_BASE_URL: import.meta.env.VITE_API_URL || 'https://dialysistrack-backend.loca.lt/api/',
    APP_URL: 'https://dialysistrack-frontend.loca.lt',
  }
};

const environment = import.meta.env.MODE || 'development';

export default config[environment] || config.development;