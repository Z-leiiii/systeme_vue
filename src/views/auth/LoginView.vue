<template>
  <div class="login-container">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-4">
        <div class="card shadow">
          <div class="card-body p-4">
            <h2 class="text-center mb-4">Login</h2>
            
            <form @submit.prevent="handleLogin">
              <div v-if="error" class="alert alert-danger">
                {{ error }}
              </div>
              
              <div class="mb-3">
                <label for="email" class="form-label">Email address</label>
                <input 
                  type="email" 
                  class="form-control" 
                  id="email" 
                  v-model="form.email" 
                  required
                  :disabled="loading"
                >
              </div>
              
              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input 
                  type="password" 
                  class="form-control" 
                  id="password" 
                  v-model="form.password" 
                  required
                  :disabled="loading"
                >
              </div>
              
              <div class="d-grid gap-2">
                <button 
                  type="submit" 
                  class="btn btn-primary"
                  :disabled="loading"
                >
                  <span v-if="loading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                  {{ loading ? 'Logging in...' : 'Login' }}
                </button>
              </div>
              
              <div class="text-center mt-3">
                <p class="mb-0">
                  Don't have an account? 
                  <router-link to="/register">Register here</router-link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

export default {
  name: 'LoginView',
  setup() {
    const router = useRouter();
    const loading = ref(false);
    const error = ref('');
    const form = ref({
      email: '',
      password: ''
    });

    const handleLogin = async () => {
      error.value = '';
      loading.value = true;
      
      try {
        const response = await axios.post('/login', form.value);
        
        // Save token and user data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Redirect to dashboard
        router.push('/');
      } catch (err) {
        error.value = err.response?.data?.message || 'Login failed. Please try again.';
      } finally {
        loading.value = false;
      }
    };

    return {
      form,
      loading,
      error,
      handleLogin
    };
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 20px;
}

.card {
  border: none;
  border-radius: 10px;
}

.card-body {
  padding: 2rem;
}

h2 {
  color: #333;
  font-weight: 600;
}

.btn-primary {
  padding: 0.5rem 1.5rem;
  font-weight: 500;
}

.alert {
  margin-bottom: 1.5rem;
}
</style>
