<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Evacuees</h1>
      <router-link to="/evacuees/new" class="btn btn-primary">
        <i class="fas fa-plus me-2"></i>Add New Evacuee
      </router-link>
    </div>

    <!-- Search and Filter -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <div class="input-group">
              <span class="input-group-text"><i class="fas fa-search"></i></span>
              <input 
                type="text" 
                class="form-control" 
                placeholder="Search evacuees..."
                v-model="searchQuery"
                @input="filterEvacuees"
              >
            </div>
          </div>
          <div class="col-md-3">
            <select class="form-select" v-model="statusFilter" @change="filterEvacuees">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="transferred">Transferred</option>
              <option value="relocated">Relocated</option>
            </select>
          </div>
          <div class="col-md-3">
            <select class="form-select" v-model="centerFilter" @change="filterEvacuees">
              <option value="">All Centers</option>
              <option v-for="center in evacuationCenters" :key="center.id" :value="center.id">
                {{ center.name }}
              </option>
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

    <!-- Evacuees Table -->
    <div class="card">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Contact</th>
                <th>Center</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredEvacuees.length === 0">
                <td colspan="8" class="text-center py-4">
                  <div v-if="loading" class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                  <div v-else class="text-muted">
                    No evacuees found
                  </div>
                </td>
              </tr>
              <tr v-for="evacuee in paginatedEvacuees" :key="evacuee.id">
                <td>{{ evacuee.id }}</td>
                <td>
                  <div class="d-flex align-items-center">
                    <div class="avatar-sm me-2">
                      <span class="avatar-title bg-soft-primary text-primary rounded-circle">
                        {{ getInitials(evacuee.name) }}
                      </span>
                    </div>
                    <div>
                      <h6 class="mb-0">{{ evacuee.name }}</h6>
                      <small class="text-muted">{{ evacuee.family_members }} family members</small>
                    </div>
                  </div>
                </td>
                <td>{{ evacuee.age }}</td>
                <td>{{ evacuee.gender }}</td>
                <td>{{ evacuee.contact_number || 'N/A' }}</td>
                <td>{{ getCenterName(evacuee.center_id) }}</td>
                <td>
                  <span :class="'badge bg-' + getStatusBadge(evacuee.status)">
                    {{ evacuee.status }}
                  </span>
                </td>
                <td>
                  <div class="btn-group" role="group">
                    <button 
                      type="button" 
                      class="btn btn-sm btn-outline-primary"
                      @click="viewEvacuee(evacuee.id)"
                      title="View Details"
                    >
                      <i class="fas fa-eye"></i>
                    </button>
                    <button 
                      type="button" 
                      class="btn btn-sm btn-outline-secondary"
                      @click="editEvacuee(evacuee.id)"
                      title="Edit"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      type="button" 
                      class="btn btn-sm btn-outline-danger"
                      @click="confirmDelete(evacuee)"
                      title="Delete"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="d-flex justify-content-between align-items-center p-3 border-top">
          <div class="text-muted">
            Showing <span class="fw-bold">{{ (currentPage - 1) * perPage + 1 }}</span> to 
            <span class="fw-bold">{{ Math.min(currentPage * perPage, filteredEvacuees.length) }}</span> of 
            <span class="fw-bold">{{ filteredEvacuees.length }}</span> entries
          </div>
          <nav>
            <ul class="pagination mb-0">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="currentPage--">Previous</button>
              </li>
              <li 
                v-for="page in totalPages" 
                :key="page" 
                class="page-item"
                :class="{ active: page === currentPage }"
              >
                <button class="page-link" @click="currentPage = page">{{ page }}</button>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button class="page-link" @click="currentPage++">Next</button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div class="modal fade" id="deleteModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirm Deletion</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete <strong>{{ selectedEvacuee?.name }}</strong>? This action cannot be undone.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-danger" @click="deleteEvacuee">
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Modal } from 'bootstrap';

export default {
  name: 'EvacueesView',
  setup() {
    const router = useRouter();
    const loading = ref(true);
    const deleting = ref(false);
    const evacuees = ref([]);
    const filteredEvacuees = ref([]);
    const selectedEvacuee = ref(null);
    const searchQuery = ref('');
    const statusFilter = ref('');
    const centerFilter = ref('');
    const currentPage = ref(1);
    const perPage = 10;
    const deleteModal = ref(null);
    
    // Mock data for evacuation centers - replace with API call
    const evacuationCenters = ref([
      { id: 1, name: 'Main Evacuation Center' },
      { id: 2, name: 'North Evacuation Center' },
      { id: 3, name: 'South Evacuation Center' },
    ]);

    // Mock data for evacuees - replace with API call
    const mockEvacuees = [
      {
        id: 1,
        name: 'Juan Dela Cruz',
        age: 35,
        gender: 'Male',
        contact_number: '09123456789',
        center_id: 1,
        status: 'active',
        family_members: 4,
        date_registered: '2023-05-15',
        medical_conditions: 'None',
        special_needs: 'None'
      },
      {
        id: 2,
        name: 'Maria Santos',
        age: 28,
        gender: 'Female',
        contact_number: '09123456780',
        center_id: 2,
        status: 'active',
        family_members: 3,
        date_registered: '2023-05-14',
        medical_conditions: 'Asthma',
        special_needs: 'Wheelchair access'
      },
      // Add more mock data as needed
    ];

    const fetchEvacuees = async () => {
      try {
        loading.value = true;
        // Replace with actual API call
        // const response = await axios.get('/api/evacuees');
        // evacuees.value = response.data;
        
        // Using mock data for now
        evacuees.value = mockEvacuees;
        filteredEvacuees.value = [...evacuees.value];
      } catch (error) {
        console.error('Error fetching evacuees:', error);
      } finally {
        loading.value = false;
      }
    };

    const filterEvacuees = () => {
      currentPage.value = 1; // Reset to first page when filters change
      
      filteredEvacuees.value = evacuees.value.filter(evacuee => {
        const matchesSearch = evacuee.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                           evacuee.contact_number?.includes(searchQuery.value);
        
        const matchesStatus = !statusFilter.value || evacuee.status === statusFilter.value;
        const matchesCenter = !centerFilter.value || evacuee.center_id === parseInt(centerFilter.value);
        
        return matchesSearch && matchesStatus && matchesCenter;
      });
    };

    const resetFilters = () => {
      searchQuery.value = '';
      statusFilter.value = '';
      centerFilter.value = '';
      filterEvacuees();
    };

    const getStatusBadge = (status) => {
      const statusMap = {
        'active': 'success',
        'transferred': 'warning',
        'relocated': 'info',
        'deceased': 'dark'
      };
      return statusMap[status] || 'secondary';
    };

    const getCenterName = (centerId) => {
      const center = evacuationCenters.value.find(c => c.id === centerId);
      return center ? center.name : 'N/A';
    };

    const getInitials = (name) => {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    const viewEvacuee = (id) => {
      router.push(`/evacuees/${id}`);
    };

    const editEvacuee = (id) => {
      router.push(`/evacuees/${id}/edit`);
    };

    const confirmDelete = (evacuee) => {
      selectedEvacuee.value = evacuee;
      if (!deleteModal.value) {
        deleteModal.value = new Modal(document.getElementById('deleteModal'));
      }
      deleteModal.value.show();
    };

    const deleteEvacuee = async () => {
      if (!selectedEvacuee.value) return;
      
      try {
        deleting.value = true;
        // Replace with actual API call
        // await axios.delete(`/api/evacuees/${selectedEvacuee.value.id}`);
        
        // Update local state
        const index = evacuees.value.findIndex(e => e.id === selectedEvacuee.value.id);
        if (index !== -1) {
          evacuees.value.splice(index, 1);
          filterEvacuees();
        }
        
        // Close modal
        deleteModal.value.hide();
        
        // Show success message
        // You can use a toast notification here
        alert('Evacuee deleted successfully');
      } catch (error) {
        console.error('Error deleting evacuee:', error);
        alert('Failed to delete evacuee. Please try again.');
      } finally {
        deleting.value = false;
      }
    };

    // Computed properties
    const paginatedEvacuees = computed(() => {
      const start = (currentPage.value - 1) * perPage;
      const end = start + perPage;
      return filteredEvacuees.value.slice(start, end);
    });

    const totalPages = computed(() => {
      return Math.ceil(filteredEvacuees.value.length / perPage);
    });

    // Lifecycle hooks
    onMounted(() => {
      fetchEvacuees();
    });

    return {
      loading,
      deleting,
      searchQuery,
      statusFilter,
      centerFilter,
      currentPage,
      perPage,
      filteredEvacuees,
      paginatedEvacuees,
      totalPages,
      selectedEvacuee,
      evacuationCenters,
      
      filterEvacuees,
      resetFilters,
      getStatusBadge,
      getCenterName,
      getInitials,
      viewEvacuee,
      editEvacuee,
      confirmDelete,
      deleteEvacuee
    };
  }
};
</script>

<style scoped>
.avatar-sm {
  width: 2.5rem;
  height: 2.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #e9ecef;
  border-radius: 0.25rem;
  font-weight: 600;
  font-size: 0.875rem;
}

.table th {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
  color: #6c757d;
  border-top: none;
  padding: 1rem;
}

.table td {
  padding: 1rem;
  vertical-align: middle;
}

.table-hover tbody tr:hover {
  background-color: #f8f9fa;
}

.btn-group .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.pagination {
  margin-bottom: 0;
}

.page-item.active .page-link {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.page-link {
  color: #0d6efd;
}

.modal-header {
  border-bottom: 1px solid #e9ecef;
}

.modal-footer {
  border-top: 1px solid #e9ecef;
}
</style>
