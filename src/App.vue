<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  created() {
    // Initialize flash messages from session storage if they exist
    const flash = sessionStorage.getItem('flash');
    if (flash) {
      const { message, type = 'success' } = JSON.parse(flash);
      this.$store.commit('setFlash', { message, type });
      sessionStorage.removeItem('flash');
    }
  }
};
</script>

<style>
/* Base styles are now in MainLayout.vue */
</style>
