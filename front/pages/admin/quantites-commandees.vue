<template>
  <v-card>
    <v-card-title>
      Quantités commandées
      <v-spacer></v-spacer>
      <v-menu v-model="showStartDatePicker" :nudge-right="40" transition="scale-transition" offset-y
              :close-on-content-click="false"
              min-width="290px">
        <template v-slot:activator="{ on }">
          <v-text-field
            v-model="startDate"
            label="Du"
            prepend-icon="mdi-calendar"
            readonly
            v-on="on"
            required
            :rules="[(v) => !!v || 'La date de début est requise']"
          ></v-text-field>
        </template>
        <v-date-picker
          v-model="startDate"
          @input="showStartDatePicker = false"
          locale="fr-ca"
        ></v-date-picker>
      </v-menu>
      <v-spacer></v-spacer>
      <v-menu v-model="showEndDatePicker" :nudge-right="40" transition="scale-transition" offset-y
              :close-on-content-click="false"
              min-width="290px">
        <template v-slot:activator="{ on }">
          <v-text-field
            v-model="endDate"
            label="Au (inclusif)"
            prepend-icon="mdi-calendar"
            readonly
            v-on="on"
            required
            :rules="[(v) => !!v || 'La date de fin est requise']"
          ></v-text-field>
        </template>
        <v-date-picker
          v-model="endDate"
          @input="showEndDatePicker = false"
          locale="fr-ca"
          :min="startDate"
        ></v-date-picker>
      </v-menu>
    </v-card-title>

    <v-data-table :headers="headers" :items="orderedProducts" sort-by="totalCount" sort-desc class="elevation-1" items-per-page="50"
                  :footer-props="{ 'items-per-page-options': [50, 10, 20, 30, 40, 100] }">
    </v-data-table>
  </v-card>
</template>

<script lang="ts">
import {Context} from '@nuxt/types';
import Vue from 'vue';
import {GetOrderedProductResponse} from '../../../back/src/infrastructure/rest/models/get-ordered-product-response';

interface QuantitesCommandeesData {
  showStartDatePicker: boolean;
  showEndDatePicker: boolean;
  startDate: string;
  endDate: string;
  headers: Array<{ text: string; value: string }>;
  orderedProducts: GetOrderedProductResponse[];
}

export default Vue.extend({
  name: 'quantites-commandees',
  middleware: 'auth',
  layout: 'admin',
  data() {
    return {
      showStartDatePicker: false,
      showEndDatePicker: false,
      startDate: '',
      endDate: '',
      headers: [
        {text: 'Produit', value: 'name'},
        {text: 'Réservation', value: 'reservationCount'},
        {text: 'Cueillette', value: 'pickUpCount'},
        {text: 'Livraison', value: 'deliveryCount'},
        {text: 'Total', value: 'totalCount'},
      ],
      orderedProducts: [],
    } as QuantitesCommandeesData;
  },
  async asyncData(ctx: Context): Promise<object> {
    const startDate: Date = new Date();
    const endDate: Date = new Date();
    endDate.setDate(endDate.getDate() + 6);

    const orderedProducts: GetOrderedProductResponse[] = await ctx.app.$apiService.getOrderedProductsByDateRange(startDate, endDate);

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      orderedProducts
    };
  },
  watch: {
    async startDate(value: string) {
      this.orderedProducts = await this.$apiService.getOrderedProductsByDateRange(this.toDate(value), this.toDate(this.endDate));
    },
    async endDate(value: string) {
      this.orderedProducts = await this.$apiService.getOrderedProductsByDateRange(this.toDate(this.startDate), this.toDate(value));
    },
  },
  methods: {
    toDate(dateAsIsoString: string): Date {
      if (dateAsIsoString.length > 10) {
        return new Date(dateAsIsoString);
      } else {
        return new Date(`${dateAsIsoString}T12:00:00Z`);
      }
    },
  },
});
</script>

<style scoped lang="scss">
</style>
