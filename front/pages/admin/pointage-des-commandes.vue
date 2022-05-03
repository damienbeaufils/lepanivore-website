<template>
  <v-card>
    <v-card-title>
      Pointage des commandes (de type cueillette et réservation seulement)
      <v-spacer></v-spacer>
      <v-menu v-model="showDatePicker" :nudge-right="40" transition="scale-transition" offset-y :close-on-content-click="false" min-width="290px">
        <template v-slot:activator="{ on }">
          <v-text-field
            v-model="date"
            label="Date"
            prepend-icon="mdi-calendar"
            readonly
            v-on="on"
            required
            :rules="[(v) => !!v || 'La date est requise']"
          ></v-text-field>
        </template>
        <v-date-picker v-model="date" @input="showDatePicker = false" locale="fr-ca"></v-date-picker>
      </v-menu>
    </v-card-title>

    <v-data-table
      :headers="headers"
      :items="ordersWithoutDelivery"
      sort-by="id"
      class="elevation-1"
      :items-per-page="50"
      :footer-props="{ 'items-per-page-options': [50, 10, 20, 30, 40, 100] }"
      :loading="isLoading"
    >
      <template v-slot:item.products="{ item }">
        <span v-for="productWithQuantity in item.products" v-bind:key="productWithQuantity.product.id">
          - {{ productWithQuantity.product.name }} : {{ productWithQuantity.quantity }}<br />
        </span>
      </template>

      <template v-slot:item.type="{ item }">
        <span>
          {{ orderTypeLabel(item) }}
        </span>
      </template>

      <template v-slot:item.checked="{ item }">
        <span>
          {{ orderCheckedLabel(item) }}
        </span>
      </template>

      <template v-slot:item.actions="{ item }">
        <v-tooltip bottom v-if="item.checked">
          <template v-slot:activator="{ on }">
            <v-icon v-on="on" class="mr-2" large color="green" @click="uncheckOrder(item)"> mdi-checkbox-marked-circle</v-icon>
          </template>
          <span>Supprimer le pointage</span>
        </v-tooltip>
        <v-tooltip bottom v-else>
          <template v-slot:activator="{ on }">
            <v-icon v-on="on" class="pl-1 mr-2" @click="checkOrder(item)"> mdi-check</v-icon>
          </template>
          <span>Pointer la commande comme récupérée</span>
        </v-tooltip>
      </template>
    </v-data-table>
  </v-card>
</template>

<script lang="ts">
import { Context, NuxtError } from '@nuxt/types';
import Vue from 'vue';
import { getOrderTypeLabel, OrderType } from '../../../back/src/domain/order/order-type';
import { GetOrderResponse } from '../../../back/src/infrastructure/rest/models/get-order-response';

interface PointageDesCommandesData {
  headers: Array<{ text: string; value: string }>;
  orders: GetOrderResponse[];
  date: string;
  showDatePicker: boolean;
  isLoading: boolean;
}

export default Vue.extend({
  name: 'pointage-des-commandes',
  middleware: 'auth',
  layout: 'admin',
  data() {
    return {
      headers: [
        { text: '#', value: 'id' },
        { text: 'Nom', value: 'clientName' },
        { text: 'Téléphone', value: 'clientPhoneNumber' },
        { text: 'Email', value: 'clientEmailAddress' },
        { text: 'Produits sélectionnés', value: 'products' },
        { text: 'Type de commande', value: 'type' },
        { text: 'Date de cueillette', value: 'pickUpDate' },
        { text: 'Date de réservation', value: 'reservationDate' },
        { text: 'Note', value: 'note', sortable: false },
        { text: 'Actions', value: 'actions', sortable: false },
        { text: 'Pointage', value: 'checked' },
      ],
      orders: [],
      date: '',
      showDatePicker: false,
      isLoading: true,
    } as PointageDesCommandesData;
  },
  async asyncData(ctx: Context): Promise<object> {
    const date: Date = new Date();
    const orders: GetOrderResponse[] = await ctx.app.$apiService.getOrdersByDate(date);
    const isLoading: boolean = false;

    return { date: date.toISOString().split('T')[0], orders, isLoading };
  },
  watch: {
    async date(value: string): Promise<void> {
      this.orders = [];
      this.isLoading = true;
      try {
        this.orders = await this.$apiService.getOrdersByDate(this.toDate(value));
      } catch (e) {
        this.handleError(e as NuxtError);
      } finally {
        this.isLoading = false;
      }
    },
  },
  computed: {
    ordersWithoutDelivery(): GetOrderResponse[] {
      return this.orders.filter((order) => order.type !== OrderType.DELIVERY);
    },
  },
  methods: {
    async checkOrder(order: GetOrderResponse): Promise<void> {
      this.isLoading = true;
      try {
        await this.$apiService.checkOrder(order.id);
        this.orders = await this.$apiService.getOrdersByDate(this.toDate(this.date));
      } catch (e) {
        this.handleError(e as NuxtError);
      } finally {
        this.isLoading = false;
      }
    },

    async uncheckOrder(order: GetOrderResponse): Promise<void> {
      this.isLoading = true;
      try {
        await this.$apiService.uncheckOrder(order.id);
        this.orders = await this.$apiService.getOrdersByDate(this.toDate(this.date));
      } catch (e) {
        this.handleError(e as NuxtError);
      } finally {
        this.isLoading = false;
      }
    },

    toDate(dateAsIsoString: string): Date {
      if (dateAsIsoString.length > 10) {
        return new Date(dateAsIsoString);
      } else {
        return new Date(`${dateAsIsoString}T12:00:00Z`);
      }
    },

    orderTypeLabel(order: GetOrderResponse): string {
      return getOrderTypeLabel(order.type);
    },

    orderCheckedLabel(order: GetOrderResponse): string {
      return order.checked ? 'Récupérée' : 'En attente';
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
