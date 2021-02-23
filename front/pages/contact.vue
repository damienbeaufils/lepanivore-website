<template>
  <v-layout class="contact" column justify-center align-center>
    <v-flex xs12 sm8 md6>
      <h2>Contact</h2>
      <v-row>
        <v-col cols="12" sm="8" md="6">
          <h3>Boulangerie Le Panivore</h3>
          <address>
            1224 rue Bélanger Est<br/>
            Montréal (QC) H2S 1H8<br/>
            <br/>
            Tél. (Laurence) : (514) 647-8635<br/>
            Tél. (Thomas) : (514) 583-2854<br/>
            Courriel : <a href="mailto:info@lepanivore.com">info@lepanivore.com</a>
          </address>
        </v-col>
        
        <v-col cols="12" sm="8" md="6">
          <h3>Semaine de relâche 2021</h3>
          Veuillez prendre note que la boulangerie sera <b>fermée du 28 Février au 8 Mars inclus.</b><br />Nous serons de retour le <b>mardi 9 mars dès 11:00</b>.
        </v-col>
        
        <v-col cols="12" sm="8" md="6">
          <h3>Heures d'ouverture</h3>
          <table>
            <tbody>
            <tr>
              <td>Lundi</td>
              <td>Repos</td>
            </tr>
            <tr>
              <td>Mardi au vendredi</td>
              <td>11:00 à 18:30</td>
            </tr>
            <tr>
              <td>Samedi</td>
              <td>08:00 à 17:00</td>
            </tr>
            <tr>
              <td>Dimanche</td>
              <td>Repos</td>
            </tr>
            </tbody>
          </table>
        </v-col>
      </v-row>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'contact',
});
</script>

<style scoped lang="scss">
.contact {
  color: #683c11;

  h2 {
    margin-bottom: 10px;
  }

  address {
    font-style: normal;
  }

  td {
    padding-right: 10px;
    padding-top: 5px;
  }
}
</style>
