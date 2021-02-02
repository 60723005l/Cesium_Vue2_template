<template>
<div>
<svg
    class="compass-svg"
    xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22">
    <!-- <title>ICONS</title> -->
    <g id="compass">
        <g id="outer_ring" class="compass-ring" @mousedown="arrow_onmousedown">
            <path id="ring" class="cls-1" d="M11,4.15A6.85,6.85,0,1,0,17.85,11,6.85,6.85,0,0,0,11,4.15Zm0,11.5A4.65,4.65,0,1,1,15.65,11,4.65,4.65,0,0,1,11,15.65Z"/>
            <g id="tick">
                <line class="cls-2" x1="11" y1="4.15" x2="11" y2="6.35"/>
                <line class="cls-2" x1="11" y1="15.65" x2="11" y2="17.85"/>
                <line class="cls-2" x1="4.15" y1="11" x2="6.35" y2="11"/>
                <line class="cls-2" x1="15.65" y1="11" x2="17.85" y2="11"/>
                <line class="cls-3" x1="6.15" y1="6.15" x2="7.71" y2="7.71"/>
                <line class="cls-3" x1="14.29" y1="14.29" x2="15.85" y2="15.85"/>
                <line class="cls-3" x1="6.15" y1="15.85" x2="7.71" y2="14.29"/>
                <line class="cls-3" x1="14.29" y1="7.71" x2="15.85" y2="6.15"/>
            </g>
        </g>
        <g id="r-group" ref="r-group">
            <g id="arrows" class="compass-arrows">
                <polygon id="sub" class="cls-4" points="12.07 11 14.29 7.71 11 9.93 7.71 7.71 9.93 11 7.71 14.29 11 12.07 14.29 14.29 12.07 11"/>
                <polygon id="main" class="cls-4" points="12.36 12.36 19.34 11 12.36 9.64 11 2.66 9.64 9.64 2.66 11 9.64 12.36 11 19.34 12.36 12.36"/>
            </g>
            <g id="label">
                <path class="cls-5" d="M11.48,2.53l-.92-1.39a1.06,1.06,0,0,1,0,.12V2.49l-.32,0,0-1.9.38,0L11.48,2a.92.92,0,0,1,0-.12V.62l.32,0,0,1.94Z"/>
                <path class="cls-6" d="M11.8.62V2.49h-.32l-.89-1.37L10.51,1h0a2.3,2.3,0,0,1,0,.27V2.49h-.28V.62h.34L11.44,2l.08.13h0a1.93,1.93,0,0,1,0-.27V.62h.28m.08-.08h-.44V1.82L10.64.58l0,0h-.47v2h.44V1.28l.81,1.25,0,0h.45v-2Z"/>
            </g>
        </g>
        <g id="inner_core" ref="inner_core" class="compass-core" @dblclick="core_dbclick">
            <circle id="outer_bg" class="cls-1" cx="11" cy="11" r="3.38"/>
            <circle id="inner_bg" class="cls-7" cx="11" cy="11" r="2.06"/>
            <g id="core">
                <circle class="cls-2 core-globe" cx="11" cy="11" r="2.06"/>
                <ellipse class="cls-8 core-globe" cx="11" cy="11" rx="0.57" ry="2.19"/>
                <ellipse class="cls-8 core-globe" cx="11" cy="11" rx="2.19" ry="0.57"/>
            </g>
        </g>
    </g>
</svg>
</div>
</template>
<script>
// import SvgCompass from '@/components/MapWidget/SvgCompass'
const Cesium = require("cesium/Cesium");
var Global = require("@/lib/Global").default
//var viewer = Global.viewer[this.CesiumViewerElemID]
export default {
    name:'Compass',
    data()
        {
            return {
                isActivate:false,
                
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
            // var center = this.getSvgCenter(this.$refs['inner_core'])
            let viewer = Global.viewer[this.CesiumViewerElemID]
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
                            // console.log('compass',self,self.$props.viewer)
                            self.compass_activate(viewer)
                            window.Cesium = Cesium
                            window.viewer = viewer
                            // console.log('compass viewer prop ready')
                        }
                        else
                        {
                            // console.log('compass wait')
                            wait_viewer()
                        }
                    },
                    100
                )
            }
        },
    watch: 
        {
            active(val)
            {
                console.log('active',val)
                let viewer = Global.viewer[this.CesiumViewerElemID]
                if(val)
                {this.compass_activate(viewer)}
                else
                {this.compass_close(viewer)}
            }
        },
    methods:
        {
            getSvgCenter:function(elem)
            {
                var bbox = elem.getBBox();
                var ctm = elem.getCTM()
                var cx = bbox.x + bbox.width/2;
                var cy = bbox.y + bbox.height/2;
                return {x:cx,y:cy}
            },
            getSvgScreenCenter:function(elem)
            {
                var B_clientRect = elem.getBoundingClientRect()
                return{
                    x:B_clientRect.x+(B_clientRect.width/2),
                    y:B_clientRect.y+(B_clientRect.height/2)
                }
            },
            setSvgRotation:function(elem,deg,x,y)
            {
                elem.setAttribute
                (
                    "transform",
                    `rotate(${deg},${x},${y})`
                )
            },
            getSceneHeadingDeg:function(viewer)
            {
                return Cesium.Math.toDegrees(viewer.camera.heading)
            },
            compass_activate:function(viewer)
            {
                // console.log('compass',viewer)
                var self = this
                if(!self.isActivate)
                {
                    console.log(666)
                    self.isActivate = true
                    self.compass_start_event = self.compass_start
                    viewer.scene.postUpdate.addEventListener(self.compass_start)
                }

            },
            compass_start()
            {
                let viewer = Global.viewer[this.CesiumViewerElemID]
                var self = this
                    // console.log('compass_start')
                    var center = self.getSvgCenter(self.$refs['inner_core'])
                    var heading_deg = 360-self.getSceneHeadingDeg(viewer)
                    self.setSvgRotation(self.$refs['r-group'],heading_deg,center.x,center.y)
            },
            compass_close(viewer)
            {
                var self = this
                self.isActivate = false
                viewer.scene.postUpdate.removeEventListener(self.compass_start)
            },
            core_dbclick()
            {
                let viewer = Global.viewer[this.CesiumViewerElemID]
                viewer.camera.flyTo
                ({
                    destination : viewer.camera.position,
                    orientation : 
                    {
                        heading : Cesium.Math.toRadians(.0),
                        pitch : viewer.camera.pitch,
                        roll : viewer.camera.roll
                    }
                });
            },
            arrow_onmousedown(event)
            {
                document.onmousemove = this.arrow_elementDrag
                document.onmouseup = this.arrow_closeDragElement
            },
            arrow_elementDrag(event)
            {
                let viewer = Global.viewer[this.CesiumViewerElemID]
                var center_svg = this.getSvgCenter(this.$refs['inner_core'])
                var center_screen = this.getSvgScreenCenter(this.$refs['inner_core'])
                var direction = 
                {
                    x:event.clientX - center_screen.x,
                    y:(event.clientY - center_screen.y) * -1
                }
                viewer.camera.setView
                ({
                    destination : viewer.camera.position,
                    orientation : 
                    {
                        heading : Cesium.Math.toRadians(-this.getAngle(direction.x,direction.y)),
                        pitch : viewer.camera.pitch,
                        roll : viewer.camera.roll
                    }
                });

            },
            arrow_closeDragElement()
            {
                document.onmouseup = null
                document.onmousemove = null
            },
            getAngle (x,y)
            {
                var angle = Math.atan2(x, y);   //radians
                var degrees = 180*angle/Math.PI;  //degrees
                return (360+Math.round(degrees))%360; //round number, avoid decimal fragments
            }

        },
    components:
        {
            
        }
}
</script>
<style scoped>
.compass-svg{
    width:150px;
}
.compass-core, .compass-ring{
    pointer-events: auto;
    cursor: pointer;
    user-select: none;
    user-select: none; /* supported by Chrome and Opera */
   -webkit-user-select: none; /* Safari */
   -khtml-user-select: none; /* Konqueror HTML */
   -moz-user-select: none; /* Firefox */
   -ms-user-select: none; /* Internet Explorer/Edge */
}
.compass-core:hover .core-globe{
    stroke:aquamarine
}
.compass-core:hover #inner_bg{
    fill: black;
}
.compass-core:hover #outer_bg{
        stroke: aquamarine;
}


.cls-1,.cls-4,.cls-6,.cls-7{fill:#303336;}
.cls-1,.cls-4,.cls-7{stroke:#ddd6ce;stroke-width:0.08px;}
.cls-1,.cls-2,.cls-3,.cls-7,.cls-8{stroke-miterlimit:10;}
.cls-1,.cls-4{opacity:0.9;}.cls-2,.cls-3,.cls-8{fill:none;}
.cls-2,.cls-8{stroke:bisque;}.cls-2{stroke-width:0.1px;}
.cls-3{stroke:#d3bfa9;stroke-width:0.05px;}
.cls-4{stroke-linejoin:round;}.cls-5{fill:#fff;}
.cls-7{opacity:0.8;}.cls-8{stroke-width:0.2px;}


</style>