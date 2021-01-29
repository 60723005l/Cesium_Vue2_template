// var store = require('../../store')
const Cesium = require('cesium/Cesium');
import LinkBudget from '@/lib/AGI_STK/LinkBudgetParser'
import TableBuilder from '@/lib/js/TableBuilder'
import FuzzySearch from '@/lib/js/FuzzySearch'
// var Cesium = store.state.Cesium
// var viewer = Cesium.viewer
// console.log(viewer)
const ThreeDTILE =
{
    materials:function(obj)
    {
        var Cesium = require('cesium/Cesium');
        let result = {Cesium}
        Object.keys(obj).forEach(e=>result[e]=obj[e])
        return result
    },
    processor:function(materials)
    {
        var Cesium = materials.Cesium,
            viewer = materials.viewer
        return new Promise(function(resolve,reject)
        {
            var tileset = viewer.scene.primitives.add
            (
                new Cesium.Cesium3DTileset
                ({
                    url: Cesium.IonResource.fromAssetId(materials.id),
                })
            );
            if(materials.callback) materials.callback(tileset,materials)
            resolve(tileset)
        })
    },
    post_processor:function(materials)
    {}
} 

const WMTS_META_SOURCE = 
{
    materials:function(obj)
    {
        var Cesium = require('cesium/Cesium');
        let result = {Cesium}
        Object.keys(obj).forEach(e=>result[e]=obj[e])
        return result
    },
    processor:function(materials)
    {
        function requestPromise(url,params = false)
        {
        
            if (params)
            {
                var url = new URL(url);
                Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
                return new Promise(function(resolve, reject)
                {
                    fetch(url)
                    .then(resp=>
                    {
                        resolve(resp.json())
                    })
                })
            }
            else
            {
                return new Promise(function(resolve, reject)
                {
                    fetch(url)
                    .then(resp=>
                    {
                        resolve(resp.json())
                    })
                })  
            }
        

        }
        return new Promise(resolve=>
            {
                var meta_data = materials.data
                var provider = new Cesium.WebMapTileServiceImageryProvider({
                    url: meta_data.url,
                    layer:'',
                    style: 'default',
                    tileMatrixSetID: "250m",
                });
                var imageryLayers = viewer.imageryLayers;
                var layer = imageryLayers.addImageryProvider(provider);
                layer.alpha = 0.6
                if(materials.callback) materials.callback(layer,materials)
                resolve(layer)

            })

    },
    post_processor:function(materials)
    {}
}

const GLTF =
{
    materials:function(obj)
    {
        var Cesium = require('cesium/Cesium');
        let result = {Cesium,viewer:Cesium.viewer}
        Object.keys(obj).forEach(e=>result[e]=obj[e])
        return result
    },
    processor:function(materials)
    {
        var Cesium = materials.Cesium,
            viewer = materials.viewer
        return new Promise(function(resolve,reject)
        {
            var promise = Cesium.IonResource.fromAssetId(materials.id).then( (resource) =>
             {
                if(materials.callback) materials.callback(promise,materials)
                return viewer.entities.add({
                  model: { uri: resource },
                });
              });
            resolve(promise)
        })
    },
    post_processor:function(materials)
    {}
} 

const CZML =
{
    materials:function(obj)
    {
        var Cesium = require('cesium/Cesium');
        let result = {Cesium,viewer:Cesium.viewer}
        Object.keys(obj).forEach(e=>result[e]=obj[e])
        return result
    },
    processor:function(materials)
    {
        var Cesium = materials.Cesium,
            viewer = materials.viewer
        return new Promise(function(resolve,reject)
        {
            var dataSourcePromise = Cesium.CzmlDataSource.load(materials.data.url)
            if(materials.callback) materials.callback(dataSourcePromise,materials)
            viewer.dataSources.add(dataSourcePromise);
            resolve(dataSourcePromise)
        })
    },
    post_processor:function(materials)
    {}
} 

const CZML_LinkBudget =
{
    materials:function(obj)
    {
        var Cesium = require('cesium/Cesium');
        let result = {Cesium,viewer:Cesium.viewer}
        Object.keys(obj).forEach(e=>result[e]=obj[e])
        return result
    },
    processor:function(materials)
    {
        var Cesium = materials.Cesium,
            viewer = materials.viewer
        function loadLinkBudget( url )
        {
            return new Promise( resolve =>
                {
                    fetch( url ).then( resp => resp.text() )
                    .then( text =>
                        {
                            var myLinkBudget = new LinkBudget( text )
                            resolve( myLinkBudget )
                        } )
                } )
        }
        function linkBudgetIntegrationPromise( url, dataSource )
        {
            return new Promise( resolve => 
                {
                    loadLinkBudget( url ).then( linkBudget =>
                        {
                            let LB_object = linkBudget.toTableObject()
                            let target_id = FuzzySearch( linkBudget.name, dataSource.entities.values.map( e => e.id ) )
                            let target_entity = dataSource.entities.getById( target_id )
                            let my_Table = new TableBuilder({
                                input: LB_object.main,
                                header: LB_object.head,
                                isFirstRowHeader: false
                            })
                            let composite_property = createPropertyBag( my_Table )
                            target_entity.properties = composite_property
                            resolve( dataSource )
                        } )
                })
        }
        function createPropertyBag( my_Table )
        {
            let propertyBag = new Cesium.PropertyBag()
            let header = my_Table.header
            header.forEach( head => 
                {
                    propertyBag.addProperty( head, createSampledProperty( my_Table, head ) )
                })
            return propertyBag
        }
        function createSampledProperty( my_Table, tableHeaderName )
        {
            // var property = tableHeaderName === 'Time (UTCG)' ? new Cesium.SampledProperty(String) : new Cesium.SampledProperty(Number)
            var property = new Cesium.SampledProperty(Number)
            // console.log(property)
            let dataSerie = my_Table.getColByName(tableHeaderName)
            let timeSerie = my_Table.getColByName('Time (UTCG)')
            let timeZoneOffset_h = new Date().getTimezoneOffset()/60
            timeSerie.forEach( ( timeString, index ) =>
            {
                let data = dataSerie[index]
                let time = Cesium.JulianDate.fromDate( new Date( Date.parse( timeString ) ) )
                Cesium.JulianDate.addHours( time, -timeZoneOffset_h, time )
                // console.log(Number( data ),data)
                let result_data = isNaN(Number( data )) ? 0 : Number( data )
                property.addSample( time, result_data )
            } )
            property.setInterpolationOptions({
                interpolationDegree : 3,
                interpolationAlgorithm : Cesium.HermitePolynomialApproximation
            });
            return property
        }
        return new Promise(function(resolve,reject)
        {
            var dataSourcePromise = Cesium.CzmlDataSource.load(materials.data.url)
            dataSourcePromise.then(dataSource=>
                {
                    console.log(dataSource)
                    let urls = [ materials.data.linkBudget_url1,  materials.data.linkBudget_url2]
                    let promises = []
                    urls.forEach( url => 
                        {
                            promises.push( linkBudgetIntegrationPromise( url, dataSource ) )
                        })
                    Promise.all( promises ).then( dataSource => 
                        {
                            if ( materials.callback ) materials.callback( dataSource, materials )
                        })
 
                })
            
            viewer.dataSources.add(dataSourcePromise);
            resolve(dataSourcePromise)
        })
    },
    post_processor:function(materials)
    {}
} 

const IMAGERY =
{
    materials:function(obj)
    {
        var Cesium = require('cesium/Cesium');
        let result = {Cesium,viewer:Cesium.viewer}
        Object.keys(obj).forEach(e=>result[e]=obj[e])
        return result
    },
    processor:function(materials)
    {
        var Cesium = materials.Cesium,
            viewer = materials.viewer
        return new Promise(function(resolve,reject)
        {
            var layer = viewer.imageryLayers.addImageryProvider(
                new Cesium.IonImageryProvider({ assetId: parseInt( materials.id) })
              );
            if(materials.callback) materials.callback(layer,materials)
            resolve(layer)
        })
    },
    post_processor:function(materials)
    {}
} 

const ProvincialRoadCameras =
{
    materials:function(obj)
    {
        var Cesium = require('cesium/Cesium');
        let result = {Cesium,viewer:Cesium.viewer}
        Object.keys(obj).forEach(e=>result[e]=obj[e])
        return result
    },
    processor:function(materials)
    {
        var Cesium = materials.Cesium,
            viewer = materials.viewer
        var IDs = [];
        var id = 0;
        function requestPromise(url,params = false)
        {
        
            if (params)
            {
                var url = new URL(url);
                Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
                return new Promise(function(resolve, reject)
                {
                    fetch(url)
                    .then(resp=>
                    {
                        resolve(resp.json())
                    })
                })
            }
            else
            {
                return new Promise(function(resolve, reject)
                {
                    fetch(url)
                    .then(resp=>
                    {
                        resolve(resp.json())
                    })
                })  
            }
        

        }
        function dragElement_connectionSvg(d,d2)
        {
            var dragItem = d;
            var dragItem2 = d2;
            var container = document;

            var active = false;
            var currentX;
            var currentY;
            var initialX;
            var initialY;
            var xOffset = 0;
            var yOffset = 0;

            container.addEventListener("touchstart", dragStart, false);
            container.addEventListener("touchend", dragEnd, false);
            container.addEventListener("touchmove", drag, false);

            container.addEventListener("mousedown", dragStart, false);
            container.addEventListener("mouseup", dragEnd, false);
            container.addEventListener("mousemove", drag, false);

            function dragStart(e) {
            if (e.type === "touchstart") {
                initialX = e.touches[0].clientX - xOffset;
                initialY = e.touches[0].clientY - yOffset;
            } else {
                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;
            }

            if (e.target === dragItem) {
                active = true;
            }
            }

            function dragEnd(e) {
            initialX = currentX;
            initialY = currentY;

            active = false;
            }

            function drag(e) {
            if (active) {
            
                e.preventDefault();
            
                if (e.type === "touchmove") {
                currentX = e.touches[0].clientX - initialX;
                currentY = e.touches[0].clientY - initialY;
                } else {
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                }

                xOffset = currentX;
                yOffset = currentY;

                setTranslate(currentX, currentY, dragItem, dragItem2);
            }
            }

            function setTranslate(xPos, yPos, el, el2) {
            el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
            el2.points.getItem(1).y = parseInt(yPos) + parseInt(el.style.height.replace('px',''))/2;
            el2.points.getItem(1).x = parseInt(xPos) + parseInt(el.style.width.replace('px',''))/2;
            el2.points.getItem(2).y = parseInt(yPos) + parseInt(el.style.height.replace('px',''))/2+50;
            el2.points.getItem(2).x = parseInt(xPos) + parseInt(el.style.width.replace('px',''))/2;
            }
        }
        function makeSVG(tag, attrs)
        {
            var el= document.createElementNS('http://www.w3.org/2000/svg', tag);
            for (var k in attrs)
                el.setAttribute(k, attrs[k]);
            return el;
        }
        function removeA(arr)
        {
            var what, a = arguments, L = a.length, ax;
            while (L > 1 && arr.length)
            {
            what = a[--L];
            while ((ax = arr.indexOf(what)) !== -1)
            {
                arr.splice(ax, 1);
            }
            }
            return arr;
        }
        function listeningFunction(Cesium,viewer,cameraDataSource)
        {
            var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
            handler.setInputAction(function (movement) 
            {
                var pickedFeature = viewer.scene.pick(movement.position);
                if (Cesium.defined(pickedFeature) && pickedFeature.id.properties.type._value === 'camara')
                {
                    var c_viewer = viewer.cesiumWidget._element
                    var v_div = document.createElement('div')
                    var ifrmheader = document.createElement('p');
                    var close = document.createElement('button');
                    var iframe = document.createElement('iframe');

                    v_div.id = 'cctv'+id;v_div.className = 'mydiv'; 
                    v_div.style.cssText = 
                    `
                        border-radius: 5px;
                        pointer-events: auto;
                        width: 400px;
                        height: 350px;
                        position: absolute;
                        top: 0px;
                        left: 0px;
                        z-index: 9;
                        background-color: #303336;
                        text-align: center;
                    `;
                    IDs.push(v_div.id);id++;

                    ifrmheader.id = 'ifrmheader';ifrmheader.innerText = pickedFeature.id.properties.id._value+'\n'+pickedFeature.id.properties.stakenumber._value;
                    ifrmheader.className = 'mydivheader';
                    ifrmheader.style.cssText = 
                    `
                        border-radius: 5px;
                        margin: 0px;
                        pointer-events: none;
                        padding: 5px;
                        border: solid #444;
                        cursor: move;
                        z-index: 10;
                        background-color: rgba(84, 84, 84, 1.0);
                        color: #fff;
                    `;

                    iframe.style.cssText = 
                    `
                    border: 3px solid rgb(68, 68, 68);
                    margin: 3px;
                    `;
                    iframe.width = '352';iframe.height = '288'; iframe.src = pickedFeature.id.properties.html._value; iframe.frameborder="0";
                    iframe.setAttribute('allowFullScreen', '');
                    
                    close.className = 'close';close.innerText = 'x';
                    close.style.cssText = 
                    `
                        margin: 2px;
                        background: #6d6d6d;
                        color: white;
                        border-radius: 4px;
                        border: 1px solid #444;
                        float: left;
                    `;
                    close.onclick = function()
                    {
                        v_div.remove();
                        svg.remove();
                        removeA(IDs,v_div.id);
                    }
                    
                    

                    var kv = {'stakenumber':pickedFeature.id.properties.stakenumber._value};

                    v_div.appendChild(close);
                    v_div.appendChild(ifrmheader);
                    v_div.appendChild(iframe);
                    c_viewer.appendChild(v_div);

                    var svg = makeSVG('svg',{class:'connectionSvg',id:'connectionSvg'});
                    svg.style.cssText = 
                    `
                        pointer-events: none;
                        position: absolute;
                        top: 0px;
                        left: 0px;
                        height: -webkit-fill-available;
                        width: -webkit-fill-available;
                    `;
                    var polygon = makeSVG('polygon',{points:"10 50 100 60 100 40", fill:"#4c4c4c", stroke:"#c3c3c3", 'stroke-linecap':"round", 'stroke-width':"1"});
                    svg.appendChild(polygon);
                    c_viewer.appendChild(svg);

                    function onTickCallBack (clock)
                    {
                        var isEntityVisible = true;
                        var scratch3dPosition = new Cesium.Cartesian3();
                        var scratch2dPosition = new Cesium.Cartesian2();
                        var position3d;
                        var position2d;
                        if (pickedFeature.id != undefined)
                        {
                            if (pickedFeature.id.position)
                            {
                                position3d = pickedFeature.id.position.getValue(clock.currentTime, scratch3dPosition);
                            }
                            if (position3d)
                            {
                                position2d = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
                                viewer.scene, position3d, scratch2dPosition);
                            }
                            if (position2d) 
                            {
                                polygon.points.getItem(0).x  = position2d.x;
                                polygon.points.getItem(0).y = position2d.y;
                                
                                if (!isEntityVisible)
                                {
                                    isEntityVisible = true;
                                    testElement.style.display = 'block';
                                }
                            } 
                            if(!viewer.dataSources.contains(cameraDataSource))
                            {
                                var closeTargets = viewer.cesiumWidget.creditViewport.getElementsByClassName('close');
                                for (var i = 0; i < closeTargets.length; i++)
                                {
                                    var target = closeTargets[i];
                                    target.click();
                                }
                                if (cameraDataSource.show === false)
                                {
                                    viewer.clock.onTick.removeEventListener(onTickCallBack);
                                }
                            }
                        }

                        else
                        {
                            var closeTargets = viewer.cesiumWidget.creditViewport.getElementsByClassName('close');
                            for (var i = 0; i < closeTargets.length; i++)
                            {
                                var target = closeTargets[i];
                                target.click();
                            }
                            if (cameraDataSource.show === false)
                            {
                                viewer.clock.onTick.removeEventListener(onTickCallBack);
                            }
                        }
                        
                        
                    }
                    viewer.clock.onTick.addEventListener(onTickCallBack);
                    dragElement_connectionSvg(v_div,polygon);
                }
                
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
            
        }
        
        return new Promise(function(resolve,reject)
        {
            requestPromise(materials.source_url).then
            (camaras=>
            {
                var eco = new Cesium.EntityCollection();
                var cameraDataSource = new Cesium.CustomDataSource('cameraDataSource');
                for (var i = 0; i < camaras.length; i++)
                {
                    var camera = camaras[i];
                    var properties = new Cesium.PropertyBag(camera);
                    properties.addProperty('type','camara');
                    var czml = 
                    {
                        name:name,
                        properties:camera,
                        position:{}

                    }
                    var newE = new Cesium.Entity
                    ({
                        name:name,
                        properties:properties,
                        position : Cesium.Cartesian3.fromDegrees(camera.gisx,camera.gisy),
                        billboard : {
                        image: 'https://gis.nadi3docms.com/DataSource/icon/cctv.png', // default: undefined
                        show: true, // default
                        scaleByDistance: new Cesium.NearFarScalar(1000, 0.7, 300000, 0.05),
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // default: CENTER
                        scale: 0.3, // default: 1.0
                        // heightReference : Cesium.HeightReference.CLAMP_TO_GROUND
                    },
                        description :                   
                                '<table class="cesium-infoBox-defaultTable cesium-infoBox-defaultTable-lighter"><tbody>' +
                                '<tr><th>' + "id" + '</th><td>' + camera.id + '</td></tr>' +
                                '<tr><th>' + "stakenumber" + '</th><td>' + camera.stakenumber + '</td></tr>' +
                                '</tbody></table></p>' +
                                '<p>Developer: <a style = "color:WHITE" target = "_blank" href = "https://topic.cw.com.tw/test/2019ipo/team/team7.html">NADI System</a></p>'
                    });
                eco.add(newE)

                }
                cameraDataSource._entityCollection = eco;
                viewer.dataSources.add(cameraDataSource);
                listeningFunction(Cesium,viewer,cameraDataSource);
                if(materials.callback) materials.callback(cameraDataSource,materials)
                resolve(cameraDataSource);
            })

        })
    },
    post_processor:function(materials)
    {}
} 

const kml =
{
    materials:function(obj)
    {
        var Cesium = require('cesium/Cesium');
        let result = {Cesium,viewer:Cesium.viewer}
        Object.keys(obj).forEach(e=>result[e]=obj[e])
        return result
    },
    processor:function(materials)
    {
        var Cesium = materials.Cesium,
            viewer = materials.viewer
        return new Promise(function(resolve,reject)
        {
            var kmlDataSource = new Cesium.KmlDataSource
            ({
              camera: viewer.scene.camera,
              canvas: viewer.scene.canvas
            })
            kmlDataSource.load(materials.data).then(dataSource=>
                {
                    if(materials.callback) materials.callback(dataSource,materials)
                })
            var result = viewer.dataSources.add(kmlDataSource)
            resolve(result)
        })
    },
    post_processor:function(materials)
    {

    }
} 
const kmz =
{
    materials:function(obj)
    {
        var Cesium = require('cesium/Cesium');
        let result = {Cesium,viewer:Cesium.viewer}
        Object.keys(obj).forEach(e=>result[e]=obj[e])
        return result
    },
    processor:function(materials)
    {
        var Cesium = materials.Cesium,
            viewer = materials.viewer
        return new Promise(function(resolve,reject)
        {
            var kmlDataSource = new Cesium.KmlDataSource
            ({
              camera: viewer.scene.camera,
              canvas: viewer.scene.canvas
            })
            kmlDataSource.load(materials.data)
            .then(function (dataSource) 
            {
                var headerCollection = []
                var entities = dataSource.entities.values
                function getKmlTableRows(description)
                {
                    let parser = new DOMParser(description);
                    let tableDoc = parser.parseFromString(description, "text/xml");
                    let rows = tableDoc.getElementsByTagName('tr')
                    return rows
                }
                function collectTableHeader(header = [],description)
                {
                    let rows = getKmlTableRows(description)
                    for(let r = 0; r < rows.length; r++)
                    {
                        let row = rows[r]
                        if(row.children.length>1)
                        {
                            let key = row.children[0].innerHTML
                            header.includes(key) ? 'pass' : header.push(key)
                        }
                    }
                    return header
  
                }
                for(let i = 0; i < entities.length; i++)
                {
                    let entity = entities[i]
                    let description = entity.description ? entity.description._value : ''
                    headerCollection = collectTableHeader(headerCollection,description)
                }
                for(let i = 0; i < entities.length; i++)
                {
                    let entity = entities[i]
                    let description = entity.description ? entity.description._value : ''
                    let propertyBag = {}
                    headerCollection.forEach(e=>{propertyBag[e] = NaN})
                    let rows = getKmlTableRows(description)
                    for(let r = 0; r < rows.length; r++)
                    {
                        let row = rows[r]
                        if(row.children.length>1)
                        {
                            let key = row.children[0].innerHTML
                            let value = row.children[1].innerHTML
                            propertyBag[key] = value
                        }
                    }
                    entity.properties = new Cesium.PropertyBag(propertyBag);
                }
                if(materials.callback) materials.callback(dataSource,materials)
            })
            var result = viewer.dataSources.add(kmlDataSource)
            resolve(result)
            
        })
    },
    post_processor:function()
    {}
} 

const geojson =
{
    materials:function(obj)
    {
        var Cesium = require('cesium/Cesium');
        let result = {Cesium,viewer:Cesium.viewer}
        Object.keys(obj).forEach(e=>result[e]=obj[e])
        return result
    },
    processor:function(materials)
    {
        var Cesium = materials.Cesium,
            viewer = materials.viewer
            Cesium.GeoJsonDataSource.clampToGround = true
        var simpleStyleIdentifiers = [
            // "title",
            // "description", //
            "marker-size",
            "marker-symbol",
            "marker-color",
            "stroke", //
            "stroke-opacity",
            "stroke-width",
            "fill",
            "fill-opacity",
            ];
        return new Promise(function(resolve,reject)
        {
            var geojsonDataSource = new Cesium.GeoJsonDataSource(materials.name)
            geojsonDataSource.load(materials.data)
            .then(dataSource=>
                {
                    var entities = dataSource.entities.values
                    for (let i = 0; i < entities.length; i++)
                    {
                        let entity = entities[i]
                        var propNames = entity.properties.propertyNames
                        // console.log(111)
                        simpleStyleIdentifiers.every(styleName=>
                            {
                                if ( propNames.includes(styleName) ) { return false }
                                else 
                                { 
                                    // console.log(111111,propNames)
                                    entity.billboard = undefined
                                    return true 
                                }
                            })
                        
                        if(entity.position)
                        {
                            entity.point = new Cesium.PointGraphics
                            ({
                                color:Cesium.Color.WHITE,
                                pixelSize:5
                            })
                        }
                    }
                    if(materials.callback) materials.callback(dataSource,materials)
                })
            var result = viewer.dataSources.add(geojsonDataSource);
            resolve(result)
        })
    },
    post_processor:function(dataSource,materials)
    {
        // dataSource.loadingEvent.addEventListener(()=>
        // {
        //     var entities = dataSource.entities.values
        //     for (let i = 0; i < entities.length; i++)
        //     {
        //         let entity = entities[i]
        //         if(entity.position)
        //         {
        //             entity.point = new Cesium.PointGraphics
        //             ({
        //                 color:Cesium.Color.WHITE,
        //                 pixelSize:5
        //             })
        //         }
        //     }
        // })
    }
} 




const ProcessType = 
{

    "3DTILES":ThreeDTILE,
    GLTF,
    CZML,
    CZML_LinkBudget,
    IMAGERY,
    ProvincialRoadCameras,
    kml,
    kmz,
    geojson,
    WMTS_META_SOURCE

}

export default ProcessType