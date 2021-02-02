<template>

  <div class="Layer" id="Layer" v-bind:style="{ height:layer_height+'px' }" :class="{'toggle-layers':isLayerOpen}">
    <div class='row' v-show="isEmpty" ><div style="position: relative;left: 50%;transform: translate(-50%, 0%);">empty !</div></div>
    <draggable class="layercontainer" v-model="Layers" group="people" @start="drag=true" @end="drag=false" ref="layer" >
      <div v-for="item in Layers" :key="item.id" 
        class="row" :class="{'select':item.select}"
        @contextmenu="openMenu($event,item)" 
        @mousedown.left.exact="onSelectLayer($event,item)"
        @click.shift.left.exact="onShiftSelect($event,item)"
        @click.ctrl.left.exact="onCtrlSelect($event,item)"
      >
        <input
          type="checkbox"
          @click="show($event,item)"
          :checked="get_show_status(item)"/>
        <div class="option" @click="openMenu($event,item)"><button>‧‧‧</button></div>
        <label style="margin:0px;white-space: break-spaces;">{{item.name}}</label>
        
      </div>
    </draggable>
    <ul id="right-click-menu" tabindex="-1" ref="right" v-if="viewMenu" @blur="closeMenu" :style="{top:top, left:left}">
      <li @click="flyto(selected_layer)">fly to layer</li>
      <li @click="removeLayer(selected_layer)">delete the layer</li>
      <li @click="LayerAttribute(selected_layer)">attribute</li>
      <li @click="LayerSymbology(selected_layer)">symbology</li>
    </ul>
    <DragAnyWhere
      v-if="menu.attribute.show"
      :title="'Attribute'"
      :draggableContainer="'attribute-draggable'"
    >
      <!-- <div class="attribute-window"> -->
        <button class="giap-button extra-close-btn" @click="menu.attribute.show = false">✖</button>
        <div class="tableFixHead">
            <table class="import-table">
                <thead class="row-header">
                    <tr ><th v-for="h in menu.attribute.header" :key="h.index" >{{h}}</th></tr>
                </thead>
                <tbody ref="filter-body-elm">

                    <tr v-for="row in menu.attribute.body" :key="row.id" class="row-asset">
                      <td v-for="item in row" :key="item.index">{{item}}</td>
                    </tr>
                </tbody>
            </table>
        </div>
      <!-- </div> -->
    </DragAnyWhere>
  </div>
</template>

<script>
// import G from '../Global'
// const G = require('../Global.js').default
// var Cesium = G.Cesium
// var viewer = G.viewer
// import store from "../../../store";
const Cesium = require("cesium/Cesium");
var Global = require("@/lib/Global").default
import draggable from 'vuedraggable'
import DragAnyWhere from "@/components/component/DragAnyWhere";

export default {
    name:'Layers',
    data:()=>
    {
        return{
          // viewer:undefined,
          Layers:[],
          isEmpty:true,
          selected_layer:Object,
          selected_layers:[],
          viewMenu: false,
          top: '0px',
          left: '0px',
          layer_height:100,
          menu:
          {
            attribute:{show:false,header:[],body:[[]]}
          }
        }
    },
    props:
    {
        Layers_info:{type:Array,default:[]},
        isLayerOpen:Boolean,
        visible_layers:Array,
        height:Number,
        dataCenterName:String,
        CesiumViewerElemID:String,
    },
    mounted:function()
    {
      // let viewer = this.$store.state.viewer[this.CesiumViewerElemID]
      let viewer = Global.viewer[this.CesiumViewerElemID]
      // console.log(1,this.$store.state.viewer[this.CesiumViewerElemID])
    },
    watch:
    {
      visible_layers:function(val)
      {
        var self = this
        val.forEach(v=>
        {
          self.Layers_info.filter(e=>e.name === v)[0].show = true
          self.Layers_info.filter(e=>e.name === v)[0].DataSource.show = true
        })
      },
      Layers_info:function(val)
      {
        this.$data.Layers = this.$props.Layers_info
        this.$data.Layers.forEach((e,i)=>e.index = i)
        this.isEmpty = this.$data.Layers.length===0 ? true : false
      },
      height:function(val)
      {
        console.log(val)
        this.$data.layer_height = val
      }
    },
    methods:
    {
      flyto:function(asset)
      {
          // var Cesium = this.$store.state.Cesium
          let viewer = Global.viewer[this.CesiumViewerElemID]
          let dataCenter = Global.DataCenter[this.dataCenterName]
          let factory = dataCenter.getFactory(asset)
          viewer.flyTo(factory.dataSource)
          this.closeMenu()
      },
      get_show_status(asset)
      {
        let dataCenter = Global.DataCenter[this.dataCenterName]
        let factory = dataCenter.getFactory(asset)
        return factory.dataSource.show
      },
      show:function(e,asset)
      {
         let viewer = Global.viewer[this.CesiumViewerElemID]
         let dataCenter = Global.DataCenter[this.dataCenterName]
         let factory = dataCenter.getFactory(asset)
          var status = e.target.checked
          console.log(status)
          factory.dataSource.show = status
          // this.$store.state.viewer.scene.requestRender();
          viewer.scene.requestRender();
          // this.viewer.scene.requestRender();
      },
      removeLayer:function(asset)
      {
        var targets = this.selected_layers.length > 0 ? this.selected_layers : [asset]
        console.log(666,targets,targets.map(e=>e.name))
        console.log(targets)
        let dataCenter = Global.DataCenter[this.dataCenterName]
        // var dataCenter = this.$store.state.DataCenter[this.dataCenterName]
        this.closeMenu()
        targets.forEach(e=>
        {
          dataCenter.remove(e)
        })
        this.$forceUpdate()
        
      },
      setMenu: function(top, left)
      {
          var largestHeight = window.innerHeight - this.$refs.right.offsetHeight - 25;
          var largestWidth = window.innerWidth - this.$refs.right.offsetWidth - 25;
          if (top > largestHeight) top = largestHeight;
          if (left > largestWidth) left = largestWidth;
          this.top = top + 'px';
          this.left = left + 'px';
      },

      closeMenu: function()
      {
          this.viewMenu = false;
      },

      openMenu: function(e,item)
      {
        // this.onSelectLayer(e,item)
          this.viewMenu = true;
          this.$nextTick(function() {
            this.selected_layer = item
            this.$refs.right.focus();
            this.setMenu(e.y, e.x)
          }.bind(this));
          e.preventDefault();
      },
      onSelectLayer:function(event,item)
      {
        this.$data.Layers.forEach((e,i)=>e.index = i)
        this.selected_layers = []
        console.log('click')
        this.Layers.forEach(l=>{l.select = false})
        var elem = event.target
        this.Layers = this.Layers
        
        item.select = true
        // elem.classList.add('select')
        this.selected_layer = item
        this.$store.commit('setSelectedLayer', item)
        this.selected_layers.push(item)
        console.log(this.selected_layers.map(e=>e.name),item)
        this.$forceUpdate()
      },
      onShiftSelect:function(event,item)
      {
        event.preventDefault()
        console.log('Shift click')
        var firstSelect = this.selected_layer
        var secondSelect = item
        console.log(firstSelect.name,secondSelect.name)
        for(let i = firstSelect.index+1; i <= secondSelect.index; i++)
        {
          this.Layers[i].select = true
          this.selected_layers.push(this.Layers[i])
        }
        console.log(this.selected_layers.map(e=>e.name))
        this.$forceUpdate()
      },
      onCtrlSelect:function(event,item)
      {
        var index = this.selected_layers.map(e=>e.id).indexOf(item.id)
        console.log(index)
        if(index>0) //item already inside selected_layers
        {
          item.select = false
          this.selected_layers.splice(index,1)
        }
        else
        {
          console.log('Ctrl click')
          this.selected_layer = item
          item.select = true
          this.selected_layers.push(item)
          
        }
        this.$forceUpdate()

      },
      LayerAttribute:function()
      {
        this.menu.attribute.show = true
        this.menu.attribute.body = []

        if(this.selected_layer.type === 'kmz')
        {
          var entities = this.selected_layer.dataSource.entities.values
          this.menu.attribute.header = entities[0].properties.propertyNames
          for(let i = 0; i < entities.length; i++)
          {
            var entity = entities[i]
            var body_row  = this.menu.attribute.header.map((e)=>entity.properties[e])
            this.menu.attribute.body.push(body_row)
          }
        }
        else if(this.selected_layer.type === 'geojson')
        {
          var entities = this.selected_layer.dataSource.entities.values
          this.menu.attribute.header = entities[0].properties.propertyNames
          for(let i = 0; i < entities.length; i++)
          {
            var entity = entities[i]
            var body_row  = this.menu.attribute.header.map((e)=>entity.properties[e])
            this.menu.attribute.body.push(body_row)
          }
        }

        console.log(this.selected_layer)

      },
      LayerSymbology:function()
      {},
    
    
    
    },
    components:
    {
      draggable,
      DragAnyWhere
    }
}
</script>

<style scoped>
.Layer {
  pointer-events: auto;
    overflow: auto;
    background-color: rgb(29 29 29 / 76%);
    border: 1px solid #5d5d5d;
    border-radius: 0px 5px 5px 0px;
    padding: 0px 10px;
    margin-top: 2px;
    max-width: 300px;
    width: 300px;
    transition: 0.3s max-width ease-in;
}
.Layer .row{
  display: flex;  
  border-left: 2px solid #757575c2;
  white-space: nowrap;
  cursor: pointer;
  border-radius: 2px;
  border-bottom: #757575c2 1px solid;
  padding: 2px;
  margin-bottom: 5px;
  margin-top: 5px;
}
.Layer .row:hover{
    background: #6c818ba3;
    background: #090f16d1;
    color: #0cbdcf;
}
.Layer .row.select{
    border: 1px solid #fdfeff;
    box-shadow: -1px 0 5px 0px #00fff8;
    background: #6c818ba3;
    background: #090f16d1;
    color: #0cbdcf;
}
.Layer .row .option{
    background: #747474a3;
    cursor: pointer;
    border-radius: 3px;
    margin-right: 5px;
    display: inherit;
    /* position: absolute; */
    /* right: 0px; */
}
.Layer .row .option:hover{
  background: #0086f9a3;
}
.Layer .row .option button{
    background: none;
    color: white;
    border: 0px;
    cursor: pointer;
}
.layer-row :hover {
    background-color: rgb(87 85 85);
}
.Layer .row input{
  margin-left: 5px;
  margin-right: 5px;
  margin-bottom: 2px;
  vertical-align: middle;
}
.Layer .row label{
  cursor: pointer;
}
.toggle-layers{
    max-width: 0px;
    transition: 0.3s max-width ease-out;
    padding: 0px;
    border: none;
}

#right-click-menu{
  position: fixed !important;
  background: #202020c4;
  border: 1px solid #BDBDBD;
  border-radius: 3px;
  box-shadow: 0 2px 2px 0 rgba(0,0,0,.14), 0 3px 1px -2px rgba(0,0,0,.2), 0 1px 5px 0 rgba(0,0,0,.12);
  display: block;
  list-style: none;
  margin: 0;
  padding: 0;
  width: 250px;
  z-index: 999999;
}

#right-click-menu li {
  cursor: pointer;
  border-bottom: 1px solid #E0E0E0;
  margin: 0;
  padding: 5px 35px;
}

#right-click-menu li:last-child {
  border-bottom: none;
}

#right-click-menu li:hover {
  background: #305787c4;
  color: #FAFAFA;
}


/* --------------------------------------------------------------------------------- */
.float-window{
    background: #020202;
    /* padding: 10px; */
    border: 1px solid #777777;
    border-radius: 3px;
    height: 300px;
    width: 300px;
    resize: both;
    overflow: auto;
}

.import-window{
    z-index: 10 !important;
}

.import-window .header{
    display: flex;
    font-size: larger;
    margin: 0px -10px 5px;
    background: #171717ab;
    align-items: center;
}

.import-window .header .title{
    display: flex;
    pointer-events: none;
    width: 100%;
    justify-content: center;
    align-items: center;
}

.tableFixHead{
    overflow-y: auto;
    /* height: 350px; */
    animation-name:oxxo;
    animation-duration:0.5s;
}
@keyframes oxxo{
    from{
        height: 0px;
    }
    to{
        height: 350px;
    }
}
.tableFixHead thead th {
    position: sticky;
    top: 0;
    background: #656565;
    border-radius: 4px;
}
.import-table{
    background: rgb(63 63 63 / 67%);
    border-collapse: inherit;
    border-spacing: 2px;
    border-radius: 5px;
    color: beige;

}
.import-table td,th{
    border-block-end: 0.5px solid #838383;
    padding: 0px 20px 0px 20px;
    max-width: min-content;
    white-space: nowrap;
}
.row-asset{
    cursor: pointer;
}
.row-asset:hover{
    background: #090f16d1;
    border: 1px solid #fdfeff;
    color: #0cbdcf;
}
.row-asset-hover{
    background: #090f16d1;
    border: 1px solid #fdfeff;
    color: #0cbdcf;
}
.row-title{
    font-size: larger;
}
.row-header {
    font-size: large;
}/* --------------------------------------------------------------------------------- */
</style>