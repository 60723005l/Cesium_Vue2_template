<template>
  <div :id="CesiumViewerElemID" class="cesiumContainer"></div>
</template>

<script>
import "cesium/Widgets/widgets.css";
import HM from '@/lib/HeatMap/CesiumHeatmap'
import {DataCenter,DataFactory} from "@/lib/DataManager"
import ProcessType from "@/lib/DataProcessType"
import CesiumInitailAdjuster from "@/lib/CesiumInitailAdjuster"
const Cesium = require("cesium/Cesium");
var Global = require("@/lib/Global").default
Cesium.Ion.defaultAccessToken ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5YWMxNjJmNy1hOWQ3LTQzYTctYTAwMi1iNTI5ZGZhNTMyODQiLCJpZCI6MTAxMjUsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1NTU2ODU2ODZ9.SttC3APgMVDggR_CYn9RyYc2Hw6EOGB7AVqKqpkIepk';

export default {
  name: 'CesiumContainer',
  data: function ()
    {

      return {
      }
    },
  props:
  {
    dataCenterName:String,
    CesiumViewerElemID:String,
    
  },
  mounted: function ()
    {
      // console.log(999,this)
      let viewer = new Cesium.Viewer(this.CesiumViewerElemID);
      // console.log(Global)
      // this.viewer = viewer
      this.set_BuildModuleUrl()
      this.heatMap_minin(viewer)
      this.set_vuexStore(viewer)
      this.reset_CesiumTimeline(viewer)

    },
  methods:
    {
      set_BuildModuleUrl:function()
      {
        var BuildModuleUrl = require('cesium/Core/buildModuleUrl');
        BuildModuleUrl.default.setBaseUrl('./');
      },
      heatMap_minin:function(viewer)
      {
        var hm = new HM(Cesium,viewer)
      },
      set_vuexStore:function(viewer)
      {
        // var viewer_payload = 
        //   {
        //     viewerElemID:this.CesiumViewerElemID,
        //     viewer:viewer
        //   }
        // var dateCenter_payload = 
        //   {
        //     centerName:this.dataCenterName,
        //     center:new DataCenter(this.dataCenterName,viewer,Cesium)
        //   }
        Global.viewer[this.CesiumViewerElemID] = viewer
        Global.DataCenter[this.dataCenterName] = new DataCenter(this.dataCenterName,viewer,Cesium)
        // this.$store.commit('addCesium', Cesium)
        // this.$store.commit('addViewer', viewer_payload)
        // this.$store.commit('setDataCenter',dateCenter_payload)
      },
      reset_CesiumTimeline:function(viewer)
      {
        CesiumInitailAdjuster.Cesium = Cesium
        CesiumInitailAdjuster.viewer = viewer
        CesiumInitailAdjuster.timelineUI()
      },
    },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.cesiumContainer{
    width: 100%;
    height: 100%;
}
</style>
