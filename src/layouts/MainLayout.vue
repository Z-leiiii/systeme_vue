<template>
  <div class="app-container">
    <!-- Navigation -->
    <nav class="navbar">
      <div class="navbar-container">
        <router-link to="/" class="navbar-brand">
          HANDA
        </router-link>
        <ul class="navbar-menu">
          <li><router-link to="/dashboard" class="nav-link" :class="{'active': $route.path === '/dashboard'}">Dashboard</router-link></li>
          <li><router-link to="/real-time-data" class="nav-link" :class="{'active': $route.path.startsWith('/real-time-data')}">Real-Time Data</router-link></li>
          <li><router-link to="/evacuation-centers" class="nav-link" :class="{'active': $route.path.startsWith('/evacuation-centers')}">Evacuation Areas</router-link></li>
          <li><router-link to="/disaster-updates" class="nav-link" :class="{'active': $route.path.startsWith('/disaster-updates')}">Updates</router-link></li>
          <li><router-link to="/disaster-predictions" class="nav-link" :class="{'active': $route.path.startsWith('/disaster-predictions')}">Predictions</router-link></li>
          <li><router-link to="/families" class="nav-link" :class="{'active': $route.path.startsWith('/families')}">Families</router-link></li>
        </ul>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="container">
      <!-- Flash Messages -->
      <div v-if="$store.state.flash.message" 
           :class="['alert', $store.state.flash.type === 'success' ? 'alert-success' : 'alert-error']">
        {{ $store.state.flash.message }}
      </div>

      <router-view />
    </div>

    <!-- Map container will be rendered here -->
  </div>
</template>

<script>
export default {
  name: 'MainLayout',
  data() {
    return {
      user: JSON.parse(localStorage.getItem('user') || '{}')
    };
  },
  methods: {
    logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.$router.push('/login');
    }
  }
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.navbar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-brand {
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.navbar-brand::before {
  content: "🛡️";
  font-size: 1.8rem;
}

.navbar-menu {
  display: flex;
  gap: 2rem;
  list-style: none;
}

.navbar-menu a {
  color: #333;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
  padding: 0.5rem 1rem;
  border-radius: 5px;
}

.navbar-menu a:hover,
.navbar-menu a.active {
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.container {
  max-width: 1600px;
  margin: 2rem auto;
  padding: 0 2rem;
}

.alert {
  padding: 1rem 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.alert-success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.alert-error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  margin-bottom: 1.5rem;
}

.card-header {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #667eea;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5568d3;
}

.btn-danger {
  background: #e53e3e;
  color: white;
}

.btn-danger:hover {
  background: #c53030;
}

.table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.table th,
.table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.table th {
  background: #f7fafc;
  font-weight: 600;
  color: #4a5568;
}

.table tbody tr:hover {
  background: #f8f9fa;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #4a5568;
}

.form-control {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-control:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.text-center {
  text-align: center;
}

.mt-1 { margin-top: 0.25rem; }
.mt-2 { margin-top: 0.5rem; }
.mt-3 { margin-top: 1rem; }
.mt-4 { margin-top: 1.5rem; }
.mt-5 { margin-top: 2rem; }

.mb-1 { margin-bottom: 0.25rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-3 { margin-bottom: 1rem; }
.mb-4 { margin-bottom: 1.5rem; }
.mb-5 { margin-bottom: 2rem; }
</style>
