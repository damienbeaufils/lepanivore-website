<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>
      <v-card>
        <v-card-title class="headline">Merci !</v-card-title>
        <v-card-text>
          <p>
            Votre commande a bien été enregistrée ! Votre numéro de commande est le : <b>{{ orderId }}</b>
          </p>
          <p>
            Nous vous recontacterons sous peu pour vous confirmer votre commande.
          </p>
          <p>Merci et à bientôt !</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" nuxt to="/">
            Retour à l'accueil
          </v-btn>
          <v-spacer />
        </v-card-actions>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import Vue from 'vue';
import { OrderId } from '../../back/src/domain/type-aliases';

export default Vue.extend({
  name: 'confirmation-de-commande',

  computed: {
    orderId(): OrderId {
      return parseInt(this.$route.query.orderId as string, 10);
    },
  },
});
</script>
