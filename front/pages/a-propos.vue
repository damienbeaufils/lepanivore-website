<template>
  <v-layout class="about" column justify-center align-center>
    <v-container>
      <h2>À Propos</h2>
      <h3>Origine</h3>
      <p>
        La Boulangerie Artisanale Le Panivore est née de la passion d'un amoureux du bon pain au levain fait maison.
        L'objectif du Panivore est d'offrir à ses clients des pains confectionnés exclusivement à partir de farines biologiques,
        d'eau filtrée, de levain naturel biologique et de sel de mer.<br>
        Pour le plaisir des papilles des gâteries sont aussi proposées.
      </p>
    </v-container>

    <v-container>
      <h3>Le pain qui vient à vous !</h3>
      Chaque jeudi soir, Le Panivore livre ses produits gratuitement, à domicile, dans le secteur de Petite Patrie à Montréal. Le périmètre est délimité par les rues :
      <ul>
        <li>Jean-Talon au Nord</li>
        <li>Des Carrières au Sud</li>
        <li>Des Érables à l'Est</li>
        <li>Christophe-Colomb à l'Ouest</li>
      </ul>
    </v-container>

    <v-container>
      <h3>Les bienfaits du pain au levain par rapport au pain à la levure</h3>
      <ul>
        <li>Il est meilleur au goût car plus aromatique de par la lenteur et le type de fermentation,</li>
        <li>Son indice glycémique est moins élevé. Cela favorise une meilleure régularisation du taux de sucre dans le sang et de la sensation de faim,</li>
        <li>Il est plus digeste du fait de sa fermentation lactique au lieu d'une fermentation alcoolique pour le pain à la levure,</li>
        <li>Il se conserve beaucoup plus longtemps, jusqu'à une semaine,</li>
        <li>Lorsque le pain est un pain complet, l'acide phytique, qui peut être une cause de déminéralisation et qui est contenu dans l'enveloppe du grain de blé, va être mieux dégradé lors d'une fermentation lente comme c'est le cas pour le pain au levain,</li>
        <li>La fermentation lactique mise en oeuvre pour la fabrication du pain au levain neutralise la toxicité du gluten, surtout pour les pains aux grains anciens comme le kamut, l'épeautre et le seigle.</li>
      </ul>
    </v-container>
  </v-layout>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'a-propos',
});
</script>

<style lang="scss">
.about {
  color: #683c11;

  h2 {
    font-size: 30px;
    font-weight: 400;
    margin-bottom: 10px;
  }

  h3 {
    font-size: 24px;
    font-weight: 400;
  }
}
</style>
