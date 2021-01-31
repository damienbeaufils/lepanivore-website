<template>
  <v-app class="body">
    <v-app-bar class="header" color="#8c5e32">
      <v-toolbar-title>
        <nuxt-link to="/">
          <img class="logo" alt="Logo Boulangerie Le Panivore" src="/img/logo-panivore.png" />
        </nuxt-link>
      </v-toolbar-title>
      <v-toolbar-items>
        <v-btn text color="#efd25c" class="nav-link" max-height="50px" nuxt to="/produits">
          Produits
        </v-btn>
        <v-btn text color="#efd25c" class="nav-link" max-height="50px" nuxt to="/commander">
          Commander
        </v-btn>
        <v-btn text color="#efd25c" class="nav-link" max-height="50px" nuxt to="/contact">
          Contact
        </v-btn>
        <v-btn text color="#efd25c" class="nav-link" max-height="50px" nuxt to="/a-propos">
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
@import '~vuetify/src/styles/settings/_variables';

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
.nav-link {
  margin-top: 8px;
}

@media #{map-get($display-breakpoints, 'sm-and-down')} {
  .logo {
    padding-top: 8px;
    width: 49px;
    height: 55px;
    object-fit: cover;
    object-position: left;
  }
}

@media #{map-get($display-breakpoints, 'xs-only')} {
  .logo {
    padding-top: 2px;
    width: 35px;
    height: 35px;
  }
  .nav-link {
    margin-top: 4px;
    font-size: 12px;
    padding: 0 8px !important;
  }
}
</style>
