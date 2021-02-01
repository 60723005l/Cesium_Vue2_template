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
      let viewer = new Cesium.Viewer(this.CesiumViewerElemID);
      this.set_BuildModuleUrl()
      this.heatMap_minin(viewer)
      this.set_GlobalStore(viewer)
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
      set_GlobalStore:function(viewer)
      {
        Global.viewer[this.CesiumViewerElemID] = viewer
        Global.DataCenter[this.dataCenterName] = new DataCenter(this.dataCenterName,viewer,Cesium)
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

<style scoped>
.cesiumContainer{
    width: 100%;
    height: 100%;
}
</style>
