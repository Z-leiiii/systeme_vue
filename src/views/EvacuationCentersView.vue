<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Evacuation Centers</h1>
      <router-link to="/evacuation-centers/new" class="btn btn-primary">
        <i class="fas fa-plus me-2"></i>Add New Center
      </router-link>
    </div>

    <!-- Search and Filter -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text"><i class="fas fa-search"></i></span>
              <input 
                type="text" 
                class="form-control" 
                placeholder="Search centers..."
                v-model="searchQuery"
                @input="filterCenters"
              >
            </div>
          </div>
          <div class="col-md-4">
            <select class="form-select" v-model="statusFilter" @change="filterCenters">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="full">At Capacity</option>
            </select>
          </div>
          <div class="col-md-2">
            <button class="btn btn-outline-secondary w-100" @click="resetFilters">
              <i class="fas fa-sync-alt me-1"></i> Reset
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Centers Grid -->
    <div class="row">
      <div 
        v-for="center in filteredCenters" 
        :key="center.id" 
        class="col-md-6 col-lg-4 mb-4"
      >
        <div class="card h-100">
          <div 
            class="card-img-top bg-light" 
            :style="{ height: '150px', backgroundImage: 'url(' + (center.image || 'https://via.placeholder.com/400x200') + ')' }"
            style="background-size: cover; background-position: center;"
          >
            <div class="position-absolute top-0 end-0 m-2">
              <span :class="`badge ${getStatusBadge(center.status).class} bg-opacity-75`">
                {{ center.status }}
              </span>
            </div>
          </div>
          <div class="card-body">
            <h5 class="card-title mb-2">{{ center.name }}</h5>
            <p class="text-muted mb-3">
              <i class="fas fa-map-marker-alt me-2"></i>{{ center.address }}
            </p>
            
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div>
                <div class="text-muted small">Capacity</div>
                <div class="fw-bold">{{ center.current_occupancy }} / {{ center.max_capacity }}</div>
              </div>
              <div class="text-end">
                <div class="text-muted small">Available Beds</div>
                <div class="fw-bold">{{ center.available_beds }}</div>
              </div>
            </div>
            
            <div class="progress mb-3" style="height: 8px;">
              <div 
                class="progress-bar" 
                :class="getCapacityClass(center.current_occupancy, center.max_capacity)"
                :style="{ width: Math.min(100, (center.current_occupancy / center.max_capacity) * 100) + '%' }"
                role="progressbar"
              ></div>
            </div>
            
            <div class="d-flex justify-content-between">
              <router-link 
                :to="'/evacuation-centers/' + center.id" 
                class="btn btn-sm btn-outline-primary"
              >
                <i class="fas fa-eye me-1"></i> View
              </router-link>
              <div class="btn-group">
                <router-link 
                  :to="'/evacuation-centers/' + center.id + '/edit'" 
                  class="btn btn-sm btn-outline-secondary"
                >
                  <i class="fas fa-edit"></i>
                </router-link>
                <button 
                  class="btn btn-sm btn-outline-danger"
                  @click="confirmDelete(center)"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Empty State -->
      <div 
        v-if="filteredCenters.length === 0" 
        class="col-12 text-center py-5"
      >
        <div class="mb-3">
          <i class="fas fa-building fa-3x text-muted"></i>
        </div>
        <h5 class="text-muted">No evacuation centers found</h5>
        <p class="text-muted">
          {{ searchQuery || statusFilter ? 'Try adjusting your search or filters' : 'Add a new evacuation center to get started' }}
        </p>
        <router-link 
          v-if="!searchQuery && !statusFilter" 
          to="/evacuation-centers/new" 
          class="btn btn-primary mt-2"
        >
          <i class="fas fa-plus me-2"></i>Add Center
        </router-link>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div class="modal fade" id="deleteCenterModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirm Deletion</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete <strong>{{ selectedCenter?.name }}</strong>? This action cannot be undone.</p>
            <div v-if="selectedCenter?.current_occupancy > 0" class="alert alert-warning">
              <i class="fas fa-exclamation-triangle me-2"></i>
              This center currently has {{ selectedCenter?.current_occupancy }} evacuees. 
              Please relocate them before deleting this center.
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button 
              type="button" 
              class="btn btn-danger" 
              @click="deleteCenter"
              :disabled="selectedCenter?.current_occupancy > 0 || deleting"
            >
              <span v-if="deleting" class="spinner-border spinner-border-sm me-1" role="status"></span>
              {{ deleting ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { Modal } from 'bootstrap';

export default {
  name: 'EvacuationCentersView',
  setup() {
    const loading = ref(true);
    const deleting = ref(false);
    const centers = ref([]);
    const filteredCenters = ref([]);
    const selectedCenter = ref(null);
    const searchQuery = ref('');
    const statusFilter = ref('');
    let deleteModal = null;

    // Mock data - replace with API call
    const mockCenters = [
      {
        id: 1,
        name: 'Main Evacuation Center',
        address: '123 Main St, City',
        contact_person: 'John Doe',
        contact_number: '09123456789',
        max_capacity: 500,
        current_occupancy: 342,
        available_beds: 158,
        status: 'active',
        image: 'https://source.unsplash.com/random/800x400/?shelter,emergency'
      },
      {
        id: 2,
        name: 'North Evacuation Center',
        address: '456 North Ave, City',
        contact_person: 'Jane Smith',
        contact_number: '09123456780',
        max_capacity: 300,
        current_occupancy: 300,
        available_beds: 0,
        status: 'full',
        image: 'https://source.unsplash.com/random/800x400/?shelter,aid'
      },
      {
        id: 3,
        name: 'South Evacuation Center',
        address: '789 South St, City',
        contact_person: 'Robert Johnson',
        contact_number: '09123456781',
        max_capacity: 400,
        current_occupancy: 150,
        available_beds: 250,
        status: 'active',
        image: 'https://source.unsplash.com/random/800x400/?refuge,center'
      },
    ];

    const fetchCenters = async () => {
      try {
        loading.value = true;
        // Replace with actual API call
        // const response = await axios.get('/api/evacuation-centers');
        // centers.value = response.data;
        
        // Using mock data for now
        centers.value = mockCenters;
        filteredCenters.value = [...centers.value];
      } catch (error) {
        console.error('Error fetching evacuation centers:', error);
      } finally {
        loading.value = false;
      }
    };

    const filterCenters = () => {
      filteredCenters.value = centers.value.filter(center => {
        const matchesSearch = center.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                           center.address.toLowerCase().includes(searchQuery.value.toLowerCase());
        
        const matchesStatus = !statusFilter.value || center.status === statusFilter.value;
        
        return matchesSearch && matchesStatus;
      });
    };

    const resetFilters = () => {
      searchQuery.value = '';
      statusFilter.value = '';
      filterCenters();
    };

    const getStatusBadge = (status) => {
      const statusMap = {
        'active': { class: 'bg-success', text: 'Active' },
        'inactive': { class: 'bg-secondary', text: 'Inactive' },
        'full': { class: 'bg-danger', text: 'At Capacity' },
        'maintenance': { class: 'bg-warning', text: 'Under Maintenance' }
      };
      return statusMap[status] || { class: 'bg-secondary', text: status };
    };

    const getCapacityClass = (current, max) => {
      const percentage = (current / max) * 100;
      if (percentage >= 90) return 'bg-danger';
      if (percentage >= 70) return 'bg-warning';
      return 'bg-success';
    };

    const confirmDelete = (center) => {
      selectedCenter.value = center;
      if (!deleteModal) {
        deleteModal = new Modal(document.getElementById('deleteCenterModal'));
      }
      deleteModal.show();
    };

    const deleteCenter = async () => {
      if (!selectedCenter.value) return;
      
      try {
        deleting.value = true;
        // Replace with actual API call
        // await axios.delete(`/api/evacuation-centers/${selectedCenter.value.id}`);
        
        // Update local state
        const index = centers.value.findIndex(c => c.id === selectedCenter.value.id);
        if (index !== -1) {
          centers.value.splice(index, 1);
          filterCenters();
        }
        
        // Close modal
        deleteModal.hide();
        
        // Show success message
        alert('Evacuation center deleted successfully');
      } catch (error) {
        console.error('Error deleting evacuation center:', error);
        alert('Failed to delete evacuation center. Please try again.');
      } finally {
        deleting.value = false;
      }
    };

    // Lifecycle hooks
    onMounted(() => {
      fetchCenters();
    });

    return {
      loading,
      deleting,
      searchQuery,
      statusFilter,
      centers: filteredCenters,
      filteredCenters,
      selectedCenter,
      filterCenters,
      resetFilters,
      getStatusBadge,
      getCapacityClass,
      confirmDelete,
      deleteCenter
    };
  }
};
</script>

<style scoped>
.card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.05);
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1);
}

.card-img-top {
  border-radius: 0.25rem 0.25rem 0 0;
  position: relative;
}

.badge {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.35em 0.65em;
  text-transform: capitalize;
}

.progress {
  border-radius: 10px;
  overflow: hidden;
}

.progress-bar {
  transition: width 0.6s ease;
}

.btn-outline-primary, .btn-outline-secondary, .btn-outline-danger {
  border-width: 1px;
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
}

.btn-group .btn {
  padding: 0.25rem 0.5rem;
}

.alert-warning {
  background-color: #fff3cd;
  border-color: #ffeeba;
  color: #856404;
  font-size: 0.875rem;
  margin-top: 1rem;
  padding: 0.75rem 1.25rem;
}
</style>
