<template>
  <div class="disaster-predictions container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="mb-1">Disaster Predictions</h1>
        <p class="text-muted mb-0">Monitor and analyze potential disaster risks in your area</p>
      </div>
      <div class="d-flex">
        <button class="btn btn-primary me-2" @click="showMap = !showMap">
          <i :class="showMap ? 'fas fa-list' : 'fas fa-map'"></i>
          <span class="ms-2">{{ showMap ? 'List View' : 'Map View' }}</span>
        </button>
        <button class="btn btn-outline-secondary" @click="exportToCSV">
          <i class="fas fa-file-csv"></i>
        </button>
      </div>
    </div>

    <div v-if="showMap" class="card mb-4">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">Risk Assessment Map</h5>
        <div class="btn-group">
          <button v-for="layer in mapLayers" :key="layer.id" class="btn btn-sm" :class="{'btn-primary': activeLayer===layer.id}" @click="activeLayer = layer.id">
            <i :class="`fas fa-${layer.icon} me-1`"></i>{{ layer.label }}
          </button>
        </div>
      </div>
      <div class="card-body p-0" style="height: 400px;">
        <div class="d-flex align-items-center justify-content-center h-100 bg-light">
          <!-- Map placeholder -->
          <div class="text-muted">Map view (placeholder) — active layer: {{ activeLayer }}</div>
        </div>
      </div>
    </div>

    <div class="card" v-else>
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">Predictions</h5>
        <div class="d-flex align-items-center">
          <input v-model="searchQuery" class="form-control form-control-sm me-2" placeholder="Search by location or type" />
          <div class="me-2">
            <select v-model="sortBy" class="form-select form-select-sm">
              <option value="predictedDate">Date</option>
              <option value="riskLevel">Risk</option>
            </select>
          </div>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-hover table-nowrap mb-0">
          <thead>
            <tr>
              <th>Type</th>
              <th>Location</th>
              <th>Risk</th>
              <th>Predicted Date</th>
              <th>Confidence</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in paginatedPredictions" :key="p.id">
              <td><i :class="`fas fa-${getDisasterIcon(p.type)} me-2`"></i>{{ p.type }}</td>
              <td>{{ p.location }}</td>
              <td><span :class="getRiskLevelClass(p.riskLevel)">{{ p.riskLevel }}</span></td>
              <td>{{ formatDate(p.predictedDate) }}</td>
              <td>{{ p.confidence }}%</td>
              <td class="text-end">
                <button class="btn btn-sm btn-outline-primary me-2" @click="viewPredictionDetails(p.id)">View</button>
                <button class="btn btn-sm btn-outline-secondary" @click="exportPrediction(p)">Export</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="d-flex justify-content-between align-items-center p-3 border-top">
        <div class="text-muted">Showing {{ paginatedPredictions.length }} of {{ filteredPredictions.length }}</div>
        <nav>
          <ul class="pagination mb-0">
            <li class="page-item" :class="{ disabled: currentPage===1 }">
              <button class="page-link" @click="changePage(currentPage-1)" :disabled="currentPage===1">Previous</button>
            </li>
            <li class="page-item" v-for="p in totalPages" :key="p" :class="{ active: p===currentPage }">
              <button class="page-link" @click="changePage(p)">{{ p }}</button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage===totalPages }">
              <button class="page-link" @click="changePage(currentPage+1)" :disabled="currentPage===totalPages">Next</button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: 'DisasterPredictionsView',
  setup() {
    const router = useRouter();
    const showMap = ref(false);
    const activeLayer = ref('risk');
    const searchQuery = ref('');
    const currentPage = ref(1);
    const perPage = 10;
    const sortBy = ref('predictedDate');

    const predictions = ref([
      { id: 1, type: 'Flood', location: 'Marikina City', riskLevel: 'High', predictedDate: '2023-12-15', confidence: 85 },
      { id: 2, type: 'Earthquake', location: 'Davao City', riskLevel: 'Medium', predictedDate: '2023-12-20', confidence: 65 },
      { id: 3, type: 'Typhoon', location: 'Metro Manila', riskLevel: 'High', predictedDate: '2023-12-18', confidence: 78 },
      { id: 4, type: 'Landslide', location: 'Cordillera', riskLevel: 'Moderate', predictedDate: '2023-12-22', confidence: 55 }
      
    ]);

    const mapLayers = ref([
      { id: 'risk', label: 'Risk Level', icon: 'exclamation-triangle' },
      { id: 'flood', label: 'Flood', icon: 'water' },
      { id: 'earthquake', label: 'earthquake' },
      { id: 'typhoon', label: 'wind' }
    ]);

    const filteredPredictions = computed(() => {
      let result = predictions.value.slice();
      if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase();
        result = result.filter(p => p.location.toLowerCase().includes(q) || p.type.toLowerCase().includes(q));
      }
      if (sortBy.value === 'predictedDate') {
        result.sort((a,b) => new Date(a.predictedDate) - new Date(b.predictedDate));
      } else if (sortBy.value === 'riskLevel') {
        const order = { 'Low':1, 'Moderate':2, 'Medium':2, 'High':3, 'Critical':4 };
        result.sort((a,b) => (order[b.riskLevel]||0) - (order[a.riskLevel]||0));
      }
      return result;
    });

    const totalPages = computed(() => Math.max(1, Math.ceil(filteredPredictions.value.length / perPage)));

    const paginatedPredictions = computed(() => {
      const start = (currentPage.value - 1) * perPage;
      return filteredPredictions.value.slice(start, start + perPage);
    });

    const refreshPredictions = async () => { /* placeholder for real API */ };

    const viewPredictionDetails = (id) => router.push(`/disaster-predictions/${id}`);

    const exportToCSV = () => { console.log('export CSV'); };

    const exportPrediction = (prediction) => { console.log('export', prediction.id); };

    const changePage = (p) => {
      if (p < 1) p = 1;
      if (p > totalPages.value) p = totalPages.value;
      currentPage.value = p;
    };

    const getDisasterIcon = (type) => {
      const icons = { Flood: 'water', Earthquake: 'mountain', Typhoon: 'wind', Landslide: 'mountain' };
      return icons[type] || 'exclamation-triangle';
    };

    const getRiskLevelClass = (riskLevel) => {
      const classes = { High: 'badge bg-danger-soft text-danger', Medium: 'badge bg-warning-soft text-warning', Moderate: 'badge bg-warning-soft text-warning', Low: 'badge bg-info-soft text-info', Critical: 'badge bg-danger-soft text-danger' };
      return classes[riskLevel] || 'badge bg-secondary';
    };

    const formatDate = (d) => {
      if (!d) return '';
      const options = { year:'numeric', month:'short', day:'numeric' };
      return new Date(d).toLocaleDateString(undefined, options);
    };

    onMounted(() => {
      refreshPredictions();
    });

    return { showMap, activeLayer, searchQuery, currentPage, perPage, sortBy, predictions, mapLayers, filteredPredictions, totalPages, paginatedPredictions, refreshPredictions, viewPredictionDetails, exportToCSV, exportPrediction, changePage, getDisasterIcon, getRiskLevelClass, formatDate };
  }
};
</script>

<style scoped>
.badge {
  display: inline-block;
  padding: .25rem .5rem;
  border-radius: .375rem;
}
.bg-danger-soft { background-color: rgba(239,68,68,0.1); }
.text-danger { color: #ef4444; }
.bg-warning-soft { background-color: rgba(245,158,11,0.1); }
.text-warning { color: #f59e0b; }
.bg-info-soft { background-color: rgba(59,130,246,0.1); }
.text-info { color: #3b82f6; }
</style>