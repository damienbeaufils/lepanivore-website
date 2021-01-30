<template>
  <v-layout>
    <v-flex class="text-center"
      ><h1 v-if="error.statusCode === 404">
        {{ pageNotFound }}
      </h1>
      <h1 v-else>
        {{ otherError }}
      </h1>
      <nuxt-link to="/">
        Retour à la page d'accueil
      </nuxt-link>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import { NuxtError } from '@nuxt/types';
import Vue, { PropOptions } from 'vue';
import Footer from '~/components/Footer.vue';

interface ErrorData {
  pageNotFound: string;
  otherError: string;
}

export default Vue.extend({
  components: {
    Footer,
  },
  props: {
    error: { required: true } as PropOptions<NuxtError>,
  },
  data() {
    return {
      pageNotFound: 'Page non trouvée !',
      otherError: "Une erreur s'est produite, veuillez nous excuser ! Si le problème persiste, contactez-nous.",
    } as ErrorData;
  },
  head() {
    // @ts-ignore
    const title = this.error.statusCode === 404 ? this.pageNotFound : this.otherError;
    return {
      title,
    };
  },
});
</script>

<style scoped>
h1 {
  font-size: 20px;
}
</style>
