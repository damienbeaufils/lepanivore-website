<template>
  <v-app class="body">
    <v-app-bar class="header" color="#8c5e32">
      <v-toolbar-title>
        <nuxt-link to="/">
          <img class="logo" alt="Logo Boulangerie Le Panivore" src="/img/logo-panivore.png" />
        </nuxt-link>
      </v-toolbar-title>
      <v-toolbar-items>
        <v-btn text color="#efd25c" class="mt-2" max-height="50px" nuxt to="/produits">
          Produits
        </v-btn>
        <v-btn text color="#efd25c" class="mt-2" max-height="50px" nuxt to="/commander">
          Commander
        </v-btn>
        <v-btn text color="#efd25c" class="mt-2" max-height="50px" nuxt to="/contact">
          Contact
        </v-btn>
        <v-btn text color="#efd25c" class="mt-2" max-height="50px" nuxt to="/a-propos">
          À propos
        </v-btn>
      </v-toolbar-items>
    </v-app-bar>
    <v-main class="main-content">
      <v-container fluid>
        <nuxt />
      </v-container>
    </v-main>
    <Footer />
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';
import Footer from '~/components/Footer.vue';

export default Vue.extend({
  components: {
    Footer,
  },
});
</script>

<style scoped lang="scss">
.header {
  max-height: 64px;
  color: #efd25c;
}
.body {
  background-color: #dda;
}
.main-content {
  margin-left: auto;
  margin-right: auto;
}
.logo {
  margin-top: 8px;
  max-height: 55px;
}
</style>
