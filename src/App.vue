<template>
  <div id="app">
    <router-view/>
    
  </div>
</template>

<script>
export default {
  name: 'App',
  components:
  {
  }
}
</script>

<style>
#app {
  margin-top: auto;
    overflow: hidden;
    height: 100%;
    width: 100%;
    position: absolute;
}
body{
  margin: 0px;
}
</style>
