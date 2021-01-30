<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>
      <v-card class="yellow-card">
        <v-card-title class="headline">Des ingrédients naturels pour un pain exceptionnel.</v-card-title>
        <v-card-text>
          <p>Toutes nos pâtes à pain sont exclusivement préparées à partir de farines biologiques, d'eau filtrée, de levain naturel biologique et de sel de mer.</p>
          <p>Aucun additif n'est utilisé et la teneur en sel est réduite.</p>
          <p>Nos pains se conservent longtemps, sont consistants (type à l'ancienne) et très protéinés.</p>
          <p><img class="recipe" alt="Recette Panivore" src="/img/recette-panivore.png" /></p>
        </v-card-text>
      </v-card>

      <v-card class="yellow-card">
        <v-card-title class="headline">Livraison à domicile chaque jeudi soir.</v-card-title>
        <v-card-text>
          <p>Vous passez votre commande <nuxt-link to="commander">ici</nuxt-link> ; nous vous la livrons à domicile le jeudi soir.</p>
          <p><i>Service gratuit pour la Petite-Patrie (Jean Talon - Des Carrières - Des Érables - Christophe-Colomb).</i></p>
        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'index',
});
</script>

<style lang="scss">
.recipe {
  max-width: 1000px;
  width: 100%;
}

.yellow-card {
  color: #683c11 !important;
  background-color: rgba(229,198,88,.5) !important;
  margin-bottom: 20px;

  .headline {
    font-size: 30px !important;
  }
}
</style>
