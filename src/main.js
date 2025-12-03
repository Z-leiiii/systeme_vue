import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import axios from 'axios';
import VueAxios from 'vue-axios';

// Set base URL for API requests
axios.defaults.baseURL = 'http://localhost:8000/api';

// Handle API errors globally
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // Show error message from response or default message
      const message = error.response?.data?.message || 'An error occurred';
      store.dispatch('flash/showFlash', { message, type: 'error' });
    } else if (error.request) {
      // The request was made but no response was received
      store.dispatch('flash/showFlash', { 
        message: 'No response from server. Please check your connection.', 
        type: 'error' 
      });
    } else {
      // Something happened in setting up the request
      store.dispatch('flash/showFlash', { 
        message: 'Request error. Please try again.', 
        type: 'error' 
      });
    }
    
    return Promise.reject(error);
  }
);

const app = createApp(App);

// Add plugins
app.use(store);
app.use(router);
app.use(VueAxios, axios);

// Make axios available throughout the app
app.provide('axios', app.config.globalProperties.axios);

// Global error handler
app.config.errorHandler = (err) => {
  console.error('Vue error:', err);
  store.dispatch('flash/showFlash', { 
    message: 'An unexpected error occurred. Please try again.', 
    type: 'error' 
  });
};

app.mount('#app');
