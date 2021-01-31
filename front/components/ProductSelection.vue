<template>
  <v-card>
    <v-card-title>
      Sélection de produits
    </v-card-title>
    <v-card-subtitle align="start">
      Tous nos pains sont au levain naturel à 100%, sans aucun ajout d'additif ou de levure, et sont faits exclusivement à partir de farines
      biologiques du Québec.
      <nuxt-link to="/produits">Plus d'informations ici.</nuxt-link>
    </v-card-subtitle>
    <v-container>
      <v-sheet v-for="(product, index) in value.products" v-bind:key="product.id" v-bind:index="index">
        <v-row align="center" justify="center">
          <v-col cols="9" md="10">
            <ProductSelectionItem :available-products="availableProductsOrderedAlphabetically" :value="product"></ProductSelectionItem>
          </v-col>
          <v-col cols="3" md="1">
            <v-tooltip bottom v-if="index > 0">
              <template v-slot:activator="{ on }">
                <v-btn v-on="on" rounded :large="$vuetify.breakpoint.mdAndUp" @click="removeProduct(product)" color="secondary" dark>
                  <v-icon :large="$vuetify.breakpoint.mdAndUp" dark>mdi-delete</v-icon>
                </v-btn>
              </template>
              <span>Supprimer le produit</span>
            </v-tooltip>
          </v-col>
        </v-row>
      </v-sheet>
      <v-row>
        <v-col cols="12">
          <v-btn color="success" @click="addProduct">Ajouter un nouveau produit</v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script lang="ts">
import Vue, { PropOptions } from 'vue';
import ProductSelectionItem from '~/components/ProductSelectionItem.vue';
import { ProductIdWithQuantity } from '../../back/src/domain/product/product-with-quantity';
import { GetProductResponse } from '../../back/src/infrastructure/rest/models/get-product-response';
import { PostOrderRequest } from '../../back/src/infrastructure/rest/models/post-order-request';
import { PutOrderRequest } from '../../back/src/infrastructure/rest/models/put-order-request';

export default Vue.extend({
  name: 'ProductSelection',
  props: {
    value: { required: true } as PropOptions<PostOrderRequest | PutOrderRequest>,
    availableProducts: { required: true } as PropOptions<GetProductResponse[]>,
  },
  components: {
    ProductSelectionItem,
  },
  methods: {
    addProduct(): void {
      this.value.products.push({} as ProductIdWithQuantity);
    },
    removeProduct(product: ProductIdWithQuantity): void {
      const index: number = this.value.products.indexOf(product);
      if (index > -1) {
        this.value.products.splice(index, 1);
      }
    },
  },
  computed: {
    availableProductsOrderedAlphabetically(): GetProductResponse[] {
      return this.availableProducts.sort((productA: GetProductResponse, productB: GetProductResponse): number =>
        productA.name.localeCompare(productB.name)
      );
    },
  },
});
</script>
