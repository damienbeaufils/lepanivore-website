<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>
      <v-card align="center">
        <v-card-title class="headline">Menu de l'interface d'administration</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-btn color="primary" nuxt to="/admin/commandes">
                Commandes passées
              </v-btn>
            </v-col>
            <v-col cols="12">
              <v-btn color="primary" nuxt to="/admin/commande-manuelle" height="60">
                Passer une commande manuelle (sans restriction de dates)<br />ou une réservation (mise de côté)
              </v-btn>
            </v-col>
            <v-col cols="12">
              <v-btn color="primary" nuxt to="/admin/quantites-commandees">
                Quantités commandées
              </v-btn>
            </v-col>
            <v-col cols="12">
              <v-btn color="primary" nuxt to="/admin/pointage-des-commandes">
                Pointage des commandes (cueillette et réservation)
              </v-btn>
            </v-col>
            <v-col cols="12">
              <v-btn color="primary" nuxt to="/admin/produits">
                Configuration des produits
              </v-btn>
            </v-col>
            <v-col cols="12">
              <v-btn color="primary" nuxt to="/admin/periodes-de-fermeture">
                Configuration des périodes de fermeture
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-switch v-model="productOrderingStatus" :loading="productOrderingStatusSwitchLoading" :label="productOrderingStatusLabel"></v-switch>
          <v-spacer />
        </v-card-actions>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import { Context, NuxtError } from '@nuxt/types';
import Vue from 'vue';
import { FeatureStatus } from '../../../back/src/domain/feature/feature-status';
import { GetProductOrderingResponse } from '../../../back/src/infrastructure/rest/models/get-product-ordering-response';

interface AdminIndexData {
  productOrderingStatus: boolean;
  productOrderingStatusSwitchLoading: boolean;
}

export default Vue.extend({
  name: 'index',
  middleware: 'auth',
  layout: 'admin',
  data() {
    return {
      productOrderingStatus: true,
      productOrderingStatusSwitchLoading: false,
    } as AdminIndexData;
  },
  async asyncData(ctx: Context): Promise<object> {
    const productOrdering: GetProductOrderingResponse = await ctx.app.$apiService.getProductOrdering();

    return { productOrderingStatus: productOrdering.status === FeatureStatus.ENABLED };
  },
  watch: {
    async productOrderingStatus(value: boolean) {
      await this.toggleProductOrdering(value);
    },
  },
  methods: {
    async toggleProductOrdering(value: boolean): Promise<void> {
      try {
        this.productOrderingStatusSwitchLoading = true;
        if (value) {
          await this.$apiService.putProductOrderingEnable();
        } else {
          await this.$apiService.putProductOrderingDisable();
        }
        this.productOrderingStatusSwitchLoading = false;
      } catch (e) {
        this.handleError(e as NuxtError);
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
  computed: {
    productOrderingStatusLabel(): string {
      if (this.productOrderingStatus) {
        return 'État du site : les commandes sont possibles ✔️';
      } else {
        return 'État du site : la commande en ligne est désactivée ❌';
      }
    },
  },
});
</script>
