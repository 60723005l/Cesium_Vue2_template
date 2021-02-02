<template>
    <div class="geocoder-holder">
        <div class="geocoder-hide" ref="geocoder-container" style="display:none;"></div>
        <div class="giap-button geocode-search" style="padding:0px; width:40px; height:40px;" ref="geocode-search-btn"
            title="search a location"
            :class="{'active':geocoder.isContentShow}"
            @click="geocoder.isContentShow=!geocoder.isContentShow"
        >
            <button class="geocoder icon"></button>
        </div>
        <div class="geocode-content" :class="{'active':geocoder.isContentShow}" v-closable="{exclude:['geocode-search-btn'],handler:'onGeocodeContentClose'}">
            <input class="input-holder" @input="onGeocoderSearch($event)" :class="{'active':geocoder.isContentShow}"/>
            <ul class="suggestion" ref="suggestion" :class="{'active':geocoder.isContentShow}">
            <li class="suggestion-item" v-for="item in geocoder.suggestions" :key="item.index" @click="flyToSuggestion(item.destination)">{{item.displayName}}</li>
            </ul>
        </div>

    
        
    </div>
</template>
<script>
const Cesium = require("cesium/Cesium");
export default {
    name:'Geocoder',
    data:function()
        {
            return {
                geocoder:
                {
                    Cesium_geocoder:{viewModel:{searchText:'',suggestions:[]}},
                    searchText:'',
                    suggestions:[],//[{displayName:1},{displayName:1},{displayName:1},{displayName:1},{displayName:1},{displayName:1},],
                    awaitingSearch: true,
                    timer:{count:0,interval:undefined},
                    isContentShow:false
                }
            }
        },
    props: 
        {
            dataCenterName:String,
            CesiumViewerElemID:String,
        },
    mounted:function()
        {
            this.initGeocoder()
        },
    methods:
        {
            initGeocoder:function()
            {
                let viewer = this.$store.state.viewer[this.CesiumViewerElemID]
                // let Cesium = this.$store.state.Cesium
                this.geocoder.Cesium_geocoder = new Cesium.Geocoder({scene:viewer.scene,container:this.$refs['geocoder-container']})
            },
            onGeocoderSearch:function(e)
            {
                var self = this
                var geocoder = self.geocoder
                var viewModel =  self.geocoder.Cesium_geocoder.viewModel

                if(geocoder.timer.count<=1)
                {
                    if(!self.geocoder.awaitingSearch)
                    {
                    self.geocoder.suggestions = []
                    viewModel.searchText = ''
                    geocoder.searchText = e.target.value
                    geocoder.timer.count = 0
                    }
                    else
                    {
                    self.geocoder.awaitingSearch = false
                    geocoder.timer.interval = setInterval(function()
                    {
                        geocoder.timer.count+=0.2
                        if(geocoder.timer.count>2)
                        {
                        geocoder.timer.count = 0
                        self.geocoder.awaitingSearch = true
                        clearInterval(geocoder.timer.interval)
                        viewModel.searchText = geocoder.searchText
                        var return_suggestions = viewModel.suggestions
                        
                        function check_suggestions()
                        {
                            if(return_suggestions.length===0 && geocoder.searchText)
                            {
                            setTimeout(function()
                            {
                                check_suggestions()
                            },100)
                            }
                            else
                            {
                            var result = []
                            for(let i = 0; i < return_suggestions.length; i++)
                            {
                                result.push(return_suggestions[i])
                            }
                            self.geocoder.suggestions = result
                            }
                        }
                        check_suggestions()
                        }
                    },200)
                    }
                }
            },
            onGeocodeContentClose:function()
            {
                this.geocoder.isContentShow = false
            },
            flyToSuggestion:function(destination)
            {
                function cart3setHeight(ori_cart3,h,self)
                {
                    // let Cesium = self.$store.state.Cesium
                    let viewer = self.$store.state.viewer[this.CesiumViewerElemID]
                    let cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(ori_cart3);
                    let longitudeString = parseFloat(Cesium.Math.toDegrees(cartographic.longitude));
                    let latitudeString = parseFloat(Cesium.Math.toDegrees(cartographic.latitude));
                    let height = parseFloat(h)
                    let pos_deg = {x:longitudeString,y:latitudeString,z:height}
                    let new_pos = Cesium.Cartesian3.fromDegrees(pos_deg.x,pos_deg.y,pos_deg.z)
                    return new_pos
                }
                var isRect = Object.keys(destination).includes('west') ? true : Object.keys(destination).includes('x') ? false : NaN
                let viewer = this.$store.state.viewer[this.CesiumViewerElemID]
                // let Cesium = this.$store.state.Cesium
                if(isRect)
                {
                    console.log(destination)
                    viewer.camera.flyTo({destination:destination})
                }
                else
                {
                    console.log(2,cart3setHeight(destination,800,this))
                    viewer.camera.flyTo({destination:cart3setHeight(destination,800,this)})
                }
            },

        },
    components:
        {

        }
}
</script>
<style scoped>
.geocoder{
    cursor: pointer;
    background: bisque;
    -webkit-mask: url(/static/MapWidget/ICONS_geocoder.svg) no-repeat center;
    mask: url(/static/MapWidget/ICONS_geocoder.svg) no-repeat center;
    height: 75%;
    margin: 3px 0px 0px;
    width: 100%;
    border: none;
    border-radius: 3px;
}
.geocoder-holder{
    pointer-events: auto;
    display: flex;
}

.geocode-content{
  max-width: 0px;
  overflow: hidden;
  transition: 0.5s all ease-in-out;
}
.geocode-content.active{
    max-width: 300px;
    transition: 0.5s all ease-in-out;
}

.geocode-content .input-holder.active , .geocode-content .input-holder:hover{
    width: 250px;
    background: #090f16d1;
    border: 1px solid #fdfeff;
    color: #0cbdcf;
    box-shadow: -1px 0 5px 0px #00fff8;
    transition: 0.5s all ease-in-out;
}
.geocode-search.active{
    background: #090f16d1;
    border: 1px solid #fdfeff;
    color: #0cbdcf;
    box-shadow: -1px 0 5px 0px #00fff8;
}
.geocode-search.active > .icon{
  background: #0cbdcf;
}

.geocode-content .input-holder{
    width: 0px;
    height: 40px;
    margin: 2px 0px;
    background: #1e1e1ea1;
    border-radius: 0px 5px 5px 0px;
    color: white;
    padding-left: 15px;
    border:0px;
    transition: 0.5s all ease-in-out;
}

.suggestion{
    background: #1a1a1ac2;
    padding: 0px;
    max-width: 0px;
    width: 100%;
    max-height: 0px;
    transition: 0.5s all ease-in-out;
    position: fixed;
    z-index: 1;
    overflow: auto;
}
.suggestion.active{
  padding: 2px 10px;
  max-width: 250px;
  max-height: 500px;
}
.suggestion .suggestion-item{
    cursor: pointer;
    list-style: none;
    border-left: 3px solid #848484;
    margin: 3px 0px;
    padding: 3px 0px 0px 5px;
    border-bottom: 1px solid #848484;
    background:#262626a3;
    border-radius: 0px 3px 3px 0px;
}
.suggestion .suggestion-item:hover{
    background: #090f16d1;
    color: #0cbdcf;
}
</style>