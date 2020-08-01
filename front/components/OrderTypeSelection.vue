<template>
  <v-card>
    <v-card-title>
      Livraison ou cueillette ?
    </v-card-title>
    <v-container>
      <v-row>
        <v-col cols="12" sm="6" md="4">
          <v-select
            v-model="value.type"
            :rules="[(v) => !!v || 'Le type de commande est requis']"
            :items="orderTypeItems"
            label="Type de commande"
            required
          ></v-select>
          <p class="text-left caption" v-if="isDeliveryOrderTypeSelected">
            Livraison à domicile le jeudi soir. Service gratuit pour la Petite-Patrie (Jean Talon - Des Carrières - Des Érables - Christophe-Colomb).
            <br />Pour une livraison en dehors de cette zone,
            <a href="https://www.lepanivore.com/Home/Contact" target="_blank">veuillez nous contacter</a>.
          </p>
          <p class="text-left caption" v-if="isReservationOrderTypeSelected">
            Dans le cas d'une réservation, la date du jour est utilisée en tant que date de réservation.
          </p>
        </v-col>
        <v-col cols="12" sm="6" md="8" v-if="isPickUpOrderTypeSelected">
          <v-menu v-model="showPickUpDatePicker" :nudge-right="40" transition="scale-transition" offset-y min-width="290px">
            <template v-slot:activator="{ on }">
              <v-text-field
                v-model="value.pickUpDate"
                label="Date de cueillette"
                prepend-icon="mdi-calendar"
                readonly
                v-on="on"
                required
                :rules="[(v) => !!v || 'La date de cueillette est requise']"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="value.pickUpDate"
              @input="showPickUpDatePicker = false"
              :min="pickUpDateMin"
              :allowed-dates="pickUpAllowedDates"
              locale="fr-ca"
            ></v-date-picker>
          </v-menu>
        </v-col>
        <v-col cols="12" sm="6" md="8" v-if="isDeliveryOrderTypeSelected">
          <v-menu v-model="showDeliveryDatePicker" :nudge-right="40" transition="scale-transition" offset-y min-width="290px">
            <template v-slot:activator="{ on }">
              <v-text-field
                v-model="value.deliveryDate"
                label="Date de livraison"
                prepend-icon="mdi-calendar"
                readonly
                v-on="on"
                required
                :rules="[(v) => !!v || 'La date de livraison est requise']"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="value.deliveryDate"
              @input="showDeliveryDatePicker = false"
              :min="deliveryDateMin"
              :allowed-dates="deliveryAllowedDates"
              locale="fr-ca"
            ></v-date-picker>
          </v-menu>
          <v-text-field
            v-model="value.deliveryAddress"
            :rules="[(v) => !!v || `L'adresse de livraison est requise`]"
            label="Votre adresse de livraison"
            required
          ></v-text-field>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script lang="ts">
import Vue, { PropOptions } from 'vue';
import { Day, NUMBER_OF_DAYS_IN_A_WEEK } from '../../back/src/domain/date.constants';
import { MAXIMUM_HOUR_FOR_DELIVERY_SAME_WEEK } from '../../back/src/domain/order/order-delivery-constraints';
import { AVAILABLE_DAYS_FOR_A_PICK_UP_ORDER, AvailableDayForAPickUpOrder, CLOSING_DAYS } from '../../back/src/domain/order/order-pick-up-constraints';
import { getOrderTypeLabel, OrderType } from '../../back/src/domain/order/order-type';
import { GetClosingPeriodResponse } from '../../back/src/infrastructure/rest/models/get-closing-period-response';
import { PostOrderRequest } from '../../back/src/infrastructure/rest/models/post-order-request';
import { PutOrderRequest } from '../../back/src/infrastructure/rest/models/put-order-request';

interface OrderTypeSelectionData {
  showPickUpDatePicker: boolean;
  showDeliveryDatePicker: boolean;
}

export default Vue.extend({
  name: 'OrderTypeSelection',
  props: {
    value: { required: true } as PropOptions<PostOrderRequest | PutOrderRequest>,
    closingPeriods: { required: true } as PropOptions<GetClosingPeriodResponse[]>,
  },
  data() {
    return {
      showPickUpDatePicker: false,
      showDeliveryDatePicker: false,
    } as OrderTypeSelectionData;
  },
  methods: {
    pickUpAllowedDates(dateAsIsoString: string): boolean {
      const date: Date = this.toDate(dateAsIsoString);
      return this.isStoreOpen(date);
    },
    deliveryAllowedDates(dateAsIsoString: string): boolean {
      const date: Date = this.toDate(dateAsIsoString);
      return this.isStoreOpen(date) && date.getDay() === Day.THURSDAY;
    },
    toDate(dateAsIsoString: string): Date {
      if (dateAsIsoString.length > 10) {
        return new Date(dateAsIsoString);
      } else {
        return new Date(`${dateAsIsoString}T12:00:00Z`);
      }
    },
    isStoreOpen(date: Date): boolean {
      if (CLOSING_DAYS.includes(date.getDay())) {
        return false;
      }

      for (const closingPeriod of this.closingPeriods) {
        if (date.getTime() >= this.toDate(closingPeriod.startDate).getTime() && date.getTime() <= this.toDate(closingPeriod.endDate).getTime()) {
          return false;
        }
      }

      return true;
    },
    isAddingGivenDaysWillPassedToNextWeek(numberOfDays: number): boolean {
      const now: Date = new Date();
      const futureDate: Date = new Date();
      futureDate.setDate(futureDate.getDate() + numberOfDays);
      return futureDate.getDay() < now.getDay();
    },
  },
  computed: {
    orderTypeItems(): Array<{ value: OrderType; text: string }> {
      const orderTypes:Array<{ value: OrderType; text: string }> = [
        { value: OrderType.DELIVERY, text: getOrderTypeLabel(OrderType.DELIVERY) },
        { value: OrderType.PICK_UP, text: getOrderTypeLabel(OrderType.PICK_UP) }
      ];
      if (this.isInAdmin) {
        orderTypes.push({ value: OrderType.RESERVATION, text: getOrderTypeLabel(OrderType.RESERVATION) })
      }
      return orderTypes;
    },
    isPickUpOrderTypeSelected(): boolean {
      return this.value.type === OrderType.PICK_UP;
    },
    isDeliveryOrderTypeSelected(): boolean {
      return this.value.type === OrderType.DELIVERY;
    },
    isReservationOrderTypeSelected(): boolean {
      return this.value.type === OrderType.RESERVATION;
    },
    pickUpDateMin(): string {
      const now: Date = new Date();

      if (!this.isInAdmin) {
        const currentDay: number = now.getDay();
        const firstAvailableDay: Day = AVAILABLE_DAYS_FOR_A_PICK_UP_ORDER.filter(
          (availableDayForAPickUpOrder: AvailableDayForAPickUpOrder) => availableDayForAPickUpOrder.whenOrderIsPlacedOn === currentDay
        ).map((availableDayForAPickUpOrder: AvailableDayForAPickUpOrder) => availableDayForAPickUpOrder.firstAvailableDay)[0];

        let numberOfDaysBetweenNowAndFirstAvailableDay: number = Math.abs(firstAvailableDay - currentDay);
        if (
          numberOfDaysBetweenNowAndFirstAvailableDay < NUMBER_OF_DAYS_IN_A_WEEK &&
          this.isAddingGivenDaysWillPassedToNextWeek(numberOfDaysBetweenNowAndFirstAvailableDay)
        ) {
          numberOfDaysBetweenNowAndFirstAvailableDay = NUMBER_OF_DAYS_IN_A_WEEK - numberOfDaysBetweenNowAndFirstAvailableDay;
        }
        now.setDate(now.getDate() + numberOfDaysBetweenNowAndFirstAvailableDay);
      }

      return now.toISOString();
    },
    deliveryDateMin(): string {
      const now = new Date();

      if (!this.isInAdmin) {
        const currentDayOfWeek: number = now.getDay();
        if (
          (currentDayOfWeek > Day.TUESDAY && currentDayOfWeek <= Day.THURSDAY) ||
          (currentDayOfWeek === Day.TUESDAY && now.getHours() >= MAXIMUM_HOUR_FOR_DELIVERY_SAME_WEEK)
        ) {
          const numberOfDaysToAddToOverlapNextThursday: number = Day.THURSDAY - currentDayOfWeek + 1;
          now.setDate(now.getDate() + numberOfDaysToAddToOverlapNextThursday);
        }
      }

      return now.toISOString();
    },
    isInAdmin(): boolean {
      return this.$route.path.includes('admin');
    },
  },
});
</script>
