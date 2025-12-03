<template>
  <div>
    <h1 class="mb-4">Dashboard</h1>
    
    <!-- Stats Cards -->
    <div class="row">
      <div class="col-md-3 mb-4" v-for="(stat, index) in stats" :key="index">
        <div class="card h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="text-uppercase text-muted mb-1">{{ stat.title }}</h6>
                <h3 class="mb-0">{{ stat.value }}</h3>
              </div>
              <div class="icon-shape bg-soft-primary text-primary rounded-3">
                <i :class="stat.icon"></i>
              </div>
            </div>
            <div class="mt-2" v-if="stat.change !== undefined">
              <span :class="stat.change >= 0 ? 'text-success' : 'text-danger'">
                <i :class="stat.change >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
                {{ Math.abs(stat.change) }}%
              </span>
              <span class="text-muted"> vs last month</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="row mt-4">
      <div class="col-md-8 mb-4">
        <div class="card h-100">
          <div class="card-header">
            <h5 class="card-title mb-0">Recent Activity</h5>
          </div>
          <div class="card-body">
            <div v-if="activities.length === 0" class="text-center py-4">
              <p class="text-muted">No recent activities found</p>
            </div>
            <ul v-else class="list-group list-group-flush">
              <li v-for="(activity, index) in activities" :key="index" class="list-group-item px-0">
                <div class="d-flex">
                  <div class="flex-shrink-0">
                    <div class="avatar-sm">
                      <span class="avatar-title bg-soft-primary text-primary rounded-circle">
                        <i :class="activity.icon"></i>
                      </span>
                    </div>
                  </div>
                  <div class="flex-grow-1 ms-3">
                    <h6 class="mb-1">{{ activity.title }}</h6>
                    <p class="text-muted mb-0">{{ activity.description }}</p>
                    <small class="text-muted">{{ activity.time }}</small>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="col-md-4 mb-4">
        <div class="card h-100">
          <div class="card-header">
            <h5 class="card-title mb-0">Quick Actions</h5>
          </div>
          <div class="card-body">
            <div class="d-grid gap-2">  
              <router-link 
                v-for="(action, index) in quickActions" 
                :key="index"
                :to="action.to"
                class="btn btn-outline-primary btn-sm text-start mb-2"
              >
                <i :class="action.icon + ' me-2'"></i> {{ action.label }}
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  name: 'DashboardView',
  setup() {
    const stats = ref([
      { title: 'Total Evacuees', value: '0', icon: 'fas fa-users', change: 0 },
      { title: 'Active Centers', value: '0', icon: 'fas fa-home', change: 0 },
      { title: 'Available Beds', value: '0', icon: 'fas fa-bed', change: 0 },
      { title: 'Relief Packs', value: '0', icon: 'fas fa-box-open', change: 0 }
    ]);

    const activities = ref([
      { 
        icon: 'fas fa-user-plus',
        title: 'New Evacuee Registered',
        description: 'John Doe was registered at Main Evacuation Center',
        time: '10 minutes ago'
      },
      { 
        icon: 'fas fa-ambulance',
        title: 'Medical Emergency',
        description: 'Medical team dispatched to Central Evacuation',
        time: '1 hour ago'
      },
      { 
        icon: 'fas fa-box',
        title: 'Supply Delivery',
        description: '100 food packs delivered to North Evacuation',
        time: '3 hours ago'
      }
    ]);

    const quickActions = ref([
      { label: 'Register New Evacuee', to: '/evacuees/new', icon: 'fas fa-user-plus' },
      { label: 'Update Inventory', to: '/inventory', icon: 'fas fa-boxes' },
      { label: 'Generate Report', to: '/reports', icon: 'fas fa-file-alt' },
      { label: 'Manage Centers', to: '/evacuation-centers', icon: 'fas fa-home' }
    ]);

    const fetchDashboardData = async () => {
      try {
        // Replace with your actual API endpoint
        // const response = await axios.get('/api/dashboard');
        // stats.value = response.data.stats;
        
        // Mock data for now
        stats.value = [
          { title: 'Total Evacuees', value: '1,245', icon: 'fas fa-users', change: 12 },
          { title: 'Active Centers', value: '8', icon: 'fas fa-home', change: 0 },
          { title: 'Available Beds', value: '342', icon: 'fas fa-bed', change: -5 },
          { title: 'Relief Packs', value: '1,024', icon: 'fas fa-box-open', change: 8 }
        ];
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    onMounted(() => {
      fetchDashboardData();
    });

    return {
      stats,
      activities,
      quickActions
    };
  }
};
</script>

<style scoped>
.icon-shape {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  font-size: 1.25rem;
}

.avatar-sm {
  width: 2.5rem;
  height: 2.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  transition: transform 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-2px);
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.list-group-item {
  border-left: none;
  border-right: none;
  padding: 1rem 0;
}

.list-group-item:first-child {
  border-top: none;
  padding-top: 0;
}

.list-group-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.btn-outline-primary {
  border-radius: 0.25rem;
  padding: 0.5rem 1rem;
  transition: all 0.2s;
}

.btn-outline-primary:hover {
  background-color: #0d6efd;
  color: white;
}
</style>
