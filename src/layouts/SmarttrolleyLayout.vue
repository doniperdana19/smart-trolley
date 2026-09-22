<template>
  <q-layout view="hHh Lpr lFf">
    <!-- ========================= -->
    <!-- SIDEBAR -->
    <!-- ========================= -->

    <q-drawer
      v-model="drawerOpen"
      show-if-above
      bordered
      :width="250"
      class="trolley-drawer"
    >
      <!-- Logo / Header -->
      <div class="drawer-header">
        <div class="logo-icon"> 🚚 </div>

        <div>
          <div class="logo-title"> SMART TROLLEY </div>

          <div class="logo-subtitle"> Smart Transportation </div>
        </div>
      </div>

      <!-- Menu -->
      <q-list padding class="menu-list">
        <q-item
          clickable
          v-ripple
          to="/trolley"
          exact
          active-class="menu-active"
        >
          <q-item-section avatar>
            <q-icon name="dashboard" />
          </q-item-section>

          <q-item-section> Dashboard </q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          to="/trolley/controller"
          active-class="menu-active"
        >
          <q-item-section avatar>
            <q-icon name="gamepad" />
          </q-item-section>

          <q-item-section> Controller </q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          to="/trolley/monitoring"
          active-class="menu-active"
        >
          <q-item-section avatar>
            <q-icon name="monitor_heart" />
          </q-item-section>

          <q-item-section> Monitoring </q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          to="/trolley/history"
          active-class="menu-active"
        >
          <q-item-section avatar>
            <q-icon name="history" />
          </q-item-section>

          <q-item-section> History </q-item-section>
        </q-item>
      </q-list>

      <!-- Bottom -->
      <div class="drawer-bottom">
        <q-separator />

        <div class="connection-status">
          <div
            class="status-dot"
            :class="isOnline ? 'online' : 'offline'"
          ></div>

          <div>
            <div class="status-title"> Trolley Status </div>

            <div class="status-text">
              {{ isOnline ? 'Connected' : 'Offline' }}
            </div>
          </div>
        </div>
      </div>
    </q-drawer>

    <!-- ========================= -->
    <!-- PAGE -->
    <!-- ========================= -->

    <q-page-container>
      <q-page class="trolley-page">
        <!-- Top bar -->
        <div class="topbar">
          <q-btn
            flat
            round
            dense
            icon="menu"
            class="mobile-menu"
            @click="drawerOpen = !drawerOpen"
          />

          <div class="page-title"> Smart Trolley </div>

          <div class="topbar-right">
            <q-chip
              dense
              :color="isOnline ? 'positive' : 'grey-6'"
              text-color="white"
              icon="circle"
            >
              {{ isOnline ? 'ONLINE' : 'OFFLINE' }}
            </q-chip>
          </div>
        </div>

        <!-- Child pages -->
        <div class="page-content">
          <router-view />
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'

const drawerOpen = ref(true)

// Untuk sementara OFFLINE.
// Nanti kita sambungkan ke status ESP32.
const isOnline = ref(false)
</script>

<style scoped>
.trolley-drawer {
  background: #071226;
  color: white;
}

.drawer-header {
  height: 80px;
  padding: 18px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.logo-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: #1d4ed8;

  font-size: 21px;
}

.logo-title {
  font-size: 15px;
  font-weight: 700;
}

.logo-subtitle {
  margin-top: 3px;
  font-size: 10px;
  color: #94a3b8;
}

.menu-list {
  padding: 15px 10px;
}

.menu-list .q-item {
  min-height: 48px;
  margin-bottom: 5px;
  border-radius: 10px;
  color: #94a3b8;
}

.menu-list .q-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: white;
}

.menu-active {
  background: #1d4ed8 !important;
  color: white !important;
}

.drawer-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}

.connection-status {
  padding: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}

.status-dot.online {
  background: #22c55e;
}

.status-dot.offline {
  background: #64748b;
}

.status-title {
  font-size: 12px;
  font-weight: 600;
}

.status-text {
  margin-top: 2px;
  font-size: 10px;
  color: #94a3b8;
}

.trolley-page {
  background: #f5f7fb;
  min-height: 100vh;
}

.topbar {
  height: 64px;
  padding: 0 25px;

  background: white;

  display: flex;
  align-items: center;
  justify-content: space-between;

  border-bottom: 1px solid #e5e7eb;
}

.page-title {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.topbar-right {
  display: flex;
  align-items: center;
}

.page-content {
  padding: 25px;
}

.mobile-menu {
  display: none;
}

@media (max-width: 800px) {
  .mobile-menu {
    display: block;
  }

  .topbar {
    padding: 0 15px;
  }

  .page-content {
    padding: 15px;
  }
}
</style>
