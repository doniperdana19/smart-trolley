<template>
  <q-page class="login-page">
    <div class="login-container">
      <!-- ================= LEFT PANEL ================= -->
      <section class="brand-panel">
        <div class="brand-content">
          <div class="trolley-illustration">
            <div class="trolley-handle"></div>

            <div class="trolley-body">
              <div class="trolley-platform"></div>
              <div class="trolley-front"></div>

              <div class="wheel wheel-left"></div>
              <div class="wheel wheel-right"></div>
            </div>

            <div class="smart-light">
              <q-icon name="memory" size="28px" />
            </div>
          </div>

          <h1>SMART TROLLEY</h1>

          <p>Smart Transportation System</p>

          <span>Intelligent • Efficient • Connected</span>
        </div>
      </section>

      <!-- ================= RIGHT PANEL ================= -->
      <section class="form-panel">
        <div class="form-wrapper">
          <!-- LOGO -->
          <div class="app-logo">
            <q-icon name="local_shipping" size="34px" />
          </div>

          <h2>Selamat Datang</h2>

          <p class="subtitle"> Silakan masuk ke akun Anda </p>

          <!-- ================= EMAIL ================= -->
          <div class="input-label"> EMAIL ADDRESS </div>

          <q-input
            v-model="email"
            outlined
            dark
            placeholder="Masukkan email"
            class="custom-input"
            type="email"
            autocomplete="email"
            @keyup.enter="login"
          >
            <template #prepend>
              <q-icon name="alternate_email" />
            </template>
          </q-input>

          <!-- ================= PASSWORD ================= -->
          <div class="password-header">
            <div class="input-label"> PASSWORD </div>

            <a href="#" @click.prevent="forgotPassword"> Lupa Password? </a>
          </div>

          <q-input
            v-model="password"
            outlined
            dark
            :type="showPassword ? 'text' : 'password'"
            placeholder="Masukkan password"
            class="custom-input"
            autocomplete="current-password"
            @keyup.enter="login"
          >
            <template #prepend>
              <q-icon name="lock" />
            </template>

            <template #append>
              <q-icon
                :name="showPassword ? 'visibility' : 'visibility_off'"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>

          <!-- ================= REMEMBER ================= -->
          <q-checkbox
            v-model="remember"
            dark
            label="Ingat saya di perangkat ini"
            class="remember-checkbox"
          />

          <!-- ================= LOGIN BUTTON ================= -->
          <q-btn
            unelevated
            rounded
            no-caps
            class="login-button"
            :loading="loading"
            :disable="loading"
            label="MASUK"
            icon-right="login"
            @click="login"
          />

          <!-- FOOTER -->
          <div class="footer"> © 2026 Smart Trolley Project </div>
        </div>
      </section>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabaseClient'

const router = useRouter()

const email = ref('')
const password = ref('')
const remember = ref(true)
const showPassword = ref(false)
const loading = ref(false)

async function login() {
  // Validasi
  if (!email.value || !password.value) {
    window.alert('Email dan password wajib diisi.')
    return
  }

  loading.value = true

  try {
    // Login ke Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value.trim(),
      password: password.value
    })

    // Kalau login gagal
    if (error) {
      console.error('Login Error:', error)

      window.alert('Login gagal:\n' + error.message)

      return
    }

    // Login berhasil
    console.log('Login berhasil:', data)

    window.alert('Login berhasil! ')

    // Pindah ke halaman Home
    router.push('/home')
  } catch (error) {
    console.error('Unexpected Error:', error)

    window.alert('Terjadi kesalahan saat login.')
  } finally {
    loading.value = false
  }
}

function forgotPassword() {
  window.alert('Fitur lupa password akan kita buat setelah login selesai.')
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;

  background:
    radial-gradient(
      circle at 20% 50%,
      rgba(49, 88, 150, 0.25),
      transparent 35%
    ),
    #070d1d;

  display: flex;

  align-items: center;

  justify-content: center;

  padding: 30px;
}

.login-container {
  width: 100%;

  max-width: 1050px;

  min-height: 620px;

  display: grid;

  grid-template-columns: 1fr 1fr;

  border-radius: 28px;

  overflow: hidden;

  background: #0d1328;

  border: 1px solid rgba(255, 255, 255, 0.08);

  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.45);
}

/* =========================
   LEFT PANEL
========================= */

.brand-panel {
  background:
    radial-gradient(
      circle at 50% 35%,
      rgba(83, 126, 255, 0.18),
      transparent 40%
    ),
    linear-gradient(145deg, #f4f8ff, #dceaff);

  display: flex;

  align-items: center;

  justify-content: center;

  text-align: center;

  color: #193c72;
}

.brand-content {
  width: 85%;
}

.brand-content h1 {
  font-size: 30px;

  font-weight: 800;

  margin: 35px 0 8px;

  letter-spacing: 1px;
}

.brand-content p {
  font-size: 16px;

  margin: 0;

  color: #3769b4;
}

.brand-content span {
  display: block;

  margin-top: 8px;

  font-size: 13px;

  color: #6284b2;
}

/* =========================
   TROLLEY
========================= */

.trolley-illustration {
  position: relative;

  width: 310px;

  height: 210px;

  margin: auto;
}

.trolley-body {
  position: absolute;

  left: 25px;

  bottom: 35px;

  width: 260px;

  height: 100px;
}

.trolley-platform {
  position: absolute;

  width: 260px;

  height: 65px;

  background: #1b2435;

  border-radius: 12px;

  transform: perspective(350px) rotateX(12deg);

  box-shadow: 0 15px 25px rgba(0, 0, 0, 0.25);
}

.trolley-front {
  position: absolute;

  top: 38px;

  left: 10px;

  width: 240px;

  height: 30px;

  background: #111827;

  border-radius: 0 0 10px 10px;
}

.trolley-handle {
  position: absolute;

  width: 12px;

  height: 130px;

  background: #263449;

  right: 50px;

  bottom: 90px;

  border-radius: 8px;

  transform: rotate(5deg);
}

.trolley-handle::before {
  content: '';

  position: absolute;

  width: 75px;

  height: 12px;

  background: #263449;

  top: 0;

  right: -2px;

  border-radius: 8px;
}

.wheel {
  position: absolute;

  width: 48px;

  height: 48px;

  background: #27364d;

  border: 8px solid #8795a8;

  border-radius: 50%;

  bottom: -5px;
}

.wheel-left {
  left: 20px;
}

.wheel-right {
  right: 20px;
}

.smart-light {
  position: absolute;

  right: 18px;

  top: 65px;

  width: 50px;

  height: 50px;

  border-radius: 50%;

  background: #3d73ff;

  color: white;

  display: flex;

  align-items: center;

  justify-content: center;

  box-shadow: 0 0 30px rgba(61, 115, 255, 0.7);
}

/* =========================
   RIGHT PANEL
========================= */

.form-panel {
  display: flex;

  align-items: center;

  justify-content: center;

  background: #0b1024;

  color: white;
}

.form-wrapper {
  width: 78%;

  max-width: 390px;
}

.app-logo {
  width: 65px;

  height: 65px;

  margin: 0 auto 25px;

  border-radius: 50%;

  display: flex;

  align-items: center;

  justify-content: center;

  background: #17213d;

  color: #5c7cff;

  border: 3px solid #5875ff;

  box-shadow: 0 0 30px rgba(88, 117, 255, 0.35);
}

.form-wrapper h2 {
  text-align: center;

  font-size: 32px;

  margin: 0;

  font-weight: 800;
}

.subtitle {
  text-align: center;

  color: #8c93aa;

  margin: 12px 0 35px;
}

/* =========================
   INPUT
========================= */

.input-label {
  font-size: 12px;

  font-weight: 700;

  letter-spacing: 1px;

  color: #aeb4c8;

  margin-bottom: 8px;
}

.custom-input {
  margin-bottom: 22px;
}

.custom-input :deep(.q-field__control) {
  border-radius: 14px;

  background: rgba(255, 255, 255, 0.015);
}

.custom-input :deep(.q-field__native) {
  color: white;
}

.custom-input :deep(.q-field__prepend) {
  color: #4f8cff;
}

.password-header {
  display: flex;

  justify-content: space-between;

  align-items: center;
}

.password-header a {
  color: #5c9cff;

  text-decoration: none;

  font-size: 12px;

  font-weight: 600;
}

/* =========================
   REMEMBER
========================= */

.remember-checkbox {
  margin: 0 0 22px;
}

/* =========================
   BUTTON
========================= */

.login-button {
  width: 100%;

  height: 52px;

  background: linear-gradient(90deg, #5d63ee, #397cf4);

  color: white;

  font-size: 15px;

  font-weight: 800;

  box-shadow: 0 10px 25px rgba(61, 100, 240, 0.3);
}

.footer {
  text-align: center;

  color: #5e6478;

  font-size: 11px;

  margin-top: 35px;
}

/* =========================
   MOBILE
========================= */

@media (max-width: 800px) {
  .login-page {
    padding: 15px;
  }

  .login-container {
    grid-template-columns: 1fr;

    max-width: 500px;
  }

  .brand-panel {
    min-height: 280px;

    padding: 35px 20px;
  }

  .trolley-illustration {
    transform: scale(0.75);

    margin-top: -15px;

    margin-bottom: -30px;
  }

  .brand-content h1 {
    font-size: 24px;

    margin-top: 15px;
  }

  .form-panel {
    padding: 45px 20px;
  }

  .form-wrapper {
    width: 100%;
  }
}
</style>
