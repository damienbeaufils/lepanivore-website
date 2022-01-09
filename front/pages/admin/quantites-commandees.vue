<template>
  <v-card>
    <v-card-title>
      Quantités commandées
      <v-spacer></v-spacer>
      <v-menu
        v-model="showStartDatePicker"
        :nudge-right="40"
        transition="scale-transition"
        offset-y
        :close-on-content-click="false"
        min-width="290px"
      >
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
        <v-date-picker v-model="startDate" @input="showStartDatePicker = false" locale="fr-ca"></v-date-picker>
      </v-menu>
      <v-spacer></v-spacer>
      <v-menu v-model="showEndDatePicker" :nudge-right="40" transition="scale-transition" offset-y :close-on-content-click="false" min-width="290px">
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
        <v-date-picker v-model="endDate" @input="showEndDatePicker = false" locale="fr-ca" :min="startDate"></v-date-picker>
      </v-menu>
    </v-card-title>

    <v-card-subtitle>
      <v-row>
        <v-col cols="12" sm="4" md="5" class="text-sm-right">Types de commande :</v-col>
        <v-col cols="12" sm="8" md="7">
          <v-row no-gutters>
            <v-col cols="12" sm="4" md="3" lg="2">
              <v-checkbox v-model="showReservationOrders" label="Réservation" class="pa-0 ma-0" />
            </v-col>
            <v-col cols="12" sm="4" md="3" lg="2">
              <v-checkbox v-model="showPickUpOrders" label="Cueillette" class="pa-0 ma-0" />
            </v-col>
            <v-col cols="12" sm="4" md="3" lg="2">
              <v-checkbox v-model="showDeliveryOrders" label="Livraison" class="pa-0 ma-0" />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-card-subtitle>

    <v-data-table
      :headers="headers"
      :items="filteredOrderedProducts"
      sort-by="totalCount"
      sort-desc
      class="elevation-1"
      :items-per-page="50"
      :footer-props="{ 'items-per-page-options': [50, 10, 20, 30, 40, 100] }"
    >
    </v-data-table>
  </v-card>
</template>

<script lang="ts">
import { Context, NuxtError } from '@nuxt/types';
import Vue from 'vue';
import { GetOrderedProductResponse } from '../../../back/src/infrastructure/rest/models/get-ordered-product-response';

interface QuantitesCommandeesData {
  showStartDatePicker: boolean;
  showEndDatePicker: boolean;
  startDate: string;
  endDate: string;
  headers: Array<{ text: string; value: string }>;
  orderedProducts: GetOrderedProductResponse[];
  showReservationOrders: boolean;
  showPickUpOrders: boolean;
  showDeliveryOrders: boolean;
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
        { text: 'Produit', value: 'name' },
        { text: 'Réservation', value: 'reservationCount' },
        { text: 'Cueillette', value: 'pickUpCount' },
        { text: 'Livraison', value: 'deliveryCount' },
        { text: 'Total', value: 'totalCount', cellClass: 'font-weight-bold' },
      ],
      orderedProducts: [],
      showReservationOrders: true,
      showPickUpOrders: true,
      showDeliveryOrders: true,
    } as QuantitesCommandeesData;
  },
  async asyncData(ctx: Context): Promise<object> {
    const startDate: Date = new Date();
    const endDate: Date = new Date();

    const orderedProducts: GetOrderedProductResponse[] = await ctx.app.$apiService.getOrderedProductsByDateRange(startDate, endDate);

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      orderedProducts,
    };
  },
  watch: {
    async startDate(value: string): Promise<void> {
      try {
        this.orderedProducts = await this.$apiService.getOrderedProductsByDateRange(this.toDate(value), this.toDate(this.endDate));
      } catch (e) {
        this.handleError(e);
      }
    },
    async endDate(value: string): Promise<void> {
      try {
        this.orderedProducts = await this.$apiService.getOrderedProductsByDateRange(this.toDate(this.startDate), this.toDate(value));
      } catch (e) {
        this.handleError(e);
      }
    },
  },
  computed: {
    filteredOrderedProducts(): GetOrderedProductResponse[] {
      return this.orderedProducts.map((orderedProduct: GetOrderedProductResponse) => {
        const filteredOrderedProduct: GetOrderedProductResponse = this.buildEmptyOrderedProduct(orderedProduct.name);
        if (this.showReservationOrders) {
          filteredOrderedProduct.reservationCount = orderedProduct.reservationCount;
          filteredOrderedProduct.totalCount += orderedProduct.reservationCount;
        }
        if (this.showPickUpOrders) {
          filteredOrderedProduct.pickUpCount = orderedProduct.pickUpCount;
          filteredOrderedProduct.totalCount += orderedProduct.pickUpCount;
        }
        if (this.showDeliveryOrders) {
          filteredOrderedProduct.deliveryCount = orderedProduct.deliveryCount;
          filteredOrderedProduct.totalCount += orderedProduct.deliveryCount;
        }
        return filteredOrderedProduct;
      });
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

    buildEmptyOrderedProduct(name: string): GetOrderedProductResponse {
      return { name, pickUpCount: 0, deliveryCount: 0, reservationCount: 0, totalCount: 0 };
    },

    handleError(e: NuxtError): void {
      const message: string =
        e.statusCode === 401
          ? 'Votre session a expiré. Merci de <nuxt-link to="/admin/connexion">vous reconnecter en cliquant ici</nuxt-link>.'
          : `Une erreur s'est produite, veuillez nous excuser ! Si le problème persiste, contactez-nous.<br/><br/>Error message: ${e.message}`;
      // @ts-ignore
      this.$toast.error(message, {
        icon: 'mdi-alert',
        action: {
          text: 'Reconnexion',
          href: '/admin/connexion',
        },
      });
    },
  },
});
</script>

<style scoped lang="scss"></style>
