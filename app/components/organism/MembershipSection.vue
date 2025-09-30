<script setup lang="ts">
interface Card {
  japText: string
  title: string
  starred?: boolean
  content?: string
  subContent?: string
  price?: number
}

interface MembershipGroup {
  title: string
  ageGroup: string
  cards: Card[]
}

interface Props {
  groups: MembershipGroup[]
}

const props = defineProps<Props>()

const shouldShowTitle = (index: number) => {
  return index === 0 || props.groups[index]?.title !== props.groups[index - 1]?.title
}
</script>

<template>
  <section class="lidgeld">
    <template v-for="(group, index) in groups" :key="index">
      <h3 v-if="shouldShowTitle(index)">{{ group.title }}</h3>
      <h4>{{ group.ageGroup }}</h4>
      <MoleculeCardList :cards="group.cards"/>
    </template>
    <div class="lidgeld-info">
      <p>
        Het lidgeld bevat de aansluiting bij de club inclusief verzekering en vergunning en is ondeelbaar. Met het betalen van het lidgeld verklaart men zich akkoord met de privacy verklaring en het intern reglement van de club.
      </p>
      <p>
        <span>*</span> Leden van het gezin = aantal leden van hetzelfde gezin (gedomicilieerd op hetzelfde adres dat is ingeschreven in onze judoclub)
      </p>
      <p>
        Sociaal tarief-doelgroep meer info <a href="mailto:secretaris@judoclubbanzai.be" >secretaris@judoclubbanzai.be</a>
      </p>
      <ul>
        <li>
          Personen in begeleiding van het OCMW
        </li>
        <li>
          Personen / jongeren die verblijven in één van de sociale partnerorganisaties
          <ul>
            <li>
              in Nazareth: Zonnehoeve|Living+, MFC Wagenschot, vzw Jeugdzorg Liaan of CKG 't Kinderkasteeltje
            </li>
            <li>
              in Gavere: vzw De Bolster
            </li>
          </ul>
        </li>
        <li>
          Betaling lidgeld, kimono en activiteiten kan met vrijetijdscheques voor de inwoners van de gemeente Nazareth
        </li>
        <li>
          extra korting met UiTPAS* Leie Schelde met kansentarief (geldig voor gedomicilieerden van Deinze, De Pinte, Gavere, Nazareth, Sint-Martens-Latem en Zulte)
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped lang="scss">
.lidgeld {
  h3, h4 {
    margin: 0;
    text-align: center;
  }
}

.lidgeld-info {
  max-width: 70rem;
  margin: 0 auto;

  span {
    color: var(--accent);
  }
}
</style>