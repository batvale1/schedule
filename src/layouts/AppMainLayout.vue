<template>
  <div class="app-main-layout">
    <header class="app-main-layout__header">
      <app-header/>
    </header>
    <div class="app-main-layout__content">
      <app-side-bar class="app-main-layout__side-bar"/>
      <main class="app-main-layout__main">
        <slot/>
      </main>
    </div>
  </div>
</template>

<script>
import AppHeader from "@/components/shared/AppHeader";
import AppSideBar from "@/components/shared/AppSideBar";

export default {
  components: {
    AppHeader,
    AppSideBar,
  }
}
</script>

<style lang="scss" scoped>
  .app-main-layout {
    background-color: #F8F7FD;
    min-height: 100vh;
    display: flex;
    flex-direction: column;

    &__content {
      display: flex;
      flex-grow: 1;
    }

    &__side-bar {
      flex-grow: 0;
      flex-shrink: 0;
    }

    &__main {
      flex-grow: 1;
    }
  }
</style>