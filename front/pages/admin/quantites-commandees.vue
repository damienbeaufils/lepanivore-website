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
        ></v-date-picker>
      </v-menu>
    </v-card-title>

    <v-data-table :headers="headers" :items="ordersGroupedByProducts" sort-by="totalCount" sort-desc
                  class="elevation-1">
      <template v-slot:item.totalCount="{ item }">
        {{ item.pickUpCount + item.deliveryCount + item.reservationCount }}
      </template>
    </v-data-table>
  </v-card>
</template>

<script lang="ts">
import {Context} from '@nuxt/types';
import Vue from 'vue';
import {GetOrderResponse} from '../../../back/src/infrastructure/rest/models/get-order-response';
import {OrderType} from '../../../back/src/domain/order/order-type';

interface QuantitesCommandeesData {
  showStartDatePicker: boolean;
  showEndDatePicker: boolean;
  startDate: string;
  endDate: string;
  headers: Array<{ text: string; value: string }>;
  orders: GetOrderResponse[];
}

interface OrderedProduct {
  name: string;
  pickUpCount: number;
  deliveryCount: number;
  reservationCount: number;
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
      orders: [],
    } as QuantitesCommandeesData;
  },
  async asyncData(ctx: Context): Promise<object> {
    const startDate: Date = new Date();
    const endDate: Date = new Date();
    endDate.setDate(endDate.getDate() + 6);

    const orders: GetOrderResponse[] = await ctx.app.$apiService.getOrdersByDateRange(startDate, endDate);

    return {startDate: startDate.toISOString().split('T')[0], endDate: endDate.toISOString().split('T')[0], orders,};
  },
  watch: {
    async startDate(value: string) {
      this.orders = await this.$apiService.getOrdersByDateRange(this.toDate(value), this.toDate(this.endDate));
    },
    async endDate(value: string) {
      this.orders = await this.$apiService.getOrdersByDateRange(this.toDate(this.startDate), this.toDate(value));
    },
  },
  computed: {
    ordersGroupedByProducts(): OrderedProduct[] {
      // TODO: move this logic to backend as product endpoint?
      const orderedProducts: OrderedProduct[] = [];
      this.orders.forEach(order => {
        order.products.forEach(productWithQuantity => {
          const productName = productWithQuantity.product.name;
          const existingOrderedProduct = orderedProducts.find(orderedProduct => orderedProduct.name === productName);
          let orderedProduct;
          if (existingOrderedProduct) {
            orderedProduct = existingOrderedProduct;
          } else {
            orderedProduct = this.emptyOrderedProduct(productName);
            orderedProducts.push(orderedProduct);
          }
          switch (order.type) {
            case OrderType.PICK_UP:
              orderedProduct.pickUpCount += productWithQuantity.quantity;
              break;
            case OrderType.DELIVERY:
              orderedProduct.deliveryCount += productWithQuantity.quantity;
              break;
            case OrderType.RESERVATION:
              orderedProduct.reservationCount += productWithQuantity.quantity;
              break;
          }
        });
      });
      return orderedProducts;
    }
  },
  methods: {
    toDate(dateAsIsoString: string): Date {
      if (dateAsIsoString.length > 10) {
        return new Date(dateAsIsoString);
      } else {
        return new Date(`${dateAsIsoString}T12:00:00Z`);
      }
    },
    emptyOrderedProduct(name: string): OrderedProduct {
      return {name, pickUpCount: 0, deliveryCount: 0, reservationCount: 0}
    }
  },
});
</script>

<style scoped lang="scss">
</style>
