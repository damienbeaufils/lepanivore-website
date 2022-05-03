<template>
  <v-card>
    <v-card-title>
      Produits
      <v-spacer></v-spacer>
      <v-text-field v-model="searchedValue" append-icon="mdi-magnify" label="Rechercher un produit" single-line hide-details></v-text-field>
      <v-spacer></v-spacer>
      <v-dialog v-model="newProductDialog" max-width="768px">
        <template v-slot:activator="{ on }">
          <v-btn color="primary" dark class="mb-2" v-on="on">Ajouter un nouveau produit</v-btn>
        </template>
        <v-card>
          <v-card-title>
            <span class="headline">Nouveau produit</span>
          </v-card-title>

          <v-card-text>
            <v-container>
              <v-form ref="newProductForm">
                <v-row>
                  <v-col cols="12">
                    <v-text-field v-model="newProduct.name" label="Nom" required :rules="[(v) => !!v || 'Le nom est requis']"></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      v-model="newProduct.description"
                      label="Description"
                      required
                      :rules="[(v) => !!v || 'La description est requise']"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      v-model="newProduct.price"
                      label="Prix"
                      min="0"
                      step=".01"
                      type="number"
                      required
                      :rules="[(v) => !!v || 'Le prix est requis', (v) => v > 0 || 'Le prix doit être positif']"
                      append-icon="mdi-currency-usd"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-form>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="closeNewProductDialog">Annuler</v-btn>
            <v-btn color="blue darken-1" text @click="saveProduct">Ajouter</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card-title>

    <v-data-table :headers="headers" :items="products" :search="searchedValue" sort-by="id" class="elevation-1">
      <template v-slot:item.price="{ item }"> {{ item.price.toFixed(2) }} $ </template>

      <template v-slot:item.actions="{ item }">
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-icon v-on="on" class="mr-2" @click="openEditProductDialog(item)">
              mdi-pencil
            </v-icon>
          </template>
          <span>Modifier un produit</span>
        </v-tooltip>
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-icon v-on="on" @click="deleteProduct(item)">
              mdi-package-down
            </v-icon>
          </template>
          <span>Archiver un produit</span>
        </v-tooltip>
      </template>
    </v-data-table>

    <v-dialog v-model="editProductDialog" max-width="768px">
      <v-card>
        <v-card-title>
          <span class="headline">Modification du produit</span>
        </v-card-title>
        <v-spacer />
        <v-card-subtitle>
          <span class="subtitle-1">
            Pour une raison de cohérence des données avec les commandes déjà passées, il n'est pas possible de modifier le nom ou le prix d'un
            produit. Seule la description est modifiable.<br />Pour modifier le nom ou le prix, il est nécessaire d'ajouter un nouveau produit et
            d'archiver l'ancien.
          </span>
        </v-card-subtitle>

        <v-card-text>
          <v-container>
            <v-form ref="editProductForm">
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="editedProduct.description"
                    label="Description"
                    required
                    :rules="[(v) => !!v || 'La description est requise']"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-form>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeEditProductDialog">Annuler</v-btn>
          <v-btn color="blue darken-1" text @click="updateProduct">Confirmer la modification</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script lang="ts">
import { Context, NuxtError } from '@nuxt/types';
import Vue from 'vue';
import { ProductId } from '../../../back/src/domain/type-aliases';
import { GetProductResponse } from '../../../back/src/infrastructure/rest/models/get-product-response';
import { PostProductRequest } from '../../../back/src/infrastructure/rest/models/post-product-request';
import { PutProductRequest } from '../../../back/src/infrastructure/rest/models/put-product-request';

interface ProduitsData {
  editProductDialog: boolean;
  newProductDialog: boolean;
  searchedValue: string;
  headers: Array<{ text: string; value: string }>;
  products: GetProductResponse[];
  editedProduct: PutProductRequest;
  editedProductId: ProductId;
  newProduct: PostProductRequest;
}

export default Vue.extend({
  name: 'commandes',
  middleware: 'auth',
  layout: 'admin',
  data() {
    return {
      editProductDialog: false,
      newProductDialog: false,
      searchedValue: '',
      headers: [
        { text: '#', value: 'id' },
        { text: 'Nom', value: 'name' },
        { text: 'Description', value: 'description' },
        { text: 'Prix unitaire', value: 'price' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
      products: [],
      editedProduct: {} as PutProductRequest,
      editedProductId: -1,
      newProduct: {} as PostProductRequest,
    } as ProduitsData;
  },
  async asyncData(ctx: Context): Promise<object> {
    const products: GetProductResponse[] = await ctx.app.$apiService.getProducts();

    return { products };
  },
  watch: {
    editProductDialog(value: boolean) {
      value || this.closeEditProductDialog();
    },
    newProductDialog(value: boolean) {
      value || this.closeNewProductDialog();
    },
  },
  methods: {
    openEditProductDialog(product: GetProductResponse): void {
      const productToEdit: PutProductRequest = {} as PutProductRequest;
      productToEdit.description = product.description;

      this.editedProduct = Object.assign({}, productToEdit);
      this.editedProductId = product.id;
      this.editProductDialog = true;
    },

    closeEditProductDialog(): void {
      this.editProductDialog = false;
      setTimeout(() => {
        this.editedProduct = Object.assign({}, {} as PutProductRequest);
        this.editedProductId = -1;
      }, 300);
    },

    closeNewProductDialog(): void {
      this.newProductDialog = false;
      setTimeout(() => {
        this.newProduct = Object.assign({}, {} as PostProductRequest);
      }, 300);
    },

    async saveProduct(): Promise<void> {
      if (this.$refs.newProductForm.validate()) {
        try {
          await this.$apiService.postProduct(this.newProduct);
          this.products = await this.$apiService.getProducts();
          this.closeNewProductDialog();
        } catch (e) {
          this.handleError(e as NuxtError);
        }
      }
    },

    async updateProduct(): Promise<void> {
      if (this.$refs.editProductForm.validate()) {
        try {
          await this.$apiService.putProduct(this.editedProductId, this.editedProduct);
          this.products = await this.$apiService.getProducts();
          this.closeEditProductDialog();
        } catch (e) {
          this.handleError(e as NuxtError);
        }
      }
    },

    async deleteProduct(product: GetProductResponse): Promise<void> {
      if (confirm(`Vous allez archiver le produit #${product.id}.\nÊtes-vous certain de vouloir archiver ce produit ?`)) {
        try {
          await this.$apiService.deleteProduct(product.id);
          this.products = await this.$apiService.getProducts();
        } catch (e) {
          this.handleError(e as NuxtError);
        }
      }
    },

    handleError(e: NuxtError): void {
      const message: string =
        e.statusCode === 401
          ? 'Votre session a expiré. Merci de vous reconnecter.'
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
