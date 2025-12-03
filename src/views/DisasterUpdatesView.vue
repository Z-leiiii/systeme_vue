<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="mb-1">Disaster Updates</h1>
        <p class="text-muted mb-0">Latest information and communications about ongoing disasters</p>
      </div>
      <router-link to="/disaster-updates/new" class="btn btn-primary">
        <i class="fas fa-plus me-2"></i>New Update
      </router-link>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <div class="input-group">
              <span class="input-group-text"><i class="fas fa-search"></i></span>
              <input 
                type="text" 
                class="form-control" 
                placeholder="Search updates..."
                v-model="searchQuery"
              >
            </div>
          </div>
          <div class="col-md-3">
            <select class="form-select" v-model="disasterTypeFilter">
              <option value="">All Disaster Types</option>
              <option v-for="type in disasterTypes" :key="type" :value="type">
                {{ type }}
              </option>
            </select>
          </div>
          <div class="col-md-3">
            <select class="form-select" v-model="statusFilter">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="resolved">Resolved</option>
              <option value="false_alarm">False Alarm</option>
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

    <!-- Updates List -->
    <div class="row">
      <div class="col-lg-8">
        <!-- Active Disasters -->
        <div class="card mb-4">
          <div class="card-header bg-light">
            <h5 class="mb-0">Active Disasters</h5>
          </div>
          <div class="list-group list-group-flush">
            <div 
              v-if="filteredActiveUpdates.length === 0" 
              class="text-center py-4 text-muted"
            >
              No active disaster updates found
            </div>
            <router-link 
              v-for="update in filteredActiveUpdates" 
              :key="update.id"
              :to="'/disaster-updates/' + update.id"
              class="list-group-item list-group-item-action"
            >
              <div class="d-flex align-items-center">
                <div class="flex-shrink-0 me-3">
                  <div 
                    class="icon-shape" 
                    :class="`bg-${getDisasterColor(update.type)}-soft text-${getDisasterColor(update.type)}`"
                  >
                    <i :class="`fas fa-${getDisasterIcon(update.type)}`"></i>
                  </div>
                </div>
                <div class="flex-grow-1">
                  <div class="d-flex justify-content-between align-items-center">
                    <h6 class="mb-1">{{ update.title }}</h6>
                    <small class="text-muted">{{ formatDate(update.updatedAt) }}</small>
                  </div>
                  <p class="mb-1 text-muted">{{ truncate(update.description, 100) }}</p>
                  <div>
                    <span class="badge bg-primary me-1">{{ update.type }}</span>
                    <span class="badge bg-warning me-1">{{ update.severity }}</span>
                    <span class="badge bg-danger">{{ update.affectedAreas.length }} areas affected</span>
                  </div>
                </div>
              </div>
            </router-link>
          </div>
        </div>

        <!-- Recent Updates -->
        <div class="card">
          <div class="card-header bg-light">
            <h5 class="mb-0">Recent Updates</h5>
          </div>
          <div class="list-group list-group-flush">
            <div 
              v-if="filteredRecentUpdates.length === 0" 
              class="text-center py-4 text-muted"
            >
              No recent updates found
            </div>
            <div 
              v-for="update in filteredRecentUpdates" 
              :key="'recent-' + update.id"
              class="list-group-item"
            >
              <div class="d-flex">
                <div class="flex-shrink-0 me-3">
                  <div class="avatar-sm">
                    <span class="avatar-title rounded-circle" :class="`bg-${getDisasterColor(update.type)}-soft text-${getDisasterColor(update.type)}`">
                      <i :class="`fas fa-${getDisasterIcon(update.type)}`"></i>
                    </span>
                  </div>
                </div>
                <div class="flex-grow-1">
                  <div class="d-flex justify-content-between align-items-center">
                    <h6 class="mb-1">{{ update.title }}</h6>
                    <small class="text-muted">{{ formatTimeAgo(update.updatedAt) }}</small>
                  </div>
                  <p class="mb-1">{{ update.description }}</p>
                  <div class="d-flex align-items-center">
                    <span class="badge" :class="`bg-${getStatusClass(update.status)} me-2`">
                      {{ update.status }}
                    </span>
                    <small class="text-muted">
                      <i class="fas fa-user me-1"></i>{{ update.author }}
                    </small>
                    <small class="text-muted ms-2">
                      <i class="fas fa-map-marker-alt me-1"></i>{{ update.location }}
                    </small>
                  </div>
                  
                  <!-- Attachments -->
                  <div v-if="update.attachments && update.attachments.length > 0" class="mt-2">
                    <div class="d-flex flex-wrap gap-2">
                      <a 
                        v-for="(file, index) in update.attachments" 
                        :key="index"
                        :href="file.url" 
                        target="_blank"
                        class="btn btn-sm btn-outline-secondary"
                      >
                        <i :class="getFileIcon(file.type) + ' me-1'"></i>
                        {{ file.name }}
                      </a>
                    </div>
                  </div>
                  
                  <!-- Actions -->
                  <div class="d-flex justify-content-end mt-2">
                    <button 
                      class="btn btn-sm btn-outline-primary me-2"
                      @click.prevent="$router.push('/disaster-updates/' + update.id)"
                    >
                      <i class="fas fa-eye me-1"></i>View Details
                    </button>
                    <button 
                      class="btn btn-sm btn-outline-secondary me-2"
                      @click.prevent="shareUpdate(update)"
                    >
                      <i class="fas fa-share-alt me-1"></i>Share
                    </button>
                    <button 
                      v-if="canEdit(update)"
                      class="btn btn-sm btn-outline-secondary"
                      @click.prevent="editUpdate(update.id)"
                    >
                      <i class="fas fa-edit me-1"></i>Edit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Pagination -->
          <div v-if="totalPages > 1" class="d-flex justify-content-center p-3 border-top">
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
      
      <!-- Sidebar -->
      <div class="col-lg-4">
        <!-- Statistics -->
        <div class="card mb-4">
          <div class="card-header">
            <h5 class="mb-0">Statistics</h5>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <div class="d-flex justify-content-between mb-1">
                <span>Active Disasters</span>
                <span class="fw-bold">{{ stats.activeDisasters }}</span>
              </div>
              <div class="progress" style="height: 6px;">
                <div 
                  class="progress-bar bg-danger" 
                  :style="{ width: (stats.activeDisasters / stats.totalDisasters) * 100 + '%' }"
                ></div>
              </div>
            </div>
            
            <div class="mb-3">
              <div class="d-flex justify-content-between mb-1">
                <span>Affected Areas</span>
                <span class="fw-bold">{{ stats.affectedAreas }}</span>
              </div>
              <div class="progress" style="height: 6px;">
                <div 
                  class="progress-bar bg-warning" 
                  :style="{ width: (stats.affectedAreas / 50) * 100 + '%' }"
                ></div>
              </div>
            </div>
            
            <div class="mb-3">
              <div class="d-flex justify-content-between mb-1">
                <span>Resolved Cases</span>
                <span class="fw-bold">{{ stats.resolvedCases }}</span>
              </div>
              <div class="progress" style="height: 6px;">
                <div 
                  class="progress-bar bg-success" 
                  :style="{ width: (stats.resolvedCases / stats.totalDisasters) * 100 + '%' }"
                ></div>
              </div>
            </div>
            
            <div class="mt-4">
              <h6 class="text-uppercase text-muted mb-3">Disaster Types</h6>
              <div v-for="type in disasterTypeStats" :key="type.name" class="mb-2">
                <div class="d-flex justify-content-between small mb-1">
                  <span>{{ type.name }}</span>
                  <span class="fw-bold">{{ type.count }} ({{ type.percentage }}%)</span>
                </div>
                <div class="progress" style="height: 4px;">
                  <div 
                    class="progress-bar" 
                    :class="`bg-${getDisasterColor(type.name)}`"
                    :style="{ width: type.percentage + '%' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Quick Actions -->
        <div class="card mb-4">
          <div class="card-header">
            <h5 class="mb-0">Quick Actions</h5>
          </div>
          <div class="card-body">
            <div class="d-grid gap-2">
              <button class="btn btn-primary" @click="createNewUpdate">
                <i class="fas fa-plus-circle me-2"></i>Create New Update
              </button>
              <button class="btn btn-outline-primary" @click="exportUpdates">
                <i class="fas fa-file-export me-2"></i>Export Updates
              </button>
              <button class="btn btn-outline-secondary" @click="viewDisasterMap">
                <i class="fas fa-map-marked-alt me-2"></i>View on Map
              </button>
              <button class="btn btn-outline-secondary" @click="subscribeToAlerts">
                <i class="fas fa-bell me-2"></i>Subscribe to Alerts
              </button>
            </div>
          </div>
        </div>
        
        <!-- Recent Comments -->
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Recent Comments</h5>
          </div>
          <div class="list-group list-group-flush">
            <div 
              v-if="recentComments.length === 0" 
              class="text-center py-4 text-muted small"
            >
              No recent comments
            </div>
            <div 
              v-for="comment in recentComments" 
              :key="comment.id"
              class="list-group-item"
            >
              <div class="d-flex">
                <div class="flex-shrink-0 me-3">
                  <div class="avatar-sm">
                    <span class="avatar-title rounded-circle bg-light text-dark">
                      {{ comment.author.charAt(0).toUpperCase() }}
                    </span>
                  </div>
                </div>
                <div class="flex-grow-1">
                  <div class="d-flex justify-content-between align-items-center">
                    <h6 class="mb-0">{{ comment.author }}</h6>
                    <small class="text-muted">{{ formatTimeAgo(comment.timestamp) }}</small>
                  </div>
                  <p class="small mb-1">{{ comment.text }}</p>
                  <a href="#" class="small" @click="viewUpdate(comment.updateId)">
                    View update <i class="fas fa-arrow-right small ms-1"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Share Modal -->
    <div class="modal fade" id="shareModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Share Update</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Share Link</label>
              <div class="input-group">
                <input 
                  type="text" 
                  class="form-control" 
                  :value="shareLink" 
                  readonly
                  ref="shareLinkInput"
                >
                <button 
                  class="btn btn-outline-secondary" 
                  type="button"
                  @click="copyShareLink"
                >
                  <i class="fas fa-copy"></i>
                </button>
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">Share via</label>
              <div class="d-flex gap-2">
                <button class="btn btn-outline-primary flex-grow-1">
                  <i class="fab fa-facebook me-2"></i>Facebook
                </button>
                <button class="btn btn-outline-info flex-grow-1">
                  <i class="fab fa-twitter me-2"></i>Twitter
                </button>
                <button class="btn btn-outline-success flex-grow-1">
                  <i class="fab fa-whatsapp me-2"></i>WhatsApp
                </button>
              </div>
            </div>
            <div class="form-check form-switch mb-3">
              <input 
                class="form-check-input" 
                type="checkbox" 
                id="includeMap"
                v-model="shareOptions.includeMap"
              >
              <label class="form-check-label" for="includeMap">
                Include map location
              </label>
            </div>
            <div class="form-check form-switch mb-3">
              <input 
                class="form-check-input" 
                type="checkbox" 
                id="includeContact"
                v-model="shareOptions.includeContact"
              >
              <label class="form-check-label" for="includeContact">
                Include contact information
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary">
              <i class="fas fa-paper-plane me-2"></i>Send
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
  name: 'DisasterUpdatesView',
  setup() {
    const router = useRouter();
    const loading = ref(false);
    const searchQuery = ref('');
    const disasterTypeFilter = ref('');
    const statusFilter = ref('');
    const currentPage = ref(1);
    const perPage = 10;
    const shareModal = ref(null);
    const shareLink = ref('');
    const selectedUpdate = ref(null);
    const shareOptions = ref({
      includeMap: true,
      includeContact: true
    });

    //replace with API calls
    const disasterTypes = [
      'Flood', 'Earthquake', 'Typhoon', 'Landslide', 'Fire', 
      'Tsunami', 'Volcanic Eruption', 'Drought', 'Other'
    ];

    const updates = ref([
      {
        id: 1,
        title: 'Major Flood Alert: Barangay 123',
        description: 'Heavy rainfall has caused severe flooding in low-lying areas. Residents are advised to evacuate to designated centers.',
        type: 'Flood',
        severity: 'High',
        status: 'active',
        location: 'Barangay 123',
        author: 'Admin User',
        createdAt: '2023-06-10T08:30:00',
        updatedAt: '2023-06-10T10:15:00',
        affectedAreas: ['Zone 1', 'Zone 2', 'Riverside'],
        attachments: [
          { name: 'flood-map.jpg', type: 'image', url: '#' },
          { name: 'evacuation-plan.pdf', type: 'pdf', url: '#' }
        ],
        comments: [
          { id: 1, author: 'John Doe', text: 'Water level is rising quickly', timestamp: '2023-06-10T09:15:00' },
          { id: 2, author: 'Jane Smith', text: 'Evacuation center is at capacity', timestamp: '2023-06-10T10:00:00' }
        ]
      },
     
    ]);

    const stats = ref({
      activeDisasters: 5,
      totalDisasters: 12,
      affectedAreas: 8,
      resolvedCases: 7,
      totalUpdates: 24
    });

    const disasterTypeStats = computed(() => {
      const counts = {};
      updates.value.forEach(update => {
        counts[update.type] = (counts[update.type] || 0) + 1;
      });
      
      return Object.entries(counts).map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / updates.value.length) * 100)
      }));
    });

    const recentComments = computed(() => {
      const allComments = [];
      updates.value.forEach(update => {
        update.comments?.forEach(comment => {
          allComments.push({
            ...comment,
            updateId: update.id,
            updateTitle: update.title
          });
        });
      });
      
      return allComments
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5);
    });

    const filteredActiveUpdates = computed(() => {
      return updates.value
        .filter(update => update.status === 'active')
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    });

    const filteredRecentUpdates = computed(() => {
      let result = [...updates.value];
      
      // Apply filters
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(update => 
          update.title.toLowerCase().includes(query) ||
          update.description.toLowerCase().includes(query) ||
          update.location.toLowerCase().includes(query)
        );
      }
      
      if (disasterTypeFilter.value) {
        result = result.filter(update => update.type === disasterTypeFilter.value);
      }
      
      if (statusFilter.value) {
        result = result.filter(update => update.status === statusFilter.value);
      }
      
      // Sort by most recent first
      return result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    });

    const paginatedUpdates = computed(() => {
      const start = (currentPage.value - 1) * perPage;
      const end = start + perPage;
      return filteredRecentUpdates.value.slice(start, end);
    });

    const totalPages = computed(() => {
      return Math.ceil(filteredRecentUpdates.value.length / perPage);
    });

    const getDisasterIcon = (type) => {
      const icons = {
        'flood': 'water',
        'earthquake': 'mountain',
        'typhoon': 'wind',
        'landslide': 'mountain',
        'fire': 'fire',
        'tsunami': 'water',
        'volcanic eruption': 'mountain',
        'drought': 'sun'
      };
      return icons[type.toLowerCase()] || 'exclamation-triangle';
    };

    const getDisasterColor = (type) => {
      const colors = {
        'flood': 'info',
        'earthquake': 'warning',
        'typhoon': 'primary',
        'landslide': 'secondary',
        'fire': 'danger',
        'tsunami': 'info',
        'volcanic eruption': 'danger',
        'drought': 'warning'
      };
      return colors[type.toLowerCase()] || 'dark';
    };

    const getStatusClass = (status) => {
      const classes = {
        'active': 'danger',
        'resolved': 'success',
        'monitoring': 'info',
        'false_alarm': 'secondary'
      };
      return classes[status] || 'secondary';
    };

    const getFileIcon = (fileType) => {
      const icons = {
        'pdf': 'fa-file-pdf',
        'image': 'fa-image',
        'document': 'fa-file-word',
        'spreadsheet': 'fa-file-excel',
        'presentation': 'fa-file-powerpoint',
        'video': 'fa-file-video'
      };
      
      const type = fileType?.split('/')[0] || '';
      return icons[type] || 'fa-file';
    };

    const formatDate = (dateString) => {
      const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(dateString).toLocaleDateString('en-US', options);
    };

    const formatTimeAgo = (dateString) => {
      const now = new Date();
      const date = new Date(dateString);
      const diffInSeconds = Math.floor((now - date) / 1000);
      
      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
      
      return formatDate(dateString);
    };

    const truncate = (text, length) => {
      if (text.length <= length) return text;
      return text.substring(0, length) + '...';
    };

    const resetFilters = () => {
      searchQuery.value = '';
      disasterTypeFilter.value = '';
      statusFilter.value = '';
      currentPage.value = 1;
    };

    const shareUpdate = (update) => {
      selectedUpdate.value = update;
      shareLink.value = `${window.location.origin}/disaster-updates/${update.id}`;
      
      if (!shareModal.value) {
        shareModal.value = new Modal(document.getElementById('shareModal'));
      }
      
      shareModal.value.show();
    };

    const copyShareLink = () => {
      const input = document.createElement('input');
      input.value = shareLink.value;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      
      // Show copied feedback
      const copyBtn = document.querySelector('#shareModal .btn-outline-secondary');
      const originalHtml = copyBtn.innerHTML;
      copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
      setTimeout(() => {
        copyBtn.innerHTML = originalHtml;
      }, 2000);
    };

    const createNewUpdate = () => {
      router.push('/disaster-updates/new');
    };

    const editUpdate = (id) => {
      router.push(`/disaster-updates/${id}/edit`);
    };

    const viewUpdate = (id) => {
      router.push(`/disaster-updates/${id}`);
    };

    const exportUpdates = () => {
      // Implement export functionality
      const data = JSON.stringify(updates.value, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `disaster-updates-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    const viewDisasterMap = () => {
      // Implement map view
      alert('Opening disaster map...');
    };

    const subscribeToAlerts = () => {
      // Implement subscription functionality
      alert('Subscription dialog will appear here');
    };

    const canEdit = () => {
      // Implement permission check
      return true; // For demo purposes
    };

    onMounted(() => {
      // Fetch initial data
      // fetchUpdates();
    });

    return {
      // Data
      loading,
      searchQuery,
      disasterTypeFilter,
      statusFilter,
      currentPage,
      perPage,
      disasterTypes,
      stats,
      disasterTypeStats,
      recentComments,
      filteredActiveUpdates,
      filteredRecentUpdates,
      paginatedUpdates,
      totalPages,
      shareLink,
      shareOptions,
      
      // Methods
      resetFilters,
      shareUpdate,
      copyShareLink,
      createNewUpdate,
      editUpdate,
      viewUpdate,
      exportUpdates,
      viewDisasterMap,
      subscribeToAlerts,
      canEdit,
      getDisasterIcon,
      getDisasterColor,
      getStatusClass,
      getFileIcon,
      formatDate,
      formatTimeAgo,
      truncate
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
  border-radius: 0.5rem;
}

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

.list-group-item-action {
  transition: background-color 0.2s ease;
}

.list-group-item-action:hover {
  background-color: #f8f9fa;
}

.badge {
  font-weight: 500;
  padding: 0.35em 0.65em;
  text-transform: capitalize;
}

.progress {
  border-radius: 10px;
  overflow: hidden;
  background-color: #e9ecef;
}

.progress-bar {
  transition: width 0.6s ease;
}

/* Responsive adjustments */
@media (max-width: 992px) {
  .card {
    margin-bottom: 1.5rem;
  }
}

@media (max-width: 768px) {
  .d-flex.justify-content-between {
    flex-direction: column;
    gap: 1rem;
  }
  
  .btn-group {
    width: 100%;
    flex-wrap: wrap;
  }
  
  .btn-group .btn {
    flex: 1 0 auto;
    margin-bottom: 0.5rem;
  }
  
  .list-group-item {
    padding: 1rem 0.75rem;
  }
  
  .avatar-sm {
    width: 2rem;
    height: 2rem;
    font-size: 0.75rem;
  }
}
</style>
