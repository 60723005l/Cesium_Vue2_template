const Cesium = require('cesium/Cesium');
import GIAP from '@/lib/GIAP'


class GeoJSONGeomertry
{
    constructor( option = {} )
    {
        this.type = option.type || undefined
        this.coordinates = option.coordinates  || undefined
    }

}
class GeoJSONFeature
{
    constructor()
    {
        this.type = "Feature"
        this.geometry = new GeoJSONGeomertry()
        this.properties = {}
    }
}
class FeatureCollention
{
    constructor( option = {} )
    {
        this._features = option.features || []
    }
    get features()
    {
        return this._features
    }
    addByArray(arr)
    {
        arr.forEach(item=>
            {
                if ( item instanceof GeoJSONFeature )
                {
                    this._features.push(item)
                }
            })
    }
    add(feature)
    {
        if ( feature instanceof GeoJSONFeature )
        {
            this._features.push(feature)
        } 
    }
}
class GeoJsonDataSource
{
    constructor()
    {
        this.type = "FeatureCollection"
        this.featureCollection = new FeatureCollention()
    }
    export()
    {
        var result = {
            type: this.type,
            features: this.featureCollection.features
        }
        return JSON.stringify(result)
    }

}

function createFeatureFromEntityGeomType(entity,geomType)
{
    let feature = new GeoJSONFeature()
    switch ( geomType )
    {
        case 'point':
            feature.geometry.type = 'Point'
            var pos_deg = GIAP.cart3toDegree(entity.position._value)
            feature.geometry.coordinates = [ pos_deg.x, pos_deg.y ]
            break
        case 'polyline':
            feature.geometry.type = 'LineString'
            var pos_degs = entity.polyline.positions._value.map( cart3 => 
                {
                    let deg = GIAP.cart3toDegree(cart3)
                    return [deg.x, deg.y]
                } )
            feature.geometry.coordinates = pos_degs
            break
        case 'polygon':
            feature.geometry.type = 'Polygon'
            var pos_degs = 
                entity.polygon.hierarchy._value.positions.map( cart3 => 
                    {
                        let deg = GIAP.cart3toDegree(cart3)
                        return [deg.x, deg.y]
                    } )
            // console.log(entity, GIAP)
            pos_degs.push(pos_degs[0])
            feature.geometry.coordinates = [pos_degs]
            break
    }
    let propNames = entity.properties === undefined ? [] : entity.properties.propertyNames
    propNames.forEach(name=>
        {
            feature.properties[name] = entity.properties[name].getValue()
        })
    // console.log(feature)
    return feature
}


class DataSourceConverter
{
    constructor( importDataSource )
    {
        this.importDataSource = importDataSource || undefined
        this.outputDataSource = undefined
        this.checkGeomTypes = ['point', 'polyline', 'polygon']
    }
    get isImportDatasourceAssigned()
    {
        return this.importDataSource === undefined ? false : true
    }
    isGeomTypeExist(entity,geomType)
    {
        return entity[geomType] === undefined ? false : true
    }
    toGeoJSON()
    {
        if ( !this.isImportDatasourceAssigned ) return

        var newGeoJsonDataSource = new GeoJsonDataSource()
        let entities = this.importDataSource.entities.values
        for ( let i = 0; i < entities.length; i++ )
        {
            let entity = entities[i]
            this.checkGeomTypes.forEach(geomType=>
                {
                    if ( this.isGeomTypeExist(entity,geomType) )
                    {
                        let feature = createFeatureFromEntityGeomType(entity,geomType)
                        newGeoJsonDataSource.featureCollection.add(feature)
                    }
                })
        }
        this.outputDataSource = newGeoJsonDataSource.export()
        saveText( this.outputDataSource, this.importDataSource.name || 'export_geojson', 'geojson')
        return this.outputDataSource

    }
}




function saveText(text, filename, Extension)
{
    var a = document.createElement('a');
    a.setAttribute('href', `data:text/plain;charset=utf-8,`+encodeURIComponent(text));
    a.setAttribute('download', filename+'.'+Extension);
    a.click()
}

export default DataSourceConverter