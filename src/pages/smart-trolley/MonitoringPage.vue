<template>
  <div class="monitoring-page">
    <!-- HEADER -->
    <div class="page-header">
      <div>
        <h1>Monitoring Trolley</h1>
        <p>Monitoring sensor Smart Trolley secara realtime</p>
      </div>

      <div class="status" :class="connected ? 'online' : 'offline'">
        ● {{ connected ? 'REALTIME CONNECTED' : 'DISCONNECTED' }}
      </div>
    </div>

    <!-- SENSOR CARDS -->
    <div class="sensor-grid">
      <!-- BATTERY -->
      <div class="sensor-card">
        <div class="sensor-label"> 🔋 Battery Voltage </div>

        <div class="sensor-value">
          {{ latestSensor?.battery_voltage ?? 0 }} V
        </div>

        <div class="sensor-info"> Tegangan baterai trolley </div>
      </div>

      <!-- DISTANCE -->
      <div class="sensor-card">
        <div class="sensor-label"> 📏 Distance </div>

        <div class="sensor-value">
          {{ latestSensor?.distance_cm ?? 0 }} cm
        </div>

        <div class="sensor-info"> Jarak sensor </div>
      </div>

      <!-- TEMPERATURE -->
      <div class="sensor-card">
        <div class="sensor-label"> 🌡 Temperature </div>

        <div class="sensor-value">
          {{ latestSensor?.temperature ?? 0 }} °C
        </div>

        <div class="sensor-info"> Suhu perangkat </div>
      </div>
    </div>

    <!-- TROLLEY INFO -->
    <div class="info-card">
      <div class="section-title">
        <strong>Smart Trolley</strong>

        <span>
          {{ trolley?.device_code || '-' }}
        </span>
      </div>

      <div class="info-grid">
        <div>
          <span>Device</span>
          <strong>
            {{ trolley?.name || 'Loading...' }}
          </strong>
        </div>

        <div>
          <span>Last Update</span>
          <strong>
            {{ formatDate(latestSensor?.created_at) }}
          </strong>
        </div>
      </div>
    </div>

    <!-- SENSOR HISTORY -->
    <div class="history-card">
      <div class="history-header">
        <div>
          <h2>Sensor History</h2>
          <p>Data sensor terbaru dari Smart Trolley</p>
        </div>

        <button @click="loadSensorLogs"> Refresh </button>
      </div>

      <div v-if="logs.length === 0" class="empty"> Belum ada data sensor. </div>

      <div v-else class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Waktu</th>
              <th>Distance</th>
              <th>Temperature</th>
              <th>Battery</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="log in logs" :key="log.id">
              <td>
                {{ formatDate(log.created_at) }}
              </td>

              <td> {{ log.distance_cm }} cm </td>

              <td> {{ log.temperature }} °C </td>

              <td> {{ log.battery_voltage }} V </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

import { supabase } from '@/lib/supabaseClient'

const trolley = ref(null)

const logs = ref([])

const latestSensor = ref(null)

const connected = ref(false)

let channel = null

// ========================================
// FORMAT DATE
// ========================================

function formatDate(date) {
  if (!date) {
    return '-'
  }

  return new Date(date).toLocaleString('id-ID')
}

// ========================================
// LOAD TROLLEY
// ========================================

async function loadTrolley() {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error('User belum login')

    return
  }

  const { data, error } = await supabase

    .from('trolleys')

    .select('*')

    .eq('owner_id', user.id)

    .limit(1)

    .maybeSingle()

  if (error) {
    console.error('Load trolley error:', error)

    return
  }

  if (!data) {
    console.error('Trolley tidak ditemukan')

    return
  }

  trolley.value = data
}

// ========================================
// LOAD SENSOR LOGS
// ========================================

async function loadSensorLogs() {
  if (!trolley.value) {
    return
  }

  const { data, error } = await supabase

    .from('sensor_logs')

    .select('*')

    .eq('trolley_id', trolley.value.id)

    .order('created_at', {
      ascending: false
    })

    .limit(50)

  if (error) {
    console.error('Sensor logs error:', error)

    return
  }

  logs.value = data || []

  latestSensor.value = logs.value[0] || null
}

// ========================================
// REALTIME SENSOR
// ========================================

function subscribeSensorLogs() {
  if (!trolley.value) {
    return
  }

  channel = supabase

    .channel(`monitoring-${trolley.value.id}`)

    .on(
      'postgres_changes',

      {
        event: 'INSERT',
        schema: 'public',
        table: 'sensor_logs',

        filter: `trolley_id=eq.${trolley.value.id}`
      },

      payload => {
        const newSensor = payload.new

        // Update sensor terbaru
        latestSensor.value = newSensor

        // Masukkan ke history
        logs.value.unshift(newSensor)

        // Maksimal 50 data
        if (logs.value.length > 50) {
          logs.value.pop()
        }
      }
    )

    .subscribe(status => {
      console.log('Monitoring realtime:', status)

      if (status === 'SUBSCRIBED') {
        connected.value = true
      }

      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        connected.value = false
      }
    })
}

// ========================================
// INITIALIZE
// ========================================

async function initialize() {
  await loadTrolley()

  if (!trolley.value) {
    return
  }

  await loadSensorLogs()

  subscribeSensorLogs()
}

// ========================================
// MOUNT
// ========================================

onMounted(() => {
  initialize()
})

// ========================================
// UNMOUNT
// ========================================

onUnmounted(() => {
  if (channel) {
    supabase.removeChannel(channel)
  }
})
</script>

<style scoped>
.monitoring-page {
  min-height: 100vh;

  padding: 30px;

  background: #f4f6f9;
}

/* HEADER */

.page-header {
  max-width: 1100px;

  margin: 0 auto 25px;

  display: flex;

  justify-content: space-between;

  align-items: center;
}

.page-header h1 {
  margin: 0;

  font-size: 28px;

  color: #0f172a;
}

.page-header p {
  margin-top: 5px;

  color: #64748b;
}

/* STATUS */

.status {
  padding: 8px 15px;

  border-radius: 20px;

  font-size: 12px;

  font-weight: bold;
}

.online {
  background: #dcfce7;

  color: #16a34a;
}

.offline {
  background: #fee2e2;

  color: #dc2626;
}

/* SENSOR */

.sensor-grid {
  max-width: 1100px;

  margin: auto;

  display: grid;

  grid-template-columns: repeat(3, 1fr);

  gap: 18px;
}

.sensor-card {
  background: white;

  border-radius: 14px;

  padding: 22px;

  border: 1px solid #e2e8f0;

  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.sensor-label {
  color: #64748b;

  font-size: 13px;

  margin-bottom: 10px;
}

.sensor-value {
  font-size: 27px;

  font-weight: bold;

  color: #0f172a;
}

.sensor-info {
  margin-top: 5px;

  color: #94a3b8;

  font-size: 12px;
}

/* INFO */

.info-card {
  max-width: 1100px;

  margin: 20px auto;

  padding: 20px;

  background: white;

  border-radius: 14px;

  border: 1px solid #e2e8f0;
}

.section-title {
  display: flex;

  justify-content: space-between;

  margin-bottom: 20px;
}

.section-title strong {
  font-size: 18px;
}

.section-title span {
  color: #64748b;
}

.info-grid {
  display: grid;

  grid-template-columns: repeat(2, 1fr);

  gap: 20px;
}

.info-grid span {
  display: block;

  color: #64748b;

  font-size: 12px;

  margin-bottom: 5px;
}

/* HISTORY */

.history-card {
  max-width: 1100px;

  margin: 20px auto;

  background: white;

  border-radius: 14px;

  border: 1px solid #e2e8f0;

  overflow: hidden;
}

.history-header {
  padding: 20px;

  display: flex;

  justify-content: space-between;

  align-items: center;
}

.history-header h2 {
  margin: 0;

  font-size: 18px;
}

.history-header p {
  margin: 5px 0 0;

  color: #64748b;

  font-size: 12px;
}

.history-header button {
  border: none;

  background: #2563eb;

  color: white;

  padding: 8px 15px;

  border-radius: 7px;

  cursor: pointer;
}

/* TABLE */

.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;

  border-collapse: collapse;
}

th {
  text-align: left;

  background: #f8fafc;

  color: #64748b;

  font-size: 12px;

  padding: 14px 20px;
}

td {
  padding: 14px 20px;

  border-top: 1px solid #e2e8f0;

  font-size: 13px;
}

.empty {
  padding: 40px;

  text-align: center;

  color: #94a3b8;
}

/* MOBILE */

@media (max-width: 700px) {
  .sensor-grid {
    grid-template-columns: 1fr;
  }

  .page-header {
    align-items: flex-start;

    flex-direction: column;

    gap: 15px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
