<template>
  <div class="real-time-data">
    <div class="card">
      <div class="card-header">
        Real-Time Data
      </div>
      <div class="card-body">
        <p>Real-time data monitoring will be displayed here.</p>
        
        <!-- Placeholder for real-time data content -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <div class="data-card">
            <h3 class="data-card__title">Active Disasters</h3>
            <div class="data-card__value">5</div>
            <div class="data-card__trend up">+2 from yesterday</div>
          </div>
          
          <div class="data-card">
            <h3 class="data-card__title">Active Evacuees</h3>
            <div class="data-card__value">342</div>
            <div class="data-card__trend down">-15 from yesterday</div>
          </div>
          
          <div class="data-card">
            <h3 class="data-card__title">Available Shelters</h3>
            <div class="data-card__value">12</div>
            <div class="data-card__trend up">+3 from yesterday</div>
          </div>
        </div>
        
        <!-- Map Section -->
        <div class="mt-8">
          <h3 class="text-xl font-semibold mb-4">Evacuation Map</h3>
          <div class="map-container bg-gray-100 rounded-lg h-96 flex items-center justify-center">
            <p class="text-gray-500">Map(to be placed here)</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RealTimeDataView',
  data() {
    return {
      // Real-time data will be stored here
      activeDisasters: 0,
      activeEvacuees: 0,
      availableShelters: 0
    };
  },
  async created() {
    // Fetch real-time data when component is created
    await this.fetchRealTimeData();
  },
  methods: {
    async fetchRealTimeData() {
      try {
        // TODO: Replace with actual API calls
        // const response = await this.axios.get('/real-time-data');
        // this.activeDisasters = response.data.activeDisasters;
        // this.activeEvacuees = response.data.activeEvacuees;
        // this.availableShelters = response.data.availableShelters;
        
        // For now, use mock data
        this.activeDisasters = 5;
        this.activeEvacuees = 342;
        this.availableShelters = 12;
      } catch (error) {
        console.error('Error fetching real-time data:', error);
        this.$store.dispatch('flash/showFlash', {
          message: 'Failed to load real-time data. Please try again later.',
          type: 'error'
        });
      }
    }
  }
};
</script>

<style scoped>
.data-card {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.data-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.data-card__title {
  font-size: 0.95rem;
  color: #6b7280;
  margin: 0 0 0.5rem 0;
  font-weight: 500;
}

.data-card__value {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0.5rem 0;
}

.data-card__trend {
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.data-card__trend.up {
  color: #10b981;
}

.data-card__trend.down {
  color: #ef4444;
}

.map-container {
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
</style>
