<template>
  <v-card>
    <v-card-title>
      Commandes passées
      <v-spacer></v-spacer>
      <v-text-field
        v-model="searchedValue"
        append-icon="mdi-magnify"
        label="Rechercher une commande"
        single-line
        hide-details
      ></v-text-field>
      <v-spacer></v-spacer>
      <v-select
        v-model="year"
        :items="yearsSince2020"
        label="Année"
        clearable
        class="year-select"
      ></v-select>
      <v-spacer></v-spacer>
      <v-btn color="success" @click="downloadCsv" :loading="isLoading">{{ downloadCsvLabel }}</v-btn>
    </v-card-title>

    <v-data-table :headers="headers" :items="orders" :search="searchedValue" sort-by="id" sort-desc class="elevation-1" :loading="isLoading">
      <template v-slot:item.products="{ item }">
        <span v-for="productWithQuantity in item.products" v-bind:key="productWithQuantity.product.id">
          - {{ productWithQuantity.product.name }} : {{ productWithQuantity.quantity }}<br/>
        </span>
      </template>

      <template v-slot:item.type="{ item }">
        <span>
          {{ orderTypeLabel(item) }}
        </span>
      </template>

      <template v-slot:item.actions="{ item }">
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-icon v-on="on" class="mr-2" @click="openEditOrderDialog(item)">
              mdi-pencil
            </v-icon>
          </template>
          <span>Modifier une commande</span>
        </v-tooltip>
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-icon v-on="on" @click="deleteOrder(item)">
              mdi-delete
            </v-icon>
          </template>
          <span>Supprimer une commande</span>
        </v-tooltip>
      </template>
    </v-data-table>

    <v-dialog v-model="editOrderDialog">
      <v-card>
        <v-card-title>
          <span class="headline">Modification de la commande</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-form ref="editOrderForm">
              <OrderTypeSelection :value="editedOrder" :closing-periods="closingPeriods" class="mb-5"></OrderTypeSelection>
              <ProductSelection :value="editedOrder" :available-products="products" class="mb-5"></ProductSelection>
              <OrderNote :value="editedOrder" class="mb-5"></OrderNote>
            </v-form>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeEditOrderDialog">Annuler</v-btn>
          <v-btn color="blue darken-1" text @click="updateOrder">Confirmer la modification</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script lang="ts">
import { Context, NuxtError } from '@nuxt/types';
import Vue from 'vue';
import OrderNote from '~/components/OrderNote.vue';
import OrderTypeSelection from '~/components/OrderTypeSelection.vue';
import ProductSelection from '~/components/ProductSelection.vue';
import { getOrderTypeLabel } from '../../../back/src/domain/order/order-type';
import { ProductIdWithQuantity, ProductWithQuantity } from '../../../back/src/domain/product/product-with-quantity';
import { OrderId } from '../../../back/src/domain/type-aliases';
import { GetClosingPeriodResponse } from '../../../back/src/infrastructure/rest/models/get-closing-period-response';
import { GetOrderResponse } from '../../../back/src/infrastructure/rest/models/get-order-response';
import { GetProductResponse } from '../../../back/src/infrastructure/rest/models/get-product-response';
import { PutOrderRequest } from '../../../back/src/infrastructure/rest/models/put-order-request';

interface CommandesData {
  editOrderDialog: boolean;
  searchedValue: string;
  headers: Array<{ text: string; value: string }>;
  orders: GetOrderResponse[];
  closingPeriods: GetClosingPeriodResponse[];
  products: GetProductResponse[];
  editedOrder: PutOrderRequest;
  editedOrderId: OrderId;
  year?: number;
  isLoading: boolean;
}

export default Vue.extend({
  name: 'commandes',
  middleware: 'auth',
  layout: 'admin',
  components: {
    OrderTypeSelection,
    ProductSelection,
    OrderNote,
  },
  data() {
    return {
      editOrderDialog: false,
      searchedValue: '',
      headers: [
        { text: '#', value: 'id' },
        { text: 'Nom', value: 'clientName' },
        { text: 'Téléphone', value: 'clientPhoneNumber' },
        { text: 'Email', value: 'clientEmailAddress' },
        { text: 'Produits sélectionnés', value: 'products' },
        { text: 'Type de commande', value: 'type' },
        { text: 'Date de cueillette', value: 'pickUpDate' },
        { text: 'Date de livraison', value: 'deliveryDate' },
        { text: 'Adresse de livraison', value: 'deliveryAddress' },
        { text: 'Date de réservation', value: 'reservationDate' },
        { text: 'Note', value: 'note', sortable: false },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
      orders: [],
      closingPeriods: [],
      products: [],
      editedOrder: {} as PutOrderRequest,
      editedOrderId: -1,
      year: undefined,
      isLoading: true,
    } as CommandesData;
  },
  async asyncData(ctx: Context): Promise<object> {
    const orders: GetOrderResponse[] = await ctx.app.$apiService.getLastOrders(30);
    const closingPeriods: GetClosingPeriodResponse[] = await ctx.app.$apiService.getClosingPeriods();
    const products: GetProductResponse[] = await ctx.app.$apiService.getProducts();

    const year: number = new Date().getFullYear();
    const isLoading: boolean = false;

    return { orders, closingPeriods, products, year, isLoading };
  },
  async mounted() {
    this.orders = await this.$apiService.getOrders(this.year);
  },
  watch: {
    editOrderDialog(value: boolean) {
      value || this.closeEditOrderDialog();
    },
    async year(value: number) {
      this.orders = [];
      this.isLoading = true;
      try {
        this.orders = await this.$apiService.getOrders(value);
        } catch (e) {
        this.handleError(e);
      }finally {
      this.isLoading = false;
      }
    },
  },
  computed: {
    yearsSince2020(): number[] {
      const startYear: number = 2020;
      const currentYear: number = new Date().getFullYear();
      const years: number[] = [];
      for (let i = startYear; i <= currentYear; i++) {
        years.push(i);
      }
      return years;
    },
    downloadCsvLabel(): string {
      return this.year ? `Télécharger les commandes de ${this.year} en CSV` : 'Télécharger tout en CSV';
    },
  },
  methods: {
    openEditOrderDialog(order: GetOrderResponse): void {
      const orderToEdit: PutOrderRequest = {} as PutOrderRequest;
      orderToEdit.products = order.products.map(
        (productWithQuantity: ProductWithQuantity) =>
          ({
            productId: productWithQuantity.product.id,
            quantity: productWithQuantity.quantity,
          } as ProductIdWithQuantity),
      );
      orderToEdit.type = order.type;
      orderToEdit.deliveryDate = order.deliveryDate;
      orderToEdit.deliveryAddress = order.deliveryAddress;
      orderToEdit.pickUpDate = order.pickUpDate;
      orderToEdit.reservationDate = order.reservationDate;
      orderToEdit.note = order.note;

      this.editedOrder = Object.assign({}, orderToEdit);
      this.editedOrderId = order.id;
      this.editOrderDialog = true;
    },

    closeEditOrderDialog(): void {
      this.editOrderDialog = false;
      setTimeout(() => {
        this.editedOrder = Object.assign({}, {} as PutOrderRequest);
        this.editedOrderId = -1;
      }, 300);
    },

    async updateOrder(): Promise<void> {
      if (this.$refs.editOrderForm.validate()) {
        try {
          await this.$apiService.putOrder(this.editedOrderId, this.editedOrder);
          this.orders = await this.$apiService.getOrders(this.year);
          this.closeEditOrderDialog();
        } catch (e) {
          this.handleError(e);
        }
      }
    },

    async deleteOrder(order: GetOrderResponse): Promise<void> {
      if (
        confirm(
          `Vous allez supprimer la commande #${order.id}.\nÊtes-vous certain de vouloir supprimer cette commande ?\n\nAttention, cette action est irréversible !`,
        )
      ) {
        try {
          await this.$apiService.deleteOrder(order.id);
          this.orders = await this.$apiService.getOrders(this.year);
        } catch (e) {
          this.handleError(e);
        }
      }
    },

    orderTypeLabel(order: GetOrderResponse): string {
      return getOrderTypeLabel(order.type);
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

    async downloadCsv(): Promise<void> {
      this.isLoading = true;
      const csvContent: string = await this.$apiService.getOrdersAsCsv(this.year);
      this.isLoading = false;
      const filenamePrefix: string = this.year ? `${this.year}` : 'all';

      const link: HTMLElement = document.createElement('a');
      link.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent));
      link.setAttribute('download', `${filenamePrefix}_orders_export_${new Date().toISOString()}.csv`);

      link.style.display = 'none';
      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);
    },
  },
});
</script>

<style scoped lang="scss">
.year-select {
  margin-bottom: -22px;
  max-width: 200px;
}
</style>
