<script setup lang="ts">
interface Props {
  title: string
  hideAdminActions?: boolean
}

defineProps<Props>()
</script>

<template>
  <div class="page-header">
    <div class="button-container left">
      <slot name="left-actions" />
    </div>
    <h1>{{ title }}</h1>
    <div class="button-container right" :class="{ hidden: hideAdminActions }">
      <slot name="right-actions" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.page-header {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  width: 100%;
  margin: 1rem 0;

  h1 {
    order: 1;
    font-size: 3rem;
    margin: 0;
    white-space: nowrap;
    text-align: left;
    width: 100%;
  }

  .button-container {
    width: 100%;
    display: flex;
    flex-direction: row-reverse;
    gap: 1rem;

    &.left {
      justify-content: center;
      order: 3;
    }

    &.right {
      justify-content: center;
      order: 2;
    }

    &.hidden {
      visibility: hidden;
    }
  }
}



@media screen and (width >= 64rem) {
  .page-header {
    flex-direction: row;
    justify-content: space-between;
    margin: 5rem 0 1rem;

    h1 {
      order: 2;
      text-align: center;
    }

    .button-container {
      flex-direction: row;

      &.left {
        justify-content: flex-start;
        order: 1;
      }

      &.right {
        justify-content: flex-end;
        order: 3;
      }

      &.hidden {
        visibility: hidden;
      }
    }
  }
}
</style>