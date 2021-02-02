<template>
<div class="scale-svg">
<svg xmlns="http://www.w3.org/2000/svg" :style="{'height':scale.start.y,'width':scale.end.x}">
    <line  ref="base-line"
        :x1="scale.start.x" :y1="scale.start.y" 
        :x2="scale.end.x" :y2="scale.end.y" 
        style="stroke: White;stroke-width: 3px;stroke-linecap: square;"/>
    <line  ref="start-line"
        :x1="scale.start.x" :y1="scale.start.y" 
        :x2="scale.start.x" :y2="scale.height"  
        style="stroke: White; stroke-width: 3px"/>
    <line  ref="stop-line"
        :x1="scale.end.x" :y1="scale.end.y" 
        :x2="scale.end.x" :y2="scale.height"  
        style="stroke: White; stroke-width: 3px"/>
    <line  ref="mid-line"
        :x1="scale_mid.x" :y1="scale_mid.y" 
        :x2="scale_mid.x" :y2="scale.height"  
        style="stroke: White; stroke-width: 1px"/>
    <!-- <text 
        :x="scale.end.x+5" :y="scale.end.y"
        style="fill: antiquewhite;">
        {{scale.label}}
    </text> -->
</svg>
<span class="scale-lable">{{scale.label}}</span>
</div>
</template>
<script>
const Cesium = require("cesium/Cesium");
var Global = require("@/lib/Global").default
export default {
    name:'Scale',
    data()
        {
            return {
                isActivate:false,
                scale:
                {
                    start:{x:0,y:15},
                    end:{x:100,y:15},
                    height:0,
                    label:'km',
                    retio:undefined
                }
            }
        },
    props:
        {
            // viewer:Object,
            dataCenterName:String,
            CesiumViewerElemID:String,
            active:Boolean
        },
    mounted()
        {
            let viewer = Global.viewer[this.CesiumViewerElemID]
            window.Cesium = Cesium
            var self = this
            wait_viewer()
            function wait_viewer()
            {
                setTimeout
                (
                    ()=>
                    {
                        if(viewer)
                        {
                            self.scale_activate(viewer)
                            window.Cesium = Cesium
                            window.viewer = viewer
                            // console.log('scale viewer prop ready')
                        }
                        else
                        {
                            wait_viewer()
                        }
                        
                    },
                    100
                )
            }
        },
    computed:
        {
            "scale_mid"()
            {
                return {x:this.scale.end.x/2,y:15}
            },
        },
    watch:
        {
            active(val)
            {
                let viewer = Global.viewer[this.CesiumViewerElemID]
                if(val)
                {console.log('start');this.scale_activate(viewer)}
                else
                {console.log('off');this.scale_close(viewer)}
            }
        },
    methods:
        {
            scale_activate(viewer)
            {
                var self = this
                if(!self.isActivate)
                {
                    self.isActivate = true
                    // console.log(self)
                    self.scale_start_event = self.set_scaleLabel
                    // console.log(self.scale_start_event , self.set_scaleLabel)
                    viewer.camera.moveEnd.addEventListener(self.scale_start_event)
                }

            },
            scale_close(viewer)
            {
                var self = this
                viewer.camera.moveEnd.removeEventListener(self.scale_start_event)
            },
            getViewer_MidBottomPos()
            {
                let viewer = Global.viewer[this.CesiumViewerElemID]
                return{
                    x:(viewer.container.clientWidth/2)+viewer.container.clientLeft,
                    y:(viewer.container.clientHeight )+viewer.container.clientTop,
                }
            },
            set_scaleLabel()
            {
                // console.log('set_scaleLabel')
                this.scale.end.x = 100
                var scale_len = this.scale.end.x-this.scale.start.x
                var distance = this.pixLenToDistance(scale_len) || 0 // meter
                var new_distance = this.get_processedDist(distance)
                

                this.scale.ratio = scale_len/distance

                var new_scale_len = this.distanceToPixLen(new_distance.distanceInM,this.scale.ratio)
                this.set_scaleLen(new_scale_len)

                this.scale.label = `${new_distance.value}${new_distance.unit}`
            },
            distanceToPixLen(round_distance,ratio)
            {
                return round_distance*ratio
            },
            set_scaleLen(new_scale_len)
            {
                this.scale.end.x = isNaN(new_scale_len) ? this.scale.end.x : new_scale_len
            },
            get_processedDist(distance)
            {
                var round_distance = Math.round(distance)
                var new_distance = {}
                if(round_distance>=1000)
                {
                    new_distance.value = Math.round(Math.round(round_distance*1000)/1000000)
                    new_distance.unit = 'km'
                    new_distance.distanceInKM = new_distance.value
                    new_distance.distanceInM = new_distance.value*1000
                }
                else
                {
                    new_distance.value = Math.round(Math.round(round_distance*1000)/1000)
                    new_distance.unit = 'm'
                    new_distance.distanceInKM = new_distance.value/1000
                    new_distance.distanceInM = new_distance.value
                }
                return new_distance
            },
            pixLenToDistance(pixel_len)
            {
                let viewer = Global.viewer[this.CesiumViewerElemID]
                var midBottPos_pix = this.getViewer_MidBottomPos(),
                    start = {x:midBottPos_pix.x-(pixel_len/2),y:midBottPos_pix.y},
                    stop = {x:midBottPos_pix.x+(pixel_len/2),y:midBottPos_pix.y}
                var ellipsoid = viewer.scene.globe.ellipsoid;
                var startPos_cart3 = viewer.camera.pickEllipsoid(new Cesium.Cartesian2(start.x,start.y), ellipsoid),
                    stopPos_cart3 = viewer.camera.pickEllipsoid(new Cesium.Cartesian2(stop.x,stop.y), ellipsoid)
                if(startPos_cart3 && stopPos_cart3)
                {
                    return Cesium.Cartesian3.distance(startPos_cart3, stopPos_cart3)
                }
                else
                {
                    return undefined
                }
            },
        },
}
</script>
<style scoped>
.scale-svg{
    width: fit-content;
    background: #272a32ba;
    padding: 5px;
    /* border-radius: 5px; */
}
.scale-lable{
    color: bisque;
}

</style>