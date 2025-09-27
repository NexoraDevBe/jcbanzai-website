<script setup lang="ts">
import {useCurrencyConverter} from "~/composables/exchange";

interface Image {
  src: string
  alt?: string
}

interface PropItems {
  image?: Image
  title?: string
  starred?: boolean
  japText?: string
  price?: number
  content?: string
  subContent?: string
}

interface Props {
  card: PropItems
}

const props = defineProps<Props>()
const exPrice = ref<number>(0)
const { convertCurrency, isLoading, error } = useCurrencyConverter()
if (props.card.price) {
  exPrice.value = await convertCurrency(props.card.price)
}
</script>

<template>
<div class="card" :class="{'contains-image': card.image}">
  <div v-if="card.japText" class="style-element">
    <AtomJapaneseText :vertical="true" :size="2" :outline="false">{{ card.japText }}</AtomJapaneseText>
  </div>
  <div v-if="card.image" class="card-img">
    <img :src="card.image.src" :alt="card.image.alt"/>
  </div>
  <h5 v-if="card.title" class="card-title">
    {{ card.title }}<span v-if="card.starred" class="color-accent">*</span>
  </h5>
  <div v-if="card.content || card.price || card.subContent"  class="card-content">
    <p v-if="card.content" class="main-content">
      {{ card.content }}
    </p>
    <p v-if="card.subContent" class="sub-content color-accent">
      {{ card.subContent }}
    </p>
    <p v-if="card.price" class="price">
      <span>€</span>{{ card.price.toFixed(2).replace('.', ',') }}
    </p>
    <p v-if="card.price && exPrice" class="ex-price">
      ¥ {{ exPrice }}
    </p>
  </div>
</div>
</template>

<style scoped lang="scss">
.card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  width: 9rem;
  padding: 1rem;
  aspect-ratio: 5/6;
  border-radius: .8rem;
  background-color: var(--secondary-20);
  backdrop-filter: blur(5px);
  overflow: hidden;
  z-index: 1;

  &.contains-image {
    width: 12rem;
    height: 100%;
    aspect-ratio: 0;
    justify-content: flex-start;
    gap: 1rem;
  }

  .style-element {
    position: absolute;
    top: 0;
    left: 0;
    padding: .5rem;
    z-index: -1;
  }

  .card-img {
    height: 8rem;

    img {
      height: 100%;
      aspect-ratio: 1;
      object-fit: cover;
      border-radius: 50%;
    }
  }

  .card-title {
    margin: 0;
    font-size: 1.5rem;
    text-align: center;
    white-space: pre-line;
  }

  .card-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .main-content, .sub-content, .price, .ex-price {
      margin: 0;
      text-align: center;
    }

    .main-content, .price {
      font-size: 1.8rem;
      font-weight: 700;
    }

    .price {
      span {
        color: transparent;
        -webkit-text-stroke-width: 1.5px;
        -webkit-text-stroke-color: var(--accent);
      }
    }

    .sub-content {
      font-size: 1rem;
      font-weight: 700;
      white-space: pre-line;
    }

    .ex-price {
      position: relative;
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--secondary-50);

      &::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 120%;
        height: 2px;
        background-color: var(--accent-80);
        transform: translate(-50%, -50%);
        pointer-events: none;
      }
    }
  }
}

@media screen and (width >= 32rem) {
  .card {
    width: 10rem;
  }
}

@media screen and (width >= 40rem) {
  .card {
    width: 12rem;

    &.contains-image {
      width: 14rem;
    }

    .style-element {
      padding: .5rem;
    }

    .card-title {
      font-size: 1.8rem;
    }

    .card-content {
      .main-content, .price {
        font-size: 2rem;
      }

      .sub-content {
        font-size: 1.25rem;
      }

      .ex-price {
        font-size: 1.25rem;
      }
    }
  }
}

@media screen and (width >= 48rem) {
  .card {
    width: 15rem;

    &.contains-image {
      width: 15rem;
    }

    .style-element {
      padding: 1rem;
    }

    .card-title {
      font-size: 2rem;
    }

    .card-content {
      .main-content, .price {
        font-size: 2.25rem;
      }

      .sub-content {
        font-size: 1.25rem;
      }

      .ex-price {
        font-size: 1.5rem;
      }
    }
  }
}

@media screen and (width >= 64rem) {
  .card {
    width: 12rem;

    .style-element {
      padding: .5rem;
    }

    .card-title {
      font-size: 1.8rem;
    }

    .card-content {
      .main-content, .price {
        font-size: 2rem;
      }

      .sub-content {
        font-size: 1.25rem;
      }

      .ex-price {
        font-size: 1.25rem;
      }
    }
  }
}

@media screen and (width >= 80rem) {
  .card {
    width: 15rem;

    .style-element {
      padding: 1rem;
    }

    .card-title {
      font-size: 2rem;
    }

    .card-content {
      .main-content, .price {
        font-size: 2.25rem;
      }

      .sub-content {
        font-size: 1.25rem;
      }

      .ex-price {
        font-size: 1.5rem;
      }
    }
  }
}
</style>