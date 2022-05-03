<template>
  <v-layout>
    <v-flex class="text-center">
      <h1>Commande manuelle (sans restriction de dates)<br />ou réservation (mise de côté)</h1>
      <v-row justify="center">
        <v-col cols="6">
          <v-alert type="info" class="mr-20">
            Aucune notification de nouvelle commande ne sera envoyée par courriel
          </v-alert>
        </v-col>
      </v-row>
      <v-form ref="form" @submit.prevent="validateAndSubmit" v-if="productOrderingStatus">
        <v-container>
          <ContactDetails :value="order" class="mb-5"></ContactDetails>
          <OrderTypeSelection :value="order" :closing-periods="closingPeriods" class="mb-5"></OrderTypeSelection>
          <ProductSelection :value="order" :available-products="products" class="mb-5"></ProductSelection>
          <OrderNote :value="order" class="mb-5"></OrderNote>

          <v-btn :loading="isLoading" color="primary" type="submit" x-large>
            Valider la commande
          </v-btn>
        </v-container>
      </v-form>
      <div v-else>
        <v-alert type="info" class="product-ordering-disabled mt-12">
          La commande en ligne n'est présentement pas possible. En cas d'urgence, n'hésitez pas à
          <nuxt-link to="/contact">nous contacter</nuxt-link>.
        </v-alert>
      </div>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import { Context, NuxtError } from '@nuxt/types';
import Vue from 'vue';
import ContactDetails from '~/components/ContactDetails.vue';
import OrderNote from '~/components/OrderNote.vue';
import OrderTypeSelection from '~/components/OrderTypeSelection.vue';
import ProductSelection from '~/components/ProductSelection.vue';
import { FeatureStatus } from '../../../back/src/domain/feature/feature-status';
import { GetClosingPeriodResponse } from '../../../back/src/infrastructure/rest/models/get-closing-period-response';
import { GetProductOrderingResponse } from '../../../back/src/infrastructure/rest/models/get-product-ordering-response';
import { GetProductResponse } from '../../../back/src/infrastructure/rest/models/get-product-response';
import { PostOrderRequest } from '../../../back/src/infrastructure/rest/models/post-order-request';
import { PostOrderResponse } from '../../../back/src/infrastructure/rest/models/post-order-response';

interface CommanderData {
  order: PostOrderRequest;
  closingPeriods: GetClosingPeriodResponse[];
  products: GetProductResponse[];
  isLoading: boolean;
  productOrderingStatus: boolean;
}

export default Vue.extend({
  name: 'commande-manuelle',
  middleware: 'auth',
  layout: 'admin',
  components: {
    ContactDetails,
    OrderTypeSelection,
    ProductSelection,
    OrderNote,
  },
  data() {
    return {
      order: { products: [{}] } as PostOrderRequest,
      closingPeriods: [],
      products: [],
      isLoading: false,
      productOrderingStatus: true,
    } as CommanderData;
  },
  async asyncData(ctx: Context): Promise<object> {
    const closingPeriods: GetClosingPeriodResponse[] = await ctx.app.$apiService.getClosingPeriods();
    const products: GetProductResponse[] = await ctx.app.$apiService.getProducts();
    const productOrdering: GetProductOrderingResponse = await ctx.app.$apiService.getProductOrdering();

    return { closingPeriods, products, productOrderingStatus: productOrdering.status === FeatureStatus.ENABLED };
  },
  methods: {
    async validateAndSubmit(): Promise<void> {
      // @ts-ignore
      if (this.$refs.form.validate()) {
        try {
          this.isLoading = true;
          const postOrderResponse: PostOrderResponse = await this.$apiService.postOrder(this.order);
          this.$router.push(`/admin/confirmation-de-commande-manuelle?orderId=${postOrderResponse.id}`);
        } catch (e) {
          this.isLoading = false;
          this.handleError(e as NuxtError);
        }
      }
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
