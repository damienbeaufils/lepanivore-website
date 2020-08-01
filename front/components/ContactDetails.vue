<template>
  <v-card>
    <v-card-title>
      {{ isInAdmin ? 'Coordonnées du client' : 'Vos coordonnées' }}
    </v-card-title>
    <v-container>
      <v-row>
        <v-col cols="12" sm="6" md="4">
          <v-text-field
            v-model="value.clientName"
            :rules="[(v) => !!v || 'Le nom est requis']"
            :label="isInAdmin ? 'Nom du client' : 'Votre nom'"
            required
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <v-text-field
            v-model="value.clientPhoneNumber"
            :rules="[(v) => !!v || 'Le numéro de téléphone est requis']"
            :label="isInAdmin ? 'Numéro de téléphone du client' : 'Votre numéro de téléphone'"
            required
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <v-text-field
            v-model="value.clientEmailAddress"
            :rules="[
              (v) => !!v || `L'adresse électronique est requise`,
              (v) => emailRegex.test(v) || `L'adresse électronique entrée n'est pas valide`,
            ]"
            :label="isInAdmin ? 'Adresse électronique du client' : 'Votre adresse électronique'"
            required
          ></v-text-field>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script lang="ts">
import Vue, { PropOptions } from 'vue';
import { PostOrderRequest } from '../../back/src/infrastructure/rest/models/post-order-request';
import { PutOrderRequest } from '../../back/src/infrastructure/rest/models/put-order-request';

interface ContactDetailsData {
  emailRegex: RegExp;
}

export default Vue.extend({
  name: 'ContactDetails',
  props: {
    value: { required: true } as PropOptions<PostOrderRequest | PutOrderRequest>,
  },
  data() {
    return {
      emailRegex: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    } as ContactDetailsData;
  },
  computed: {
    isInAdmin(): boolean {
      return this.$route.path.includes('admin');
    },
  },
});
</script>
