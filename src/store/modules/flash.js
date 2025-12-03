const state = {
  message: '',
  type: 'success' // 'success' or 'error'
};

const mutations = {
  setFlash(state, { message, type = 'success' }) {
    state.message = message;
    state.type = type;
  },
  clearFlash(state) {
    state.message = '';
    state.type = 'success';
  }
};

const actions = {
  showFlash({ commit }, { message, type = 'success' }) {
    commit('setFlash', { message, type });
    
    // Auto-clear flash message after 5 seconds
    if (message) {
      setTimeout(() => {
        commit('clearFlash');
      }, 5000);
    }
  },
  clearFlash({ commit }) {
    commit('clearFlash');
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
