<template>
  <div id="app">
    <app-main-layout>
      <router-view/>
    </app-main-layout>
  </div>
</template>

<script>
import AppMainLayout from "@/layouts/AppMainLayout";
export default {
  name: 'App',
  components: {AppMainLayout},
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

body {
  margin: 0;
}
</style>
