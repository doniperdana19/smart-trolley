<template>
  <q-page class="home-page">
    <!-- HEADER -->
    <header class="top-header">
      <div class="brand"> SMART TROLLEY </div>

      <div class="user-area">
        <div class="user-info">
          <strong>{{ userEmail }}</strong>
          <span>Smart Trolley User</span>
        </div>

        <q-btn flat round icon="logout" color="white" @click="logout">
          <q-tooltip> Keluar </q-tooltip>
        </q-btn>
      </div>
    </header>

    <!-- CONTENT -->
    <main class="content">
      <!-- TITLE -->
      <section class="welcome-section">
        <div class="trolley-logo">
          <q-icon name="local_shipping" size="42px" />
        </div>

        <h1>
          Selamat Datang di
          <span>SMART TROLLEY</span>
        </h1>

        <p> Smart Transportation System </p>

        <div class="subtitle"> Intelligent • Efficient • Connected </div>
      </section>

      <!-- SEARCH -->
      <div class="search-box">
        <q-input
          v-model="search"
          dark
          outlined
          rounded
          dense
          placeholder="Cari modul..."
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>

      <!-- MODULES -->
      <section class="module-section">
        <div
          v-for="module in filteredModules"
          :key="module.id"
          class="module-card"
          :class="module.color"
          @click="openModule(module)"
        >
          <div class="module-icon">
            <q-icon :name="module.icon" size="38px" />
          </div>

          <div class="module-name">
            {{ module.name }}
          </div>

          <div class="module-description">
            {{ module.description }}
          </div>
        </div>
      </section>
    </main>

    <!-- FOOTER -->
    <footer> © 2026 Smart Trolley Project </footer>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabaseClient'

const router = useRouter()

const search = ref('')

const userEmail = ref('User')

/* =========================
   MODULE DATA
========================= */

const modules = [
  {
    id: 'eps',
    name: 'EPS',
    icon: 'factory',
    description: 'Modul Departemen EPS',
    color: 'eps'
  },

  {
    id: 'sewing',
    name: 'SEWING',
    icon: 'precision_manufacturing',
    description: 'Modul Departemen Sewing',
    color: 'sewing'
  },

  {
    id: 'trolley',
    name: 'TROLLEY',
    icon: 'local_shipping',
    description: 'Kontrol & Monitoring Trolley',
    color: 'trolley'
  }
]

/* =========================
   SEARCH
========================= */

const filteredModules = computed(() => {
  const keyword = search.value.toLowerCase().trim()

  if (!keyword) {
    return modules
  }

  return modules.filter(module => module.name.toLowerCase().includes(keyword))
})

/* =========================
   GET USER
========================= */

onMounted(async () => {
  const { data } = await supabase.auth.getUser()

  if (data?.user) {
    userEmail.value = data.user.email
  }
})

/* =========================
   OPEN MODULE
========================= */

function openModule(module) {
  if (module.id === 'eps') {
    router.push('/eps')
  } else if (module.id === 'sewing') {
    router.push('/sewing')
  } else if (module.id === 'trolley') {
    router.push('/trolley')
  }
}

/* =========================
   LOGOUT
========================= */

async function logout() {
  await supabase.auth.signOut()

  router.push('/')
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;

  background:
    radial-gradient(circle at 15% 30%, rgba(35, 92, 155, 0.2), transparent 35%),
    radial-gradient(
      circle at 85% 60%,
      rgba(65, 85, 180, 0.12),
      transparent 35%
    ),
    #070d1d;

  color: white;
}

/* =========================
   HEADER
========================= */

.top-header {
  height: 70px;

  display: flex;

  align-items: center;

  justify-content: space-between;

  padding: 0 30px;

  background: rgba(8, 18, 40, 0.95);

  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.brand {
  font-size: 20px;

  font-weight: 800;

  letter-spacing: 1px;
}

.user-area {
  display: flex;

  align-items: center;

  gap: 15px;
}

.user-info {
  display: flex;

  flex-direction: column;

  align-items: flex-end;
}

.user-info strong {
  font-size: 13px;
}

.user-info span {
  font-size: 10px;

  color: #7f8ca8;
}

/* =========================
   CONTENT
========================= */

.content {
  max-width: 1100px;

  margin: auto;

  padding: 70px 30px 40px;
}

/* =========================
   WELCOME
========================= */

.welcome-section {
  text-align: center;
}

.trolley-logo {
  width: 78px;

  height: 78px;

  margin: auto;

  display: flex;

  align-items: center;

  justify-content: center;

  border-radius: 22px;

  color: #5c8cff;

  background: rgba(65, 100, 190, 0.15);

  border: 1px solid rgba(92, 140, 255, 0.35);

  box-shadow: 0 0 35px rgba(70, 110, 255, 0.18);
}

.welcome-section h1 {
  margin: 25px 0 10px;

  font-size: 38px;

  font-weight: 700;
}

.welcome-section h1 span {
  color: #4f8cff;
}

.welcome-section p {
  margin: 0;

  color: #9ba8c2;

  font-size: 16px;
}

.subtitle {
  margin-top: 8px;

  color: #60708f;

  font-size: 13px;
}

/* =========================
   SEARCH
========================= */

.search-box {
  max-width: 430px;

  margin: 35px auto 50px;
}

.search-box :deep(.q-field__control) {
  background: rgba(255, 255, 255, 0.02);
}

/* =========================
   MODULES
========================= */

.module-section {
  display: flex;

  justify-content: center;

  gap: 28px;

  flex-wrap: wrap;
}

.module-card {
  width: 190px;

  min-height: 190px;

  padding: 25px 18px;

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  text-align: center;

  border-radius: 20px;

  background: rgba(15, 27, 52, 0.85);

  border: 1px solid rgba(255, 255, 255, 0.08);

  cursor: pointer;

  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.module-card:hover {
  transform: translateY(-7px);

  border-color: rgba(88, 130, 255, 0.5);

  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.35);
}

.module-icon {
  width: 72px;

  height: 72px;

  border-radius: 18px;

  display: flex;

  align-items: center;

  justify-content: center;

  margin-bottom: 18px;
}

.module-name {
  font-size: 15px;

  font-weight: 800;

  letter-spacing: 0.5px;
}

.module-description {
  margin-top: 7px;

  font-size: 11px;

  color: #7886a2;
}

/* =========================
   MODULE COLORS
========================= */

.module-card.eps .module-icon {
  color: #31c48d;

  background: rgba(49, 196, 141, 0.12);
}

.module-card.sewing .module-icon {
  color: #8b6cff;

  background: rgba(139, 108, 255, 0.12);
}

.module-card.trolley .module-icon {
  color: #4f8cff;

  background: rgba(79, 140, 255, 0.12);
}

/* =========================
   FOOTER
========================= */

footer {
  text-align: center;

  padding: 25px;

  color: #4d5870;

  font-size: 11px;
}

/* =========================
   MOBILE
========================= */

@media (max-width: 700px) {
  .top-header {
    padding: 0 15px;
  }

  .user-info {
    display: none;
  }

  .content {
    padding: 45px 20px;
  }

  .welcome-section h1 {
    font-size: 28px;
  }

  .module-card {
    width: 150px;

    min-height: 170px;
  }
}
</style>
