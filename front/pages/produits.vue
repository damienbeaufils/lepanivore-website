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
            <li>La Baguette au levain : 3.30 $</li>
            <li>La Baguette au levain enrobée au sésame : 3.80 $</li>
            <li>L'Exquis <small>(farine de blé tamisée, farine d'épeautre, farine de khorasan, graines de tournesol
              dedans
              et dessus)</small> : 6.70 $
            </li>
            <li>Le Moelleux <small>(farine blanche, farine de blé tamisée, lait, huile de canola)</small> : 5.80 $</li>
            <li>Le Seigle <small>(farine de blé tamisée, farine de seigle)</small> : 5.65 $</li>
            <li>La Miche Blanche <small>(farine blanche)</small> : 4.35 $</li>
            <li>La Miche Blanche Double <small>(farine blanche)</small> : 7.85 $</li>
          </ul>
        </v-col>

        <v-col cols="12" sm="6" md="4">
          <h4><u>Mardi :</u></h4>
          <ul>
            <li>L'Avoine <small>(farine de blé tamisée, farine d'avoine)</small> : 5.70 $</li>
            <li>Le Multigrains <small>(farine de blé tamisée, flocons d'avoine, graines de tournesol rôties, graines de
              lin, graines de sésame, graines de citrouilles vertes)</small> : 6.90 $
            </li>
          </ul>

          <h4><u>Mercredi :</u></h4>
          <ul>
            <li>Le Khorasan <small>(farine de blé tamisée, farine de khorasan)</small> : 5.70 $</li>
            <li>Le Datte choco <small>(farine de blé tamisée, dattes séchées, pépites de chocolat)</small> : 7.00 $</li>
          </ul>

          <h4><u>Jeudi :</u></h4>
          <p>
            <i>Les Pains au choix du boulanger!</i>
            <br/>
            Le plus souvent les pains sont choisis dans la liste des pains sur commande.
          </p>
        </v-col>

        <v-col cols="12" sm="6" md="4">
          <h4><u>Vendredi :</u></h4>
          <ul>
            <li>Le Jeremy <small>(farine de blé tamisée, banane fraiche, pépites de chocolat)</small> : 7.00 $</li>
            <li>Le Noix <small>(farine de blé tamisée, noix de Grenoble)</small> : 6.70 $</li>
          </ul>

          <h4><u>Samedi :</u></h4>
          <ul>
            <li>Le Datte Noix <small>(farine de blé tamisée, dattes séchées, noix de Grenoble)</small> : 7.70 $</li>
            <li>Le Raisin Choco <small>(farine de blé tamisée, raisins sultana, pépites de chocolat)</small> : 7.00 $
            </li>
            <li>L'Épeautre <small>(farine de blé tamisée, farine d'épeautre)</small> : 5.70 $</li>
            <li>L'Intégral <small>(farine de blé intégrale)</small> : 5.65 $</li>
          </ul>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" sm="6" md="4">
          <h4><u>Sur commande :</u></h4>
          <ul>
            <li>L'Enrobé Sésame<small>(farine de blé tamisée, croûte de graines de sésame)</small> : 7.00 $</li>
            <li>La Miche Rustique, cuite sur pierre naturelle <small>(farine de blé tamisée)</small> : 5.20 $</li>
            <li>Le Mariko <small>(farine de blé tamisée, écorces d'orange bio confites)</small> : 7.80 $</li>
            <li>Le Mariko Choco <small>(farine de blé tamisée, écorces d'orange bio confites et pépites de
              chocolat)</small> : 8.45 $
            </li>
            <li>Le Brasseur <small>(farine de blé tamisée, orge malté qui a servi à brasser des bières)</small> : 6.80 $
            </li>
            <li>Le Canneberge <small>(farine de blé tamisée, canneberges séchées)</small> : 6.70 $</li>
            <li>Le Raisin <small>(farine de blé tamisée, raisins sultana)</small> : 6.70 $</li>
            <li>Le Datte <small>(farine de blé tamisée, dattes séchées)</small> : 6.70 $</li>
            <li>Le Pois Chiche <small>(farine de blé tamisée, farine de pois chiche)</small> : 7.00 $</li>
            <li>Le Quinoa <small>(farine de blé tamisée, farine de quinoa)</small> : 7.00 $</li>
            <li>Le Maïs <small>(farine blanche, farine de maïs entière)</small> : 5.90 $</li>
            <li>Le Tordu, pain torsadé cuit sur pierre naturelle <small>(farine blanche)</small> : 4.75 $</li>
          </ul>
          <i>Pour une commande des pains suivants, s'ils le sont un autre jour que leur jour de production régulier ou
            le
            jeudi, alors il faut en commander un mimimum de deux : L'Avoine, Le Khorasan, L'intégral, l'Épeautre, Le
            Pois
            Chiche, Le Quinoa, Le Maïs et La Miche Rustique.</i>
        </v-col>

        <v-col cols="12" sm="6" md="4">
          <h4><u>Les à côtés sur commande :</u></h4>
          <ul>
            <li>Une pâte à pizza : 3.50 $</li>
            <li>Deux pâtes à pizza : 6.00 $</li>
          </ul>
          <ul>
            <li>2 grands cercles de pâte feuilletée : 12.00 $</li>
            <li>4 grands cercles de pâte feuilletée : 20.00 $</li>
          </ul>
          <i>Pâte à pizza comme pâte feuilletée peuvent se congeler car elles sont faites fraiches du jour.<br/>Les pâtes
            feuilletées doivent être commandées au plus tard le mardi soir à 19:00.</i>
          <ul>
            <li>La douzaine de Gougères <small>(pâte à choux et cheddar vieilli)</small> : 12.00 $</li>
          </ul>
          <ul>
            <li>
              La Fougasse <small>(pâte à pain à la levure et différentes garnitures)</small> : 5.45 $
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
  productPictures: Array<{ src: string; alt: string; }>;
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

<style lang="scss">
.products {
  color: #683c11;

  h1 {
    font-size: 36px;
    font-weight: 400;
    margin-bottom: 10px;
  }

  h4 {
    font-size: 18px;
    font-weight: 400;
  }
}
</style>
