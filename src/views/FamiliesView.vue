<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="mb-1">Families</h1>
        <p class="text-muted mb-0">Manage family units and their members</p>
      </div>
      <div>
        <button class="btn btn-primary me-2" @click="showNewFamilyModal">
          <i class="fas fa-plus me-2"></i>Add Family
        </button>
        <button class="btn btn-outline-secondary" @click="exportFamilies">
          <i class="fas fa-file-export me-2"></i>Export
        </button>
      </div>
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
                placeholder="Search families..."
                v-model="searchQuery"
                @input="filterFamilies"
              >
            </div>
          </div>
          <div class="col-md-3">
            <select class="form-select" v-model="evacuationCenterFilter" @change="filterFamilies">
              <option value="">All Evacuation Centers</option>
              <option v-for="center in evacuationCenters" :key="center.id" :value="center.id">
                {{ center.name }}
              </option>
            </select>
          </div>
          <div class="col-md-3">
            <select class="form-select" v-model="statusFilter" @change="filterFamilies">
              <option value="">All Status</option>
              <option value="evacuated">Evacuated</option>
              <option value="relocated">Relocated</option>
              <option value="returned">Returned Home</option>
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

    <!-- Families List -->
    <div class="row">
      <!-- Main Content -->
      <div class="col-lg-8">
        <div class="card">
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Family ID</th>
                    <th>Head of Family</th>
                    <th>Members</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="filteredFamilies.length === 0">
                    <td colspan="6" class="text-center py-4">
                      <div v-if="loading" class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                      </div>
                      <div v-else class="text-muted">
                        No families found
                      </div>
                    </td>
                  </tr>
                  <tr 
                    v-for="family in paginatedFamilies" 
                    :key="family.id"
                    @click="selectFamily(family)"
                    :class="{ 'table-active': selectedFamily?.id === family.id }"
                    style="cursor: pointer;"
                  >
                    <td>FAM-{{ family.id.toString().padStart(4, '0') }}</td>
                    <td>
                      <div class="d-flex align-items-center">
                        <div class="avatar-sm me-2">
                          <span class="avatar-title bg-soft-primary text-primary rounded-circle">
                            {{ getInitials(family.headOfFamily) }}
                          </span>
                        </div>
                        <div>
                          <h6 class="mb-0">{{ family.headOfFamily }}</h6>
                          <small class="text-muted">{{ family.contactNumber }}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div class="avatar-group">
                        <span 
                          v-for="(member, index) in family.members.slice(0, 4)" 
                          :key="index"
                          class="avatar-xs"
                          :title="member.name"
                        >
                          <span class="avatar-title rounded-circle" :class="`bg-${getMemberColor(member.relation)}-soft text-${getMemberColor(member.relation)}`">
                            {{ member.name.charAt(0).toUpperCase() }}
                          </span>
                        </span>
                        <span 
                          v-if="family.members.length > 4" 
                          class="avatar-xs"
                          :title="`+${family.members.length - 4} more`"
                        >
                          <span class="avatar-title rounded-circle bg-light text-dark">
                            +{{ family.members.length - 4 }}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div>{{ family.evacuationCenter || 'N/A' }}</div>
                        <small class="text-muted">{{ family.address }}</small>
                      </div>
                    </td>
                    <td>
                      <span :class="`badge bg-${getStatusClass(family.status)}`">
                        {{ family.status }}
                      </span>
                    </td>
                    <td>
                      <div class="btn-group">
                        <button 
                          class="btn btn-sm btn-outline-primary"
                          @click.stop="viewFamilyDetails(family.id)"
                          title="View Details"
                        >
                          <i class="fas fa-eye"></i>
                        </button>
                        <button 
                          class="btn btn-sm btn-outline-secondary"
                          @click.stop="editFamily(family.id)"
                          title="Edit"
                        >
                          <i class="fas fa-edit"></i>
                        </button>
                        <button 
                          class="btn btn-sm btn-outline-danger"
                          @click.stop="confirmDelete(family)"
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
                <span class="fw-bold">{{ Math.min(currentPage * perPage, filteredFamilies.length) }}</span> of 
                <span class="fw-bold">{{ filteredFamilies.length }}</span> entries
              </div>
              <nav>
                <ul class="pagination mb-0">
                  <li class="page-item" :class="{ disabled: currentPage === 1 }">
                    <button class="page-link" @click="currentPage--">Previous</button>
                  </li>
                  <li 
                    v-for="page in totalPages" 
                    :key="'page-' + page" 
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
      </div>
      
      <!-- Family Details Sidebar -->
      <div class="col-lg-4">
        <div class="card h-100">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Family Details</h5>
            <div v-if="selectedFamily">
              <button 
                class="btn btn-sm btn-outline-secondary me-1"
                @click="editFamily(selectedFamily.id)"
                title="Edit"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button 
                class="btn btn-sm btn-outline-danger"
                @click="confirmDelete(selectedFamily)"
                title="Delete"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          
          <div v-if="!selectedFamily" class="card-body d-flex flex-column align-items-center justify-content-center text-center" style="min-height: 300px;">
            <div class="mb-3">
              <i class="fas fa-users fa-3x text-muted"></i>
            </div>
            <h5 class="mb-2">No Family Selected</h5>
            <p class="text-muted mb-4">Select a family to view details</p>
            <button class="btn btn-primary" @click="showNewFamilyModal">
              <i class="fas fa-plus me-2"></i>Add New Family
            </button>
          </div>
          
          <div v-else class="card-body">
            <div class="text-center mb-4">
              <div class="avatar-xxl mb-3">
                <span class="avatar-title rounded-circle bg-soft-primary text-primary" style="font-size: 2.5rem;">
                  {{ getInitials(selectedFamily.headOfFamily) }}
                </span>
              </div>
              <h4>{{ selectedFamily.headOfFamily }}</h4>
              <p class="text-muted mb-0">Family ID: FAM-{{ selectedFamily.id.toString().padStart(4, '0') }}</p>
              <span :class="`badge bg-${getStatusClass(selectedFamily.status)} mt-2`">
                {{ selectedFamily.status }}
              </span>
            </div>
            
            <div class="mb-4">
              <h6 class="text-uppercase text-muted mb-3">Contact Information</h6>
              <ul class="list-unstyled mb-0">
                <li class="mb-2">
                  <i class="fas fa-phone me-2 text-muted"></i>
                  {{ selectedFamily.contactNumber || 'N/A' }}
                </li>
                <li class="mb-2">
                  <i class="fas fa-envelope me-2 text-muted"></i>
                  {{ selectedFamily.email || 'N/A' }}
                </li>
                <li class="mb-2">
                  <i class="fas fa-map-marker-alt me-2 text-muted"></i>
                  {{ selectedFamily.address || 'N/A' }}
                </li>
                <li v-if="selectedFamily.evacuationCenter">
                  <i class="fas fa-home me-2 text-muted"></i>
                  {{ selectedFamily.evacuationCenter }}
                </li>
              </ul>
            </div>
            
            <div class="mb-4">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="text-uppercase text-muted mb-0">Family Members ({{ selectedFamily.members.length }})</h6>
                <button 
                  class="btn btn-sm btn-outline-primary"
                  @click="addFamilyMember(selectedFamily.id)"
                >
                  <i class="fas fa-plus"></i> Add
                </button>
              </div>
              
              <div class="list-group list-group-flush">
                <div 
                  v-for="(member, index) in selectedFamily.members" 
                  :key="index"
                  class="list-group-item px-0"
                >
                  <div class="d-flex align-items-center">
                    <div class="avatar-sm me-3">
                      <span class="avatar-title rounded-circle" :class="`bg-${getMemberColor(member.relation)}-soft text-${getMemberColor(member.relation)}`">
                        {{ member.name.charAt(0).toUpperCase() }}
                      </span>
                    </div>
                    <div class="flex-grow-1">
                      <h6 class="mb-0">{{ member.name }}</h6>
                      <small class="text-muted">{{ member.relation }} • {{ member.age }} years</small>
                    </div>
                    <div class="dropdown">
                      <button 
                        class="btn btn-link text-muted p-0" 
                        type="button" 
                        data-bs-toggle="dropdown"
                        @click.stop
                      >
                        <i class="fas fa-ellipsis-v"></i>
                      </button>
                      <ul class="dropdown-menu dropdown-menu-end">
                        <li>
                          <a class="dropdown-item" href="#" @click.prevent="editFamilyMember(member, selectedFamily.id)">
                            <i class="fas fa-edit me-2"></i>Edit
                          </a>
                        </li>
                        <li>
                          <a class="dropdown-item text-danger" href="#" @click.prevent="removeFamilyMember(member, selectedFamily.id)">
                            <i class="fas fa-trash me-2"></i>Remove
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="mb-4">
              <h6 class="text-uppercase text-muted mb-3">Notes</h6>
              <div class="bg-light p-3 rounded">
                <p class="mb-0">{{ selectedFamily.notes || 'No notes available' }}</p>
              </div>
            </div>
            
            <div class="d-grid">
              <button class="btn btn-primary" @click="viewFamilyDetails(selectedFamily.id)">
                <i class="fas fa-eye me-2"></i>View Full Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Add/Edit Family Modal -->
    <div class="modal fade" id="familyModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Edit Family' : 'Add New Family' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveFamily">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Head of Family <span class="text-danger">*</span></label>
                  <input 
                    type="text" 
                    class="form-control" 
                    v-model="familyForm.headOfFamily" 
                    required
                  >
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Contact Number <span class="text-danger">*</span></label>
                  <input 
                    type="tel" 
                    class="form-control" 
                    v-model="familyForm.contactNumber" 
                    required
                  >
                </div>
              </div>
              
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Email Address</label>
                  <input 
                    type="email" 
                    class="form-control" 
                    v-model="familyForm.email"
                  >
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Status <span class="text-danger">*</span></label>
                  <select class="form-select" v-model="familyForm.status" required>
                    <option value="evacuated">Evacuated</option>
                    <option value="relocated">Relocated</option>
                    <option value="returned">Returned Home</option>
                  </select>
                </div>
              </div>
              
              <div class="mb-3">
                <label class="form-label">Home Address <span class="text-danger">*</span></label>
                <textarea 
                  class="form-control" 
                  rows="2" 
                  v-model="familyForm.address" 
                  required
                ></textarea>
              </div>
              
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Evacuation Center</label>
                  <select class="form-select" v-model="familyForm.evacuationCenterId">
                    <option value="">Select Center</option>
                    <option 
                      v-for="center in evacuationCenters" 
                      :key="center.id" 
                      :value="center.id"
                    >
                      {{ center.name }}
                    </option>
                  </select>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Date of Evacuation</label>
                  <input 
                    type="date" 
                    class="form-control" 
                    v-model="familyForm.evacuationDate"
                  >
                </div>
              </div>
              
              <div class="mb-3">
                <label class="form-label">Notes</label>
                <textarea 
                  class="form-control" 
                  rows="3" 
                  v-model="familyForm.notes"
                  placeholder="Any special notes or requirements..."
                ></textarea>
              </div>
              
              <div class="d-flex justify-content-end gap-2">
                <button 
                  type="button" 
                  class="btn btn-outline-secondary" 
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button type="submit" class="btn btn-primary">
                  <span v-if="saving" class="spinner-border spinner-border-sm me-1" role="status"></span>
                  {{ saving ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Add/Edit Family Member Modal -->
    <div class="modal fade" id="memberModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingMember ? 'Edit Family Member' : 'Add Family Member' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveFamilyMember">
              <div class="mb-3">
                <label class="form-label">Full Name <span class="text-danger">*</span></label>
                <input 
                  type="text" 
                  class="form-control" 
                  v-model="memberForm.name" 
                  required
                >
              </div>
              
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Relation <span class="text-danger">*</span></label>
                  <select class="form-select" v-model="memberForm.relation" required>
                    <option value="">Select Relation</option>
                    <option value="spouse">Spouse</option>
                    <option value="child">Child</option>
                    <option value="parent">Parent</option>
                    <option value="sibling">Sibling</option>
                    <option value="grandparent">Grandparent</option>
                    <option value="grandchild">Grandchild</option>
                    <option value="aunt">Aunt</option>
                    <option value="uncle">Uncle</option>
                    <option value="cousin">Cousin</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Age <span class="text-danger">*</span></label>
                  <input 
                    type="number" 
                    class="form-control" 
                    v-model.number="memberForm.age" 
                    min="0" 
                    max="120"
                    required
                  >
                </div>
              </div>
              
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Gender</label>
                  <select class="form-select" v-model="memberForm.gender">
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Date of Birth</label>
                  <input 
                    type="date" 
                    class="form-control" 
                    v-model="memberForm.dateOfBirth"
                  >
                </div>
              </div>
              
              <div class="mb-3">
                <label class="form-label">Medical Conditions</label>
                <textarea 
                  class="form-control" 
                  rows="2" 
                  v-model="memberForm.medicalConditions"
                  placeholder="Any known medical conditions or allergies..."
                ></textarea>
              </div>
              
              <div class="mb-3">
                <label class="form-label">Special Needs</label>
                <textarea 
                  class="form-control" 
                  rows="2" 
                  v-model="memberForm.specialNeeds"
                  placeholder="Any special needs or requirements..."
                ></textarea>
              </div>
              
              <div class="d-flex justify-content-end gap-2">
                <button 
                  type="button" 
                  class="btn btn-outline-secondary" 
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button type="submit" class="btn btn-primary">
                  <span v-if="savingMember" class="spinner-border spinner-border-sm me-1" role="status"></span>
                  {{ savingMember ? 'Saving...' : 'Save Member' }}
                </button>
              </div>
            </form>
          </div>
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
            <p>Are you sure you want to delete this family? This action cannot be undone.</p>
            <div v-if="familyToDelete" class="alert alert-warning">
              <i class="fas fa-exclamation-triangle me-2"></i>
              This will permanently delete the family and all associated member records.
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button 
              type="button" 
              class="btn btn-danger" 
              @click="deleteFamily"
              :disabled="deleting"
            >
              <span v-if="deleting" class="spinner-border spinner-border-sm me-1" role="status"></span>
              {{ deleting ? 'Deleting...' : 'Delete Family' }}
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
  name: 'FamiliesView',
  setup() {
    const router = useRouter();
    const loading = ref(false);
    const saving = ref(false);
    const savingMember = ref(false);
    const deleting = ref(false);
    const searchQuery = ref('');
    const evacuationCenterFilter = ref('');
    const statusFilter = ref('');
    const currentPage = ref(1);
    const perPage = 10;
    const isEditing = ref(false);
    const editingMember = ref(null);
    const familyToDelete = ref(null);
    const selectedFamily = ref(null);
    
    // Modals
    let familyModal = null;
    let memberModal = null;
    let deleteModal = null;
    
    // Mock data - replace with API calls
    const evacuationCenters = ref([
      { id: 1, name: 'Main Evacuation Center', capacity: 500 },
      { id: 2, name: 'North District Gym', capacity: 300 },
      { id: 3, name: 'South Elementary School', capacity: 400 },
      { id: 4, name: 'East Community Center', capacity: 250 },
      { id: 5, name: 'West High School', capacity: 600 },
    ]);
    
    const families = ref([
      {
        id: 1,
        headOfFamily: 'Juan Dela Cruz',
        contactNumber: '09123456789',
        email: 'juan.delacruz@example.com',
        address: '123 Main St, Barangay 1, City',
        evacuationCenterId: 1,
        evacuationCenter: 'Main Evacuation Center',
        evacuationDate: '2023-06-10',
        status: 'evacuated',
        notes: 'Family requires special dietary needs',
        members: [
          { id: 1, name: 'Maria Dela Cruz', relation: 'spouse', age: 35, gender: 'female' },
          { id: 2, name: 'Pedro Dela Cruz', relation: 'child', age: 10, gender: 'male' },
          { id: 3, name: 'Juana Dela Cruz', relation: 'child', age: 7, gender: 'female' },
        ]
      },
      // Add more mock data as needed
    ]);
    
    // Form models
    const familyForm = ref({
      id: null,
      headOfFamily: '',
      contactNumber: '',
      email: '',
      address: '',
      evacuationCenterId: '',
      evacuationDate: '',
      status: 'evacuated',
      notes: '',
      members: []
    });
    
    const memberForm = ref({
      id: null,
      name: '',
      relation: '',
      age: '',
      gender: '',
      dateOfBirth: '',
      medicalConditions: '',
      specialNeeds: ''
    });
    
    // Computed properties
    const filteredFamilies = computed(() => {
      return families.value.filter(family => {
        const matchesSearch = 
          family.headOfFamily.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          family.contactNumber.includes(searchQuery.value) ||
          family.address.toLowerCase().includes(searchQuery.value.toLowerCase());
        
        const matchesCenter = !evacuationCenterFilter.value || 
          family.evacuationCenterId === parseInt(evacuationCenterFilter.value);
        
        const matchesStatus = !statusFilter.value || 
          family.status === statusFilter.value;
        
        return matchesSearch && matchesCenter && matchesStatus;
      });
    });
    
    const paginatedFamilies = computed(() => {
      const start = (currentPage.value - 1) * perPage;
      const end = start + perPage;
      return filteredFamilies.value.slice(start, end);
    });
    
    const totalPages = computed(() => {
      return Math.ceil(filteredFamilies.value.length / perPage);
    });
    
    // Methods
    const getInitials = (name) => {
      if (!name) return '?';
      return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };
    
    const getStatusClass = (status) => {
      const classes = {
        'evacuated': 'info',
        'relocated': 'warning',
        'returned': 'success'
      };
      return classes[status] || 'secondary';
    };
    
    const getMemberColor = (relation) => {
      const colors = {
        'spouse': 'primary',
        'child': 'success',
        'parent': 'info',
        'sibling': 'warning',
        'grandparent': 'secondary',
        'grandchild': 'danger',
        'aunt': 'purple',
        'uncle': 'indigo',
        'cousin': 'teal',
        'other': 'dark'
      };
      return colors[relation] || 'secondary';
    };
    
    const filterFamilies = () => {
      currentPage.value = 1; // Reset to first page when filters change
    };
    
    const resetFilters = () => {
      searchQuery.value = '';
      evacuationCenterFilter.value = '';
      statusFilter.value = '';
      currentPage.value = 1;
    };
    
    const selectFamily = (family) => {
      selectedFamily.value = { ...family };
    };
    
    const viewFamilyDetails = (id) => {
      router.push(`/families/${id}`);
    };
    
    const showNewFamilyModal = () => {
      isEditing.value = false;
      familyForm.value = {
        id: null,
        headOfFamily: '',
        contactNumber: '',
        email: '',
        address: '',
        evacuationCenterId: '',
        evacuationDate: '',
        status: 'evacuated',
        notes: '',
        members: []
      };
      
      if (!familyModal) {
        familyModal = new Modal(document.getElementById('familyModal'));
      }
      
      familyModal.show();
    };
    
    const editFamily = (id) => {
      const family = families.value.find(f => f.id === id);
      if (family) {
        isEditing.value = true;
        familyForm.value = { ...family };
        
        if (!familyModal) {
          familyModal = new Modal(document.getElementById('familyModal'));
        }
        
        familyModal.show();
      }
    };
    
    const saveFamily = async () => {
      try {
        saving.value = true;
        
        if (isEditing.value) {
          // Update existing family
          const index = families.value.findIndex(f => f.id === familyForm.value.id);
          if (index !== -1) {
            // In a real app, this would be an API call
            const evacuationCenter = evacuationCenters.value.find(
              ec => ec.id === parseInt(familyForm.value.evacuationCenterId)
            );
            
            families.value[index] = {
              ...familyForm.value,
              evacuationCenter: evacuationCenter ? evacuationCenter.name : ''
            };
            
            // Update selected family if it's the one being edited
            if (selectedFamily.value && selectedFamily.value.id === familyForm.value.id) {
              selectedFamily.value = { ...families.value[index] };
            }
            
            alert('Family updated successfully');
          }
        } else {
          // Add new family
          // In a real app, this would be an API call
          const newId = Math.max(...families.value.map(f => f.id), 0) + 1;
          const evacuationCenter = evacuationCenters.value.find(
            ec => ec.id === parseInt(familyForm.value.evacuationCenterId)
          );
          
          const newFamily = {
            ...familyForm.value,
            id: newId,
            evacuationCenter: evacuationCenter ? evacuationCenter.name : '',
            members: []
          };
          
          families.value.unshift(newFamily);
          selectedFamily.value = { ...newFamily };
          
          alert('Family added successfully');
        }
        
        familyModal.hide();
      } catch (error) {
        console.error('Error saving family:', error);
        alert('Failed to save family. Please try again.');
      } finally {
        saving.value = false;
      }
    };
    
    const confirmDelete = (family) => {
      familyToDelete.value = family;
      
      if (!deleteModal) {
        deleteModal = new Modal(document.getElementById('deleteModal'));
      }
      
      deleteModal.show();
    };
    
    const deleteFamily = async () => {
      if (!familyToDelete.value) return;
      
      try {
        deleting.value = true;
        
        // In a real app, this would be an API call
        const index = families.value.findIndex(f => f.id === familyToDelete.value.id);
        if (index !== -1) {
          families.value.splice(index, 1);
          
          if (selectedFamily.value && selectedFamily.value.id === familyToDelete.value.id) {
            selectedFamily.value = null;
          }
          
          alert('Family deleted successfully');
        }
        
        deleteModal.hide();
      } catch (error) {
        console.error('Error deleting family:', error);
        alert('Failed to delete family. Please try again.');
      } finally {
        deleting.value = false;
        familyToDelete.value = null;
      }
    };
    
    const addFamilyMember = () => {
      editingMember.value = null;
      memberForm.value = {
        id: null,
        name: '',
        relation: '',
        age: '',
        gender: '',
        dateOfBirth: '',
        medicalConditions: '',
        specialNeeds: ''
      };
      
      if (!memberModal) {
        memberModal = new Modal(document.getElementById('memberModal'));
      }
      
      memberModal.show();
    };
    
    const editFamilyMember = (member) => {
      editingMember.value = member;
      memberForm.value = { ...member };
      
      if (!memberModal) {
        memberModal = new Modal(document.getElementById('memberModal'));
      }
      
      memberModal.show();
    };
    
    const saveFamilyMember = async () => {
      if (!selectedFamily.value) return;
      
      try {
        savingMember.value = true;
        
        const familyIndex = families.value.findIndex(f => f.id === selectedFamily.value.id);
        if (familyIndex === -1) return;
        
        if (editingMember.value) {
          // Update existing member
          const memberIndex = families.value[familyIndex].members.findIndex(
            m => m.id === editingMember.value.id
          );
          
          if (memberIndex !== -1) {
            families.value[familyIndex].members[memberIndex] = { ...memberForm.value };
          }
        } else {
          // Add new member
          const newId = families.value[familyIndex].members.length > 0 
            ? Math.max(...families.value[familyIndex].members.map(m => m.id)) + 1 
            : 1;
            
          families.value[familyIndex].members.push({
            ...memberForm.value,
            id: newId
          });
        }
        
        // Update selected family
        selectedFamily.value = { ...families.value[familyIndex] };
        
        memberModal.hide();
        alert('Family member saved successfully');
      } catch (error) {
        console.error('Error saving family member:', error);
        alert('Failed to save family member. Please try again.');
      } finally {
        savingMember.value = false;
      }
    };
    
    const removeFamilyMember = (member, familyId) => {
      if (!confirm(`Are you sure you want to remove ${member.name} from this family?`)) {
        return;
      }
      
      const familyIndex = families.value.findIndex(f => f.id === familyId);
      if (familyIndex === -1) return;
      
      const memberIndex = families.value[familyIndex].members.findIndex(
        m => m.id === member.id
      );
      
      if (memberIndex !== -1) {
        families.value[familyIndex].members.splice(memberIndex, 1);
        
        // Update selected family
        if (selectedFamily.value && selectedFamily.value.id === familyId) {
          selectedFamily.value = { ...families.value[familyIndex] };
        }
        
        alert('Family member removed successfully');
      }
    };
    
    const exportFamilies = () => {
      // In a real app, this would generate a proper export file
      const data = JSON.stringify(families.value, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `families-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };
    
    // Lifecycle hooks
    onMounted(() => {
      // Initialize modals
      familyModal = new Modal(document.getElementById('familyModal'));
      memberModal = new Modal(document.getElementById('memberModal'));
      deleteModal = new Modal(document.getElementById('deleteModal'));
      
      // Select first family by default if none selected
      if (families.value.length > 0 && !selectedFamily.value) {
        selectedFamily.value = { ...families.value[0] };
      }
    });
    
    return {
      // Data
      loading,
      saving,
      savingMember,
      deleting,
      searchQuery,
      evacuationCenterFilter,
      statusFilter,
      currentPage,
      perPage,
      isEditing,
      editingMember,
      selectedFamily,
      familyToDelete,
      families: filteredFamilies,
      paginatedFamilies,
      totalPages,
      evacuationCenters,
      familyForm,
      memberForm,
      
      // Methods
      filterFamilies,
      resetFilters,
      selectFamily,
      viewFamilyDetails,
      showNewFamilyModal,
      editFamily,
      saveFamily,
      confirmDelete,
      deleteFamily,
      addFamilyMember,
      editFamilyMember,
      saveFamilyMember,
      removeFamilyMember,
      exportFamilies,
      getInitials,
      getStatusClass,
      getMemberColor
    };
  }
};
</script>

<style scoped>
.avatar-xs {
  width: 1.5rem;
  height: 1.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin-right: -0.5rem;
  border: 2px solid #fff;
  background-color: #e9ecef;
  font-size: 0.65rem;
  font-weight: 600;
}

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

.avatar-xxl {
  width: 6rem;
  height: 6rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #e9ecef;
  border-radius: 0.5rem;
  font-weight: 600;
  margin: 0 auto;
}

.avatar-group {
  display: flex;
  flex-wrap: wrap;
  padding-left: 0.75rem;
}

.badge {
  font-weight: 500;
  padding: 0.35em 0.65em;
  text-transform: capitalize;
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
  vertical-align: middle;
  padding: 1rem;
}

.table-hover tbody tr:hover {
  background-color: #f8f9fa;
}

.page-item.active .page-link {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.page-link {
  color: #0d6efd;
}

.btn-outline-primary, .btn-outline-secondary, .btn-outline-danger {
  border-width: 1px;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

/* Status colors */
.bg-primary-soft {
  background-color: rgba(13, 110, 253, 0.1);
  color: #0d6efd;
}

.bg-success-soft {
  background-color: rgba(25, 135, 84, 0.1);
  color: #198754;
}

.bg-warning-soft {
  background-color: rgba(255, 193, 7, 0.1);
  color: #ffc107;
}

.bg-danger-soft {
  background-color: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.bg-info-soft {
  background-color: rgba(13, 202, 240, 0.1);
  color: #0dcaf0;
}

.bg-purple {
  background-color: #6f42c1;
}

.bg-indigo {
  background-color: #6610f2;
}

.bg-teal {
  background-color: #20c997;
}

/* Responsive adjustments */
@media (max-width: 992px) {
  .table-responsive {
    font-size: 0.875rem;
  }
  
  .table td, .table th {
    padding: 0.75rem 0.5rem;
  }
}

@media (max-width: 768px) {
  .d-flex.justify-content-between {
    flex-direction: column;
    gap: 1rem;
  }
  
  .card-header {
    padding: 1rem;
  }
  
  .table-responsive {
    border: 0;
  }
  
  .table thead {
    display: none;
  }
  
  .table tr {
    display: block;
    margin-bottom: 1rem;
    border: 1px solid #dee2e6;
    border-radius: 0.25rem;
  }
  
  .table td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 1rem;
    border-bottom: 1px solid #dee2e6;
  }
  
  .table td::before {
    content: attr(data-label);
    font-weight: 600;
    margin-right: 1rem;
    color: #6c757d;
    text-transform: capitalize;
  }
  
  .table td:last-child {
    border-bottom: 0;
  }
  
  .btn-group .btn {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }
}
</style>
