

class DataCenter
{
    constructor(name,viewer,Cesium)
    {
        this.name = name
        this.viewer = viewer
        this.Cesium = Cesium
        this.dataList = []
        this.deepDataList = []
    }
    removeByID(id)
    {
        var viewer = this.viewer
        var data_index = this.dataList.map(e=>e.id).indexOf(id)
        var dataSource =this.deepDataList[data_index]
        
        this._remove(dataSource)
        this.dataList.splice(data_index,1)
        this.deepDataList.splice(data_index,1)
    }
    removeByName(name)
    {
        var viewer = this.viewer
        var data_index = this.dataList.map(e=>e.name).indexOf(name)
        var dataSource =this.deepDataList[data_index]
        
        this._remove(dataSource)
        this.dataList.splice(data_index,1)
        this.deepDataList.splice(data_index,1)
    }
    remove(obj)
    {
        // console.log(99999,obj)
        var viewer = this.viewer
        var data_index = this.dataList.map(e=>e.id).indexOf(obj.id)
        var dataSource =this.deepDataList[data_index].dataSource
        // console.log(data_index,dataSource,this.deepDataList)
        this._remove(dataSource)
        this.dataList.splice(data_index,1)
        this.deepDataList.splice(data_index,1)
    }
    getFactoryById(id)
    {
        var filter_arr = this.deepDataList.filter( data => data.id === id )
        return filter_arr[0]
    }
    getFactory(shallowFactory)
    {
        var filter_arr = this.deepDataList.filter( data => data.id === shallowFactory.id )
        return filter_arr[0]
    }
    _remove(dataSource)
    {
        var viewer = this.viewer
        var isRemove
        if(dataSource.pp_stages)
        {
            console.log('pp_stages 1',true)
            var pp_stages_flat = dataSource.pp_stages.flat()
            pp_stages_flat.forEach(pp=>viewer.scene.postProcessStages.remove(pp))
             
        }
        isRemove = viewer.scene.primitives.remove(dataSource)
        console.log('remove primitives',isRemove)
        if(!isRemove)
        {
            isRemove = viewer.dataSources.remove(dataSource)
            console.log('remove dataSources',isRemove)
            if(!isRemove)
            {
                isRemove = viewer.entities.remove(dataSource)
                console.log('remove entities',isRemove)
                if(!isRemove)
                {
                    isRemove = viewer.imageryLayers.remove(dataSource)
                    console.log('remove imageryLayers',isRemove)
                    if(!isRemove)
                    {
                        isRemove = viewer.scene.postProcessStages.remove(dataSource)
                        console.log('pp_stages 2',isRemove)
                    }
                }

            }
        }
    }
    import(obj)
    {
        this.dataList.push(obj.shallow())
        this.deepDataList.push(obj)
    }
}

class ShallowDataSource
{
    constructor()
    {
        this._show = true
    }
    set show( bool )
    {

    }
}

class ShallowFactory
{
    constructor(name, id, complete, dataSource)
    {
        this.name = name
        this.id = id
        this.complete = complete
        this.dataSource = dataSource
    }
}

class DataFactory
{
    constructor(option)
    {
        this.dataCenter = option.dataCenter || undefined
        this.name = option.name
        this.id = option.id || this._uuid()
        this._materials = option.materials
        this._processor = option.processor || Promise
        this._post_processor = option.post_processor
        this.complete = false,
        this.dataSource = undefined
        this.init()
    }
    init()
    {
        this._processor(this._materials).then(data=>
            {
                this.dataSource = data
                this._post_processor(data,this._materials)
                this.complete = true
                if(this.dataCenter)
                {
                    this.deliverTo(this.dataCenter)
                }
                
            })
    }
    shallow()
    {
        return{
            name: this.name,
            id: this.id,
            complete: this.complete,
            type:this._materials.type
        }
    }
    deliverTo(center = DataCenter)
    {
        if(this.complete){center.import(this)}
        else{console.log('DataFactory is still working')}
    }
    onComplete(callback=()=>{})
    {
        var self = this
        return new Promise(function(resolve,reject)
        {
            
            function waitUntil()
            {
                if(self.complete===false)
                {
                    setTimeout(waitUntil,50)
                }
                else
                {
                    callback()
                    resolve(this)
                }
            }
            waitUntil()
        })
    }
     _uuid()
     {
        var d = Date.now();
        if (typeof performance !== 'undefined' && typeof performance.now === 'function')
        {
          d += performance.now(); //use high-precision timer if available
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c)
        {
          var r = (d + Math.random() * 16) % 16 | 0;
          d = Math.floor(d / 16);
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
      }
}


function exportKML(dataSourcePromise,filename)
{
    var Cesium = require('cesium/Cesium');
    function downloadBlob(filename, blob) {
        if (window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveBlob(blob, filename);
        } else {
          var elem = window.document.createElement("a");
          elem.href = window.URL.createObjectURL(blob);
          elem.download = filename;
          document.body.appendChild(elem);
          elem.click();
          document.body.removeChild(elem);
        }
      }
    Cesium.exportKml
    ({
        entities: dataSourcePromise.entities,
        kmz: true,
    }).then(function (result){downloadBlob(`${filename}.kmz`, result.kmz);})
    .otherwise(console.error);
}


export {DataCenter, DataFactory, exportKML}