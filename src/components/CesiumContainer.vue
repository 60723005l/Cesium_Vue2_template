<template>
<div class="container">
  <div id="cesiumContainer"></div>
</div>
</template>

<script>
import {Viewer} from 'cesium/Cesium'
import "cesium/Widgets/widgets.css";
export default {
  name: 'CesiumContainer',
  data: function () {
    return {
      
    }
  },
  mounted: function () {
    var BuildModuleUrl = require('cesium/Core/buildModuleUrl');
    BuildModuleUrl.default.setBaseUrl('./');
    new Viewer("cesiumContainer")
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.container{
  width: 100%;
  height: 100vh;
}
#cesiumContainer{
  width: 100%;
  height: 100vh;
}
</style>
