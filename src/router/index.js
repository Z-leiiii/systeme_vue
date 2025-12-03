import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '@/layouts/MainLayout.vue';

const routes = [
  // Main application routes with MainLayout
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/DashboardView.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'real-time-data',
        name: 'RealTimeData',
        component: () => import('@/views/RealTimeDataView.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'disaster-predictions',
        name: 'DisasterPredictions',
        component: () => import('@/views/DisasterPredictionsView.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'disaster-updates',
        name: 'DisasterUpdates',
        component: () => import('@/views/DisasterUpdatesView.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'evacuation-centers',
        name: 'EvacuationCenters',
        component: () => import('@/views/EvacuationCentersView.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'families',
        name: 'Families',
        component: () => import('@/views/FamiliesView.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'evacuees',
        name: 'Evacuees',
        component: () => import('@/views/EvacueesView.vue'),
        meta: { requiresAuth: true }
      }
    ]
  },
  
  // Redirect all other routes to dashboard
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

// Navigation guard to handle page titles
router.beforeEach((to) => {
  // Set page title
  if (to.name) {
    document.title = `${String(to.name).replace(/([A-Z])/g, ' $1').trim()} - HANDA`;
  }
  
  // Redirect to dashboard for any route that's not found
  if (to.matched.length === 0) {
    return { name: 'Dashboard' };
  }
});

export default router;
