<template>
  <v-card>
    <v-card-title>
      Informations additionnelles
    </v-card-title>
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-textarea v-model="value.note" label="Un commentaire ou une remarque ?" auto-grow clearable single-line rows="1"></v-textarea>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script lang="ts">
import Vue, { PropOptions } from 'vue';
import { PostOrderRequest } from '../../back/src/infrastructure/rest/models/post-order-request';
import { PutOrderRequest } from '../../back/src/infrastructure/rest/models/put-order-request';

export default Vue.extend({
  name: 'OrderNote',
  props: {
    value: { required: true } as PropOptions<PostOrderRequest | PutOrderRequest>,
  },
});
</script>
