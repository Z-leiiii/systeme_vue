<template>
  <div class="auth-layout">
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1>HANDA</h1>
          <p>Disaster Management System</p>
        </div>
        
        <!-- Flash Messages -->
        <div v-if="$store.state.flash.message" 
             :class="['alert', $store.state.flash.type === 'success' ? 'alert-success' : 'alert-error']">
          {{ $store.state.flash.message }}
        </div>
        
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AuthLayout',
  created() {
    // Set body styles for auth pages
    document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    document.body.style.minHeight = '100vh';
    document.body.style.margin = '0';
  },
  beforeUnmount() {
    // Reset body styles when leaving auth pages
    document.body.style.background = '';
    document.body.style.minHeight = '';
    document.body.style.margin = '';
  }
};
</script>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.auth-container {
  width: 100%;
  max-width: 400px;
}

.auth-card {
  background: white;
  border-radius: 12px;
  padding: 2.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-header h1 {
  color: #667eea;
  font-size: 2.5rem;
  margin: 0 0 0.5rem 0;
}

.auth-header p {
  color: #6b7280;
  margin: 0;
  font-size: 1.1rem;
}

/* Reuse the alert styles from MainLayout */
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
</style>
