<template>
  <q-page class="trolley-page q-pa-md">
    <div class="trolley-container">
      <!-- HEADER -->
      <div class="page-header">
        <div>
          <div class="text-h5 text-weight-bold"> Smart Trolley </div>

          <div class="text-grey-6"> Control & Monitoring Trolley </div>
        </div>

        <q-badge
          :color="trolleyStatus === 'online' ? 'positive' : 'grey'"
          rounded
          class="q-pa-sm"
        >
          <q-icon name="circle" size="8px" class="q-mr-xs" />

          {{ trolleyStatus.toUpperCase() }}
        </q-badge>
      </div>

      <!-- INFORMATION -->
      <div class="row q-col-gutter-md q-mt-md">
        <!-- BATTERY -->
        <div class="col-12 col-sm-4">
          <q-card class="info-card">
            <q-card-section>
              <div class="text-grey-6"> Battery </div>

              <div class="text-h5 text-weight-bold q-mt-xs">
                {{ battery }}%
              </div>

              <q-linear-progress
                :value="battery / 100"
                size="8px"
                rounded
                color="positive"
                class="q-mt-sm"
              />
            </q-card-section>
          </q-card>
        </div>

        <!-- DISTANCE -->
        <div class="col-12 col-sm-4">
          <q-card class="info-card">
            <q-card-section>
              <div class="text-grey-6"> Distance </div>

              <div class="text-h5 text-weight-bold q-mt-xs">
                {{ distance }} cm
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- LAST COMMAND -->
        <div class="col-12 col-sm-4">
          <q-card class="info-card">
            <q-card-section>
              <div class="text-grey-6"> Last Command </div>

              <div class="text-h5 text-weight-bold q-mt-xs">
                {{ lastCommand }}
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- CONTROL -->
      <q-card class="control-card q-mt-md">
        <q-card-section>
          <div class="text-h6 text-weight-bold text-center">
            Trolley Control
          </div>

          <div class="text-caption text-grey-6 text-center">
            Gunakan tombol untuk mengontrol pergerakan trolley
          </div>

          <div class="control-panel q-mt-lg">
            <!-- FORWARD -->
            <q-btn
              round
              size="lg"
              color="primary"
              icon="keyboard_arrow_up"
              @click="sendCommand('forward')"
            />

            <!-- LEFT / STOP / RIGHT -->
            <div class="control-middle">
              <q-btn
                round
                size="lg"
                color="primary"
                icon="keyboard_arrow_left"
                @click="sendCommand('left')"
              />

              <q-btn
                round
                size="lg"
                color="negative"
                icon="stop"
                @click="sendCommand('stop')"
              />

              <q-btn
                round
                size="lg"
                color="primary"
                icon="keyboard_arrow_right"
                @click="sendCommand('right')"
              />
            </div>

            <!-- BACKWARD -->
            <q-btn
              round
              size="lg"
              color="primary"
              icon="keyboard_arrow_down"
              @click="sendCommand('backward')"
            />
          </div>
        </q-card-section>
      </q-card>

      <!-- COMMAND HISTORY -->
      <q-card class="q-mt-md">
        <q-card-section>
          <div class="text-h6 text-weight-bold"> Command History </div>

          <q-list separator class="q-mt-sm">
            <q-item v-for="command in commandHistory" :key="command.id">
              <q-item-section avatar>
                <q-icon name="directions_car" color="primary" />
              </q-item-section>

              <q-item-section>
                <q-item-label>
                  {{ command.command }}
                </q-item-label>

                <q-item-label caption>
                  {{ formatDate(command.created_at) }}
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item v-if="commandHistory.length === 0">
              <q-item-section class="text-center text-grey">
                Belum ada command
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'

const trolleyId = ref(null)

const trolleyStatus = ref('offline')

const battery = ref(0)

const distance = ref(0)

const lastCommand = ref('STOP')

const commandHistory = ref([])

// ==========================================
// LOAD TROLLEY
// ==========================================

async function loadTrolley() {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError) {
      console.error(userError)
      return
    }

    const user = userData.user

    if (!user) {
      console.log('User belum login')
      return
    }

    const { data, error } = await supabase
      .from('trolleys')
      .select('*')
      .eq('owner_id', user.id)
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('Gagal mengambil trolley:', error)
      return
    }

    if (data) {
      trolleyId.value = data.id

      trolleyStatus.value = data.status

      battery.value = Number(data.battery_percentage || 0)
    }
  } catch (error) {
    console.error(error)
  }
}

// ==========================================
// SEND COMMAND
// ==========================================

async function sendCommand(command) {
  if (!trolleyId.value) {
    alert('Trolley belum tersedia di database.')

    return
  }

  const { error } = await supabase.from('trolley_commands').insert({
    trolley_id: trolleyId.value,
    command: command
  })

  if (error) {
    console.error('Command error:', error)

    alert('Gagal mengirim command.')

    return
  }

  lastCommand.value = command.toUpperCase()

  await loadCommandHistory()
}

// ==========================================
// COMMAND HISTORY
// ==========================================

async function loadCommandHistory() {
  if (!trolleyId.value) return

  const { data, error } = await supabase
    .from('trolley_commands')
    .select('*')
    .eq('trolley_id', trolleyId.value)
    .order('created_at', {
      ascending: false
    })
    .limit(10)

  if (error) {
    console.error(error)

    return
  }

  commandHistory.value = data || []
}

// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(date) {
  if (!date) return '-'

  return new Date(date).toLocaleString('id-ID')
}

// ==========================================
// INITIALIZE
// ==========================================

onMounted(async () => {
  await loadTrolley()

  await loadCommandHistory()
})
</script>

<style scoped>
.trolley-page {
  background: #f5f7fa;
  min-height: 100vh;
}

.trolley-container {
  max-width: 1100px;
  margin: auto;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.info-card {
  border-radius: 16px;
}

.control-card {
  border-radius: 18px;
}

.control-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}

.control-middle {
  display: flex;
  gap: 18px;
  align-items: center;
}
</style>
