<template>
  <v-layout>
    <v-flex class="text-center">
      <h1>Commander pour une cueillette ou livraison</h1>
      <v-form ref="form" @submit.prevent="validateAndSubmit" v-if="productOrderingStatus">
        <v-container>
          <ContactDetails :value="order" class="mb-5"></ContactDetails>
          <OrderTypeSelection :value="order" :closing-periods="closingPeriods" class="mb-5"></OrderTypeSelection>
          <ProductSelection :value="order" :available-products="products" class="mb-5"></ProductSelection>
          <OrderNote :value="order" class="mb-5"></OrderNote>

          <v-alert type="warning" v-if="hasValidationError"
            >Les données entrées sont invalides. Si le problème persiste,
            <nuxt-link to="/contact">contactez-nous</nuxt-link>.
          </v-alert>
          <v-alert type="error" v-if="hasUnknownError"
            >Une erreur s'est produite, veuillez nous excuser ! Si le problème persiste,
            <nuxt-link to="/contact">contactez-nous</nuxt-link>.
          </v-alert>
          <v-btn :loading="isLoading" color="primary" type="submit" x-large>
            Valider la commande
          </v-btn>
          <div class="mt-2">Après avoir validé votre commande, nous vous recontacterons pour vous confirmer sa prise en compte.</div>
        </v-container>
      </v-form>
      <div v-else>
        <v-alert type="info" class="product-ordering-disabled mt-12">
          La commande en ligne n'est présentement pas possible. Veuillez réessayer plus tard.
          <br/>
          En cas d'urgence, n'hésitez pas à <nuxt-link to="/contact">nous contacter</nuxt-link>.
        </v-alert>
      </div>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import { Context } from '@nuxt/types';
import Vue from 'vue';
import ContactDetails from '~/components/ContactDetails.vue';
import OrderNote from '~/components/OrderNote.vue';
import OrderTypeSelection from '~/components/OrderTypeSelection.vue';
import ProductSelection from '~/components/ProductSelection.vue';
import { FeatureStatus } from '../../back/src/domain/feature/feature-status';
import { GetClosingPeriodResponse } from '../../back/src/infrastructure/rest/models/get-closing-period-response';
import { GetProductOrderingResponse } from '../../back/src/infrastructure/rest/models/get-product-ordering-response';
import { GetProductResponse } from '../../back/src/infrastructure/rest/models/get-product-response';
import { PostOrderRequest } from '../../back/src/infrastructure/rest/models/post-order-request';
import { PostOrderResponse } from '../../back/src/infrastructure/rest/models/post-order-response';

interface CommanderData {
  order: PostOrderRequest;
  closingPeriods: GetClosingPeriodResponse[];
  products: GetProductResponse[];
  isLoading: boolean;
  hasValidationError: boolean;
  hasUnknownError: boolean;
  productOrderingStatus: boolean;
}

export default Vue.extend({
  name: 'commander',
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
      hasValidationError: false,
      hasUnknownError: false,
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
          this.resetErrors();
          const postOrderResponse: PostOrderResponse = await this.$apiService.postOrder(this.order);
          this.$router.push(`/confirmation-de-commande?orderId=${postOrderResponse.id}`);
        } catch (e) {
          this.isLoading = false;
          if (e.statusCode === 400) {
            this.hasValidationError = true;
          } else {
            this.hasUnknownError = true;
          }
        }
      }
    },
    resetErrors(): void {
      this.hasValidationError = false;
      this.hasUnknownError = false;
    },
  },
});
</script>

<style scoped lang="scss"></style>
