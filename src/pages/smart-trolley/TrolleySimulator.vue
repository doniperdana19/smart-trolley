<template>
  <div class="simulator-page">
    <!-- HEADER -->
    <div class="header">
      <div>
        <h1>ESP32 Simulator</h1>
        <p>Simulasi perangkat ESP32 Smart Trolley</p>
      </div>

      <div class="status" :class="connected ? 'online' : 'offline'">
        ● {{ connected ? 'CONNECTED' : 'CONNECTING...' }}
      </div>
    </div>

    <!-- DEVICE INFO -->
    <div class="info-grid">
      <div class="info-card">
        <span>Device</span>
        <strong>{{ trolley?.name || 'Loading...' }}</strong>
      </div>

      <div class="info-card">
        <span>Device Code</span>
        <strong>{{ trolley?.device_code || '-' }}</strong>
      </div>

      <div class="info-card">
        <span>Last Command</span>
        <strong>{{ lastCommand.toUpperCase() }}</strong>
      </div>
    </div>

    <!-- SENSOR MONITOR -->
    <div class="sensor-grid">
      <div class="sensor-card">
        <span>🔋 Battery</span>
        <strong>{{ battery.toFixed(0) }}%</strong>

        <div class="progress">
          <div class="progress-bar" :style="{ width: battery + '%' }"></div>
        </div>
      </div>

      <div class="sensor-card">
        <span>📏 Distance</span>
        <strong>{{ distance.toFixed(0) }} cm</strong>
      </div>

      <div class="sensor-card">
        <span>⚡ Speed</span>
        <strong>{{ speed }}%</strong>
      </div>

      <div class="sensor-card">
        <span>🌡 Temperature</span>
        <strong>{{ temperature.toFixed(1) }} °C</strong>
      </div>
    </div>

    <!-- MOTOR -->
    <div class="motor-card">
      <div class="section-title">
        <h2>Motor Status</h2>
        <span>{{ lastCommand.toUpperCase() }}</span>
      </div>

      <div class="motor-grid">
        <div class="motor">
          <span>Motor Left</span>
          <strong>{{ motorLeft }}%</strong>

          <div class="motor-progress">
            <div :style="{ width: motorLeft + '%' }"></div>
          </div>
        </div>

        <div class="motor">
          <span>Motor Right</span>
          <strong>{{ motorRight }}%</strong>

          <div class="motor-progress">
            <div :style="{ width: motorRight + '%' }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- SERIAL MONITOR -->
    <div class="terminal">
      <div class="terminal-header">
        <span>ESP32 SERIAL MONITOR</span>

        <button @click="clearLogs"> Clear </button>
      </div>

      <div class="terminal-body">
        <div v-for="(log, index) in logs" :key="index" class="log">
          {{ log }}
        </div>

        <div v-if="logs.length === 0" class="empty">
          Waiting for command...
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

import { supabase } from '@/lib/supabaseClient'

/* =====================================================
   DEVICE
===================================================== */

const trolley = ref(null)

const connected = ref(false)

const lastCommand = ref('stop')

/* =====================================================
   SENSOR SIMULATION
===================================================== */

const battery = ref(100)

const distance = ref(0)

const speed = ref(0)

const temperature = ref(28)

/* =====================================================
   MOTOR
===================================================== */

const motorLeft = ref(0)

const motorRight = ref(0)

/* =====================================================
   LOG
===================================================== */

const logs = ref([])

let channel = null

let simulationTimer = null

let sensorLogTimer = null

/* =====================================================
   ADD LOG
===================================================== */

function addLog(message) {
  const time = new Date().toLocaleTimeString()

  logs.value.unshift(`[${time}] ${message}`)

  if (logs.value.length > 50) {
    logs.value.pop()
  }
}

function getBatteryVoltage() {
  const minVoltage = 10.5
  const maxVoltage = 12.6

  return minVoltage + (battery.value / 100) * (maxVoltage - minVoltage)
}

async function saveSensorLog() {
  if (!trolley.value) {
    return
  }

  const { error } = await supabase.from('sensor_logs').insert({
    trolley_id: trolley.value.id,
    distance_cm: Number(distance.value.toFixed(2)),
    temperature: Number(temperature.value.toFixed(2)),
    battery_voltage: Number(getBatteryVoltage().toFixed(2))
  })

  if (error) {
    addLog(`SENSOR ERROR: ${error.message}`)

    return
  }

  addLog(
    `📡 SENSOR → ${distance.value.toFixed(0)}cm | ${temperature.value.toFixed(1)}°C | ${getBatteryVoltage().toFixed(2)}V`
  )
}
/* =====================================================
   LOAD TROLLEY
===================================================== */

async function loadTrolley() {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError || !user) {
    addLog('ERROR: User belum login')

    return
  }

  const { data, error } = await supabase

    .from('trolleys')

    .select('*')

    .eq('owner_id', user.id)

    .limit(1)

    .maybeSingle()

  if (error) {
    addLog(`ERROR: ${error.message}`)

    return
  }

  if (!data) {
    addLog('ERROR: Trolley tidak ditemukan')

    return
  }

  trolley.value = data

  /*
   * Ambil battery dari database
   * jika tersedia
   */

  if (
    data.battery_percentage !== null &&
    data.battery_percentage !== undefined
  ) {
    battery.value = Number(data.battery_percentage)
  }

  addLog(`Device ditemukan: ${data.device_code}`)

  subscribeToCommands(data.id)
}

/* =====================================================
   REALTIME COMMAND
===================================================== */

function subscribeToCommands(trolleyId) {
  channel = supabase

    .channel(`esp32-simulator-${trolleyId}`)

    .on(
      'postgres_changes',

      {
        event: 'INSERT',
        schema: 'public',
        table: 'trolley_commands',
        filter: `trolley_id=eq.${trolleyId}`
      },

      payload => {
        const command = payload.new.command

        lastCommand.value = command

        addLog(`COMMAND RECEIVED → ${command.toUpperCase()}`)

        simulateMotor(command)
      }
    )

    .subscribe(status => {
      console.log('Realtime status:', status)

      if (status === 'SUBSCRIBED') {
        connected.value = true

        addLog('Realtime connected')

        addLog('ESP32 simulator siap menerima command')
      }

      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        connected.value = false

        addLog(`Realtime error: ${status}`)
      }
    })
}

/* =====================================================
   MOTOR SIMULATION
===================================================== */

function simulateMotor(command) {
  /*
   * RESET MOTOR
   */

  motorLeft.value = 0

  motorRight.value = 0

  speed.value = 0

  switch (command) {
    /* FORWARD */

    case 'forward':
      motorLeft.value = 80

      motorRight.value = 80

      speed.value = 80

      addLog('⚙️ MOTOR → FORWARD')

      break

    /* BACKWARD */

    case 'backward':
      motorLeft.value = 70

      motorRight.value = 70

      speed.value = 70

      addLog('⚙️ MOTOR → BACKWARD')

      break

    /* LEFT */

    case 'left':
      motorLeft.value = 30

      motorRight.value = 80

      speed.value = 60

      addLog('⚙️ MOTOR → LEFT')

      break

    /* RIGHT */

    case 'right':
      motorLeft.value = 80

      motorRight.value = 30

      speed.value = 60

      addLog('⚙️ MOTOR → RIGHT')

      break

    /* STOP */

    case 'stop':
      motorLeft.value = 0

      motorRight.value = 0

      speed.value = 0

      addLog('🛑 MOTOR → STOP')

      break

    default:
      addLog(`UNKNOWN COMMAND → ${command}`)
  }
}

/* =====================================================
   SENSOR SIMULATION LOOP
===================================================== */

function startSimulation() {
  simulationTimer = setInterval(() => {
    /*
     * Kalau trolley sedang bergerak
     */

    if (lastCommand.value !== 'stop') {
      /*
       * FORWARD
       *
       * Distance bertambah
       */

      if (lastCommand.value === 'forward') {
        distance.value += 5
      }

      /*
       * BACKWARD
       *
       * Distance berkurang
       */

      if (lastCommand.value === 'backward') {
        distance.value = Math.max(0, distance.value - 5)
      }

      /*
       * Battery berkurang
       */

      battery.value = Math.max(0, battery.value - 0.1)

      /*
       * Temperature naik sedikit
       */

      temperature.value = Math.min(40, temperature.value + 0.02)
    }

    /*
     * Kalau STOP
     *
     * temperature turun perlahan
     */

    else {
      temperature.value = Math.max(28, temperature.value - 0.02)
    }
  }, 1000)
}
function startSensorLogging() {
  sensorLogTimer = setInterval(() => {
    saveSensorLog()
  }, 5000)
}

/* =====================================================
   CLEAR LOG
===================================================== */

function clearLogs() {
  logs.value = []
}

/* =====================================================
   LIFECYCLE
===================================================== */

onMounted(() => {
  loadTrolley()

  startSimulation()

  startSensorLogging()
})

onUnmounted(() => {
  if (channel) {
    supabase.removeChannel(channel)
  }

  if (simulationTimer) {
    clearInterval(simulationTimer)
  }
})
</script>

<style scoped>
.simulator-page {
  min-height: 100vh;

  padding: 30px;

  background: #071226;

  color: white;
}

/* HEADER */

.header {
  max-width: 1100px;

  margin: 0 auto 25px;

  display: flex;

  align-items: center;

  justify-content: space-between;
}

.header h1 {
  margin: 0;

  font-size: 28px;
}

.header p {
  margin-top: 5px;

  color: #94a3b8;
}

.status {
  padding: 10px 18px;

  border-radius: 20px;

  font-size: 13px;

  font-weight: bold;
}

.online {
  background: #123d2a;

  color: #4ade80;
}

.offline {
  background: #3f2020;

  color: #f87171;
}

/* DEVICE INFO */

.info-grid {
  max-width: 1100px;

  margin: auto;

  display: grid;

  grid-template-columns: repeat(3, 1fr);

  gap: 18px;
}

.info-card {
  background: #101d34;

  border: 1px solid #1e3150;

  border-radius: 14px;

  padding: 20px;
}

.info-card span {
  display: block;

  color: #94a3b8;

  font-size: 13px;

  margin-bottom: 8px;
}

.info-card strong {
  font-size: 20px;
}

/* SENSOR */

.sensor-grid {
  max-width: 1100px;

  margin: 18px auto 0;

  display: grid;

  grid-template-columns: repeat(4, 1fr);

  gap: 18px;
}

.sensor-card {
  background: #101d34;

  border: 1px solid #1e3150;

  border-radius: 14px;

  padding: 18px;
}

.sensor-card span {
  display: block;

  color: #94a3b8;

  font-size: 13px;

  margin-bottom: 8px;
}

.sensor-card strong {
  font-size: 22px;
}

.progress {
  height: 6px;

  margin-top: 12px;

  background: #1e293b;

  border-radius: 10px;

  overflow: hidden;
}

.progress-bar {
  height: 100%;

  background: #22c55e;

  transition: width 0.5s;
}

/* MOTOR */

.motor-card {
  max-width: 1100px;

  margin: 18px auto 0;

  padding: 20px;

  background: #101d34;

  border: 1px solid #1e3150;

  border-radius: 14px;
}

.section-title {
  display: flex;

  align-items: center;

  justify-content: space-between;

  margin-bottom: 20px;
}

.section-title h2 {
  margin: 0;

  font-size: 18px;
}

.section-title span {
  color: #60a5fa;

  font-weight: bold;
}

.motor-grid {
  display: grid;

  grid-template-columns: repeat(2, 1fr);

  gap: 20px;
}

.motor span {
  display: block;

  color: #94a3b8;

  margin-bottom: 8px;
}

.motor strong {
  font-size: 20px;
}

.motor-progress {
  height: 8px;

  background: #1e293b;

  border-radius: 10px;

  overflow: hidden;

  margin-top: 10px;
}

.motor-progress div {
  height: 100%;

  background: #3b82f6;

  transition: width 0.5s;
}

/* TERMINAL */

.terminal {
  max-width: 1100px;

  margin: 25px auto 0;

  background: #020617;

  border: 1px solid #1e3150;

  border-radius: 14px;

  overflow: hidden;
}

.terminal-header {
  padding: 15px 20px;

  background: #0f172a;

  display: flex;

  justify-content: space-between;

  align-items: center;

  font-size: 13px;

  font-weight: bold;
}

.terminal-header button {
  border: 0;

  padding: 6px 12px;

  border-radius: 6px;

  cursor: pointer;
}

.terminal-body {
  min-height: 300px;

  max-height: 400px;

  overflow-y: auto;

  padding: 20px;

  font-family: monospace;

  color: #4ade80;
}

.log {
  margin-bottom: 10px;
}

.empty {
  color: #64748b;
}

/* MOBILE */

@media (max-width: 800px) {
  .info-grid,
  .sensor-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .info-grid,
  .sensor-grid,
  .motor-grid {
    grid-template-columns: 1fr;
  }

  .header {
    align-items: flex-start;

    gap: 15px;

    flex-direction: column;
  }
}
</style>
