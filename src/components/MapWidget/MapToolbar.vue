<template>
    <div class="toolbar" ref="toolbar">
        <div class="tool-holder" >
            <div class="giap-button" style="padding:0px; width:40px; height:40px;" 
                @click="toggleLayers" 
                title="your imported layers">
                <button class="layer-icon icon"></button>
            </div>
            <!-- <div class="giap-button" style="padding:0px; width:40px; height:40px;"  @click="flyHome"
                title="view from home "
            >
                <button class="home icon"></button>
            </div> -->
            <!-- <Geocoder /> -->

            
        </div>

        <div class="tool-content" ref="tool-content" v-show="show">
            <Layers
                :Layers_info="Layer.dataList"
                :isLayerOpen="!Layer.isOpen"
                :visible_layers="Layer.visibles"
                :height="Layer.elemHeight"
                :dataCenterName="dataCenterName"
                :CesiumViewerElemID="CesiumViewerElemID"
            />
        </div>
    </div>
</template>
<script>
import Layers from '@/components/MapWidget/MapToolbar/Layers'
import Geocoder from '@/components/MapWidget/MapToolbar/Geocoder'
var Global = require("@/lib/Global").default


export default {
    name:'MapToolbar',
    data:function()
        {
            return{
                Layer:
                {
                    dataList:[],
                    visibles:[],
                    isOpen:false,
                    elemHeight:100,
                }

            }
        },
    props: 
        {
            dataCenterName:String,
            CesiumViewerElemID:String,
            show:Boolean
        },
    mounted:function()
        {
            var self = this
            self.init_layerComponent()
            adjustToolbarHeight()
            window.onresize = adjustToolbarHeight
            function adjustToolbarHeight()
            {
                var toolbar = self.$refs['toolbar']
                var suggestion = self.$refs['suggestion']
                var window_height = window.innerHeight
                toolbar.style.maxHeight = `${window_height-130-60}px`
                self.Layer.elemHeight = window_height-130-60-43-43
                // suggestion.style.maxHeight = `${window_height-130-60+43-90}px`
            }
        },
    methods:
        {
            init_layerComponent:function()
            {
                let dataCenter = Global.DataCenter[this.dataCenterName]
                this.Layer.dataList = dataCenter.dataList//this.$store.state.DataCenter[this.dataCenterName].dataList
            },
            toggleLayers:function()
            {
                this.Layer.isOpen ? this.Layer.isOpen = false : this.Layer.isOpen = true
            },
            flyHome:function()
            {
                let viewer = Global.viewer[this.CesiumViewerElemID]
                // let Cesium = this.$store.state.Cesium
                viewer.camera.flyHome()
            },
        },
    components:
        {
            Layers,
            Geocoder,
        }
}
</script>
<style scoped>
.toolbar {
    pointer-events: none;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: fixed;
    margin-top: 5px;
    color: bisque;
    font-family: monospace;
    top: 30px;
}
.toolbar .tool-holder{
  display: flex;
  flex-direction: row;
}
.toolbar .tool-content{
    pointer-events: auto;
}

.toolbar .giap-button:hover{
    background: #090f16d1;
    border: 1px solid #fdfeff;
    color: #0cbdcf;
    box-shadow: -1px 0 5px 0px #00fff8;
}

.toolbar .giap-button:hover > .icon{
    background: #0cbdcf;
}

.home{
    cursor: pointer;
    background: bisque;
    -webkit-mask: url(/static/MapWidget/ICONS_home.svg) no-repeat center;
    mask: url(/static/MapWidget/ICONS_home.svg) no-repeat center;
    height: 75%;
    margin: 3px 0px 0px;
    width: 100%;
    border: none;
    border-radius: 3px;
}

.layer-header {
    text-align: center;
    font-size: larger;
    height: 100%;
    writing-mode: vertical-rl;
    padding: 3px;
    margin: 0px;
}


.layer-icon{
    cursor: pointer;
    background: bisque;
    -webkit-mask: url(/static/MapWidget/ICONS_layer.svg) no-repeat center;
    mask: url(/static/MapWidget/ICONS_layer.svg) no-repeat center;
    height: 75%;
    margin: 3px 0px 0px;
    width: 100%;
    border: none;
    border-radius: 3px;
}
</style>