<template>
<div class="container">
  <div id="cesiumContainer"></div>
</div>
</template>

<script>
import "cesium/Widgets/widgets.css";
// import {DataCenter,DataFactory} from "../lib/DataManager"
// import ProcessType from "../lib/DataProcessType"
// import CesiumInitailAdjuster from "../lib/CesiumInitailAdjuster"
const Cesium = require("cesium/Cesium");
Cesium.Ion.defaultAccessToken ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5YWMxNjJmNy1hOWQ3LTQzYTctYTAwMi1iNTI5ZGZhNTMyODQiLCJpZCI6MTAxMjUsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1NTU2ODU2ODZ9.SttC3APgMVDggR_CYn9RyYc2Hw6EOGB7AVqKqpkIepk';

export default {
  name: 'CesiumContainer',
  data: function () {

    return {
      
    }
  },
  mounted: function () {
    var BuildModuleUrl = require('cesium/Core/buildModuleUrl');
    BuildModuleUrl.default.setBaseUrl('./');
    var viewer = new Cesium.Viewer("cesiumContainer");
    Cesium.viewer = viewer
    var scene = viewer.scene
    // CesiumInitailAdjuster.Cesium = Cesium
    // CesiumInitailAdjuster.viewer = viewer
    // CesiumInitailAdjuster.timelineUI()
    // var dataCenter = new DataCenter('DataCenrer_1',viewer,Cesium)
    this.$store.commit('addCesium', Cesium)
    this.$store.commit('addViewer', viewer)
    this.$store.commit('addScene', scene)
    this.$store.commit('setDataCenter',dataCenter)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.container{
  position: relative;
  width: 100vw;
  height: 100vh;
}
#cesiumContainer{
    width: 100%;
    height: 100%;
}
</style>
