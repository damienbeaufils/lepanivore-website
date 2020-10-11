<template>
  <v-card>
    <v-card-title>
      Périodes de fermeture
      <v-spacer></v-spacer>
      <v-text-field
        v-model="searchedValue"
        append-icon="mdi-magnify"
        label="Rechercher une période de fermeture"
        single-line
        hide-details
      ></v-text-field>
      <v-spacer></v-spacer>
      <v-dialog v-model="newClosingPeriodDialog" max-width="768px">
        <template v-slot:activator="{ on }">
          <v-btn color="primary" dark class="mb-2" v-on="on">Ajouter une nouvelle période de fermeture</v-btn>
        </template>
        <v-card>
          <v-card-title>
            <span class="headline">Nouvelle période de fermeture</span>
          </v-card-title>

          <v-card-text>
            <v-container>
              <v-form ref="newClosingPeriodForm">
                <v-row>
                  <v-col cols="12">
                    <v-menu v-model="showStartDatePicker" :nudge-right="40" transition="scale-transition" offset-y min-width="290px">
                      <template v-slot:activator="{ on }">
                        <v-text-field
                          v-model="newClosingPeriod.startDate"
                          label="Date de début de fermeture"
                          prepend-icon="mdi-calendar"
                          readonly
                          v-on="on"
                          required
                          :rules="[(v) => !!v || 'La date de début est requise']"
                        ></v-text-field>
                      </template>
                      <v-date-picker
                        v-model="newClosingPeriod.startDate"
                        @input="showStartDatePicker = false"
                        locale="fr-ca"
                        :min="startDateMin"
                      ></v-date-picker>
                    </v-menu>
                  </v-col>
                  <v-col cols="12">
                    <v-menu v-model="showEndDatePicker" :nudge-right="40" transition="scale-transition" offset-y min-width="290px">
                      <template v-slot:activator="{ on }">
                        <v-text-field
                          v-model="newClosingPeriod.endDate"
                          label="Date de fin de fermeture (incluse)"
                          prepend-icon="mdi-calendar"
                          readonly
                          v-on="on"
                          required
                          :rules="[(v) => !!v || 'La date de fin est requise']"
                        ></v-text-field>
                      </template>
                      <v-date-picker
                        v-model="newClosingPeriod.endDate"
                        @input="showEndDatePicker = false"
                        locale="fr-ca"
                        :min="endDateMin"
                      ></v-date-picker>
                    </v-menu>
                  </v-col>
                </v-row>
              </v-form>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="closeNewClosingPeriodDialog">Annuler</v-btn>
            <v-btn color="blue darken-1" text @click="saveClosingPeriod">Ajouter</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card-title>

    <v-data-table :headers="headers" :items="closingPeriods" :search="searchedValue" sort-by="id" class="elevation-1">
      <template v-slot:item.actions="{ item }">
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-icon v-on="on" @click="deleteClosingPeriod(item)">
              mdi-delete
            </v-icon>
          </template>
          <span>Supprimer une période de fermeture</span>
        </v-tooltip>
      </template>
    </v-data-table>
  </v-card>
</template>

<script lang="ts">
import { Context, NuxtError } from '@nuxt/types';
import Vue from 'vue';
import { GetClosingPeriodResponse } from '../../../back/src/infrastructure/rest/models/get-closing-period-response';
import { PostClosingPeriodRequest } from '../../../back/src/infrastructure/rest/models/post-closing-period-request';

interface PeriodesDeFermetureData {
  newClosingPeriodDialog: boolean;
  searchedValue: string;
  headers: Array<{ text: string; value: string }>;
  closingPeriods: GetClosingPeriodResponse[];
  newClosingPeriod: PostClosingPeriodRequest;
  showStartDatePicker: boolean;
  showEndDatePicker: boolean;
}

export default Vue.extend({
  name: 'periodes-de-fermeture',
  middleware: 'auth',
  layout: 'admin',
  data() {
    return {
      editClosingPeriodDialog: false,
      newClosingPeriodDialog: false,
      searchedValue: '',
      headers: [
        { text: '#', value: 'id' },
        { text: 'Début', value: 'startDate' },
        { text: 'Fin', value: 'endDate' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
      closingPeriods: [],
      newClosingPeriod: {} as PostClosingPeriodRequest,
      showStartDatePicker: false,
      showEndDatePicker: false,
    } as PeriodesDeFermetureData;
  },
  async asyncData(ctx: Context): Promise<object> {
    const closingPeriods: GetClosingPeriodResponse[] = await ctx.app.$apiService.getClosingPeriods();

    return { closingPeriods };
  },
  watch: {
    newClosingPeriodDialog(value: boolean) {
      value || this.closeNewClosingPeriodDialog();
    },
  },
  computed: {
    startDateMin(): string {
      const now:Date = new Date();

      return this.toISOStringWithoutTimeAndIgnoringTimeZone(now);
    },

    endDateMin(): string {
      const date: Date = new Date();
      if (this.newClosingPeriod.startDate) {
        date.setDate(this.toDate(this.newClosingPeriod.startDate).getDate() + 1);
      }

      return this.toISOStringWithoutTimeAndIgnoringTimeZone(date);
    },
  },
  methods: {
    closeNewClosingPeriodDialog(): void {
      this.newClosingPeriodDialog = false;
      setTimeout(() => {
        this.newClosingPeriod = Object.assign({}, {} as PostClosingPeriodRequest);
      }, 300);
    },

    async saveClosingPeriod(): Promise<void> {
      if (this.$refs.newClosingPeriodForm.validate()) {
        try {
          await this.$apiService.postClosingPeriod(this.newClosingPeriod);
          this.closingPeriods = await this.$apiService.getClosingPeriods();
          this.closeNewClosingPeriodDialog();
        } catch (e) {
          this.handleError(e);
        }
      }
    },

    async deleteClosingPeriod(closingPeriod: GetClosingPeriodResponse): Promise<void> {
      if (confirm(`Vous allez supprimer la période de fermeture #${closingPeriod.id}.\nÊtes-vous certain de vouloir supprimer cette période ?`)) {
        try {
          await this.$apiService.deleteClosingPeriod(closingPeriod.id);
          this.closingPeriods = await this.$apiService.getClosingPeriods();
        } catch (e) {
          this.handleError(e);
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

    toDate(dateAsIsoString: string): Date {
      if (dateAsIsoString.length > 10) {
        return new Date(dateAsIsoString);
      } else {
        return new Date(`${dateAsIsoString}T12:00:00Z`);
      }
    },

    toISOStringWithoutTimeAndIgnoringTimeZone(date: Date): string {
      const dateCopy: Date = new Date(date.getTime());
      dateCopy.setHours(12, 0, 0, 0);

      return dateCopy.toISOString().split('T')[0];
    }
  },
});
</script>
