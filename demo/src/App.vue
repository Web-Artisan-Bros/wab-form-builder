<script setup lang="ts">

</script>

<template>
  <header>
    <navbar>
      <router-link to="/">Home</router-link>
      <router-link to="/bs">Bootstrap</router-link>
    </navbar>
  </header>

  <router-view></router-view>
</template>

<style>
html, body{
  padding: 0;
  margin: 0;
}

navbar{
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background-color: #eee;
  border-bottom: 1px solid #ccc;
}
</style>
