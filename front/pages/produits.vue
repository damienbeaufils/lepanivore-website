<template>
  <v-layout class="products" column justify-center align-center>
    <v-flex xs12 sm8 md6>
      <v-row>
        <v-col cols="12" sm="6" md="8">
          <h1>Nos pains et leurs jours de production</h1>
          <h4>Tous nos pains sont au levain naturel à 100%, sans aucun ajout d'additif ou de levure, et sont faits
            exclusivement à partir de farines biologiques du Québec.</h4>
        </v-col>

        <v-col cols="12" sm="6" md="4">
          <v-carousel
            cycle
            height="200"
            interval="3000"
            hide-delimiters
            :show-arrows="false"
          >
            <v-carousel-item
              v-for="(item,i) in productPictures"
              :key="i"
              :src="item.src"
              :alt="item.alt"
              contain
            ></v-carousel-item>
          </v-carousel>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" sm="6" md="4">
          <h4><u>Tous les jours :</u></h4>
          <ul>
            <li>La Baguette au levain : 3.75 $</li>
            <li>La Baguette au levain enrobée au sésame : 4.20 $</li>
            <li>L'Exquis <small>(farine de blé tamisée, farine d'épeautre, farine de khorasan, graines de tournesol dedans et dessus)</small> : 7.75 $</li>
            <li>Le Moelleux <small>(farine blanche, farine de blé tamisée, lait, huile de canola)</small> : 6.55 $</li>
            <li>Le Seigle <small>(farine de blé tamisée, farine de seigle)</small> : 6.30 $</li>
            <li>La Miche Blanche <small>(farine blanche)</small> : 5.05 $</li>
            <li>La Miche Blanche Double <small>(farine blanche)</small> : 8.90 $</li>
          </ul>
        </v-col>

        <v-col cols="12" sm="6" md="4">
          <h4><u>Mardi :</u></h4>
          <ul>
            <li>L'Avoine <small>(farine de blé tamisée, farine d'avoine)</small> : 6.35 $</li>
            <li>Le Multigrains <small>(farine de blé tamisée, flocons d'avoine, graines de tournesol rôties, graines de lin, graines de sésame, graines de citrouilles
            vertes)</small> : 7.80 $</li>
          </ul>

          <h4><u>Mercredi :</u></h4>
          <ul>
            <li>Le Khorasan <small>(farine de blé tamisée, farine de khorasan)</small> : 6.35 $</li>
            <li>Le Datte choco <small>(farine de blé tamisée, dattes séchées, pépites de chocolat)</small> : 7.70 $</li>
          </ul>

          <h4><u>Jeudi :</u></h4>
          <p>
            <i>Les Pains au choix du boulanger!</i>
            <br />
            Le plus souvent les pains sont choisis dans la liste des pains sur commande.
          </p>
        </v-col>

        <v-col cols="12" sm="6" md="4">
          <h4><u>Vendredi :</u></h4>
          <ul>
            <li>Le Jeremy <small>(farine de blé tamisée, banane fraiche, pépites de chocolat)</small> : 7.80 $</li>
            <li>Le Noix <small>(farine de blé tamisée, noix de Grenoble)</small> : 7.45 $</li>
          </ul>

          <h4><u>Samedi :</u></h4>
          <ul>
            <li>Le Datte Noix <small>(farine de blé tamisée, dattes séchées, noix de Grenoble)</small> : 8.50 $</li>
            <li>Le Raisin Choco <small>(farine de blé tamisée, raisins sultana, pépites de chocolat)</small> : 7.70 $</li>
            <li>L'Épeautre <small>(farine de blé tamisée, farine d'épeautre)</small> : 6.35 $</li>
            <li>L'Intégral <small>(farine de blé intégrale)</small> : 6.25 $</li>
          </ul>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" sm="6" md="4">
          <h4><u>Sur commande :</u></h4>
          <ul>
            <li>L'Enrobé Sésame<small>(farine de blé tamisée, croûte de graines de sésame)</small> : 7.70 $</li>
            <li>La Miche Rustique, cuite sur pierre naturelle <small>(farine de blé tamisée)</small> : 6.00 $</li>
            <li>Le Mariko <small>(farine de blé tamisée, écorces d'orange bio confites)</small> : 8.95 $</li>
            <li>Le Mariko Choco <small>(farine de blé tamisée, écorces d'orange bio confites et pépites de chocolat)</small> : 9.60 $</li>
            <li>Le Canneberge <small>(farine de blé tamisée, canneberges séchées)</small> : 7.40 $</li>
            <li>Le Raisin <small>(farine de blé tamisée, raisins sultana)</small> : 7.40 $</li>
            <li>Le Datte <small>(farine de blé tamisée, dattes séchées)</small> : 7.45 $</li>
            <li>Le Pois Chiche <small>(farine de blé tamisée, farine de pois chiche)</small> : 7.85 $</li>
            <li>Le Quinoa <small>(farine de blé tamisée, farine de quinoa)</small> : 8.05 $</li>
            <li>Le Sarrasin <small>(farine de blé tamisée, farine de sarrasin)</small> : 7.70 $</li>
            <li>Le Maïs <small>(farine blanche, farine de maïs entière)</small> : 6.60 $</li>
            <li>Le Tordu, pain torsadé cuit sur pierre naturelle <small>(farine blanche)</small> : 5.40 $</li>
            <li>Le Campagne, cuit sur pierre naturelle <small>(farine de blé tamisée, farine de seigle)</small> : 7.30 $</li>
          </ul>
          <i>Pour une commande des pains suivants, s'ils le sont un autre jour que leur jour de production régulier ou le
            jeudi, alors il faut en commander un mimimum de deux : l'Avoine, le Khorasan, l'Intégral, l'Épeautre, le Pois Chiche, le Quinoa, le Maïs, le Sarrasin
            et La Miche Rustique.</i>
        </v-col>

        <v-col cols="12" sm="6" md="4">
          <h4><u>Les à côtés sur commande :</u></h4>
          <ul>
            <li>Une pâte à pizza : 4.35 $</li>
            <li>Deux pâtes à pizza : 7.60 $</li>
          </ul>
          <ul>
            <li>2 grands cercles de pâte feuilletée : 20.00 $</li>
            <li>4 grands cercles de pâte feuilletée : 32.00 $</li>
            <li>8 grands cercles de pâte feuilletée : 56.00 $</li>
          </ul>
          <i>Pâte à pizza comme pâte feuilletée peuvent se congeler car elles sont faites fraiches du jour.<br/>Les pâtes
            feuilletées doivent être commandées au plus tard le mardi soir à 19:00.</i>
          <ul>
            <li>La douzaine de Gougères <small>(pâte à choux et cheddar vieilli)</small> : 13.50 $</li>
          </ul>
          <ul>
            <li>
              La Fougasse <small>(pâte à pain à la levure et différentes garnitures)</small> : 6.25 $
              <ul>
                <li>olives noires et origan</li>
                <li>cheddar vieilli et origan</li>
              </ul>
            </li>
          </ul>
        </v-col>
      </v-row>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import Vue from 'vue';

interface ProduitsData {
  productPictures: Array<{ src: string; alt: string }>;
}

export default Vue.extend({
  name: 'produits',
  data() {
    return {
      productPictures: [
        { src: '/img/produits/fournee.png', alt: 'Fournée' },
        { src: '/img/produits/moelleux.png', alt: 'Moelleux' },
        { src: '/img/produits/ble_integral.png', alt: 'Blé intégral' },
        { src: '/img/produits/exquis.png', alt: 'Exquis' },
        { src: '/img/produits/brioches.png', alt: 'Brioches' },
        { src: '/img/produits/fougasses.png', alt: 'Fougasses' },
      ],
    } as ProduitsData;
  },
});
</script>

<style scoped lang="scss">
.products {
  color: #683c11;

  h1 {
    margin-bottom: 10px;
  }
}
</style>
