const Cesium = require('cesium/Cesium');
// import HM from '@/lib/HeatMap/CesiumHeatmap.js'
import GIAP from '@/lib/GIAP'



class Colorbar
{
    constructor(input_colors)
    {
        this.input_colors = input_colors || []
    }
    add(hex)
    {
        this.input_colors.push(hex)
    }
    get cssText()
    {
        var input_colors = this.input_colors,
            color_len = input_colors.length

        if (color_len < 2)
        {
            if(color_len === 0)
            {
                return 'white'
            }
            else
            {
                console.log('input_colors not enough')
            }
        }
        else
        {
            var color_first = input_colors[0],
                color_last = input_colors[color_len-1]
            var cssInnerText = '',
                result = ''
            input_colors.forEach((color,index)=>
            {
                let perc = index * (100/(color_len-1))
                cssInnerText+=`, ${color} ${perc}%`
            })
            result = `linear-gradient(90deg ${cssInnerText})`
            return result
        }
    }

}

class HeatMapGenerator
{
    constructor(option = {})
    {
        this.viewer = option.viewer
        this.Cesium = option.Cesium
        this.entities = option.entities
        this.fieldName = option.fieldName
        this.datas = option.datas || []
        this.bounds = option.bounds || {}
        this.backgroundColor = option.backgroundColor || "rgba(0,0,0,0)",
        this.radius = option.radius || 50,
        this.maxOpacity = option.maxOpacity || .5,
        this.minOpacity = option.minOpacity || .5,
        this.blur = option.blur || .85,
        this.gradient = option.gradient || []
    }
    setData(entities)
    {
        var fieldName = this.fieldName
        var viewer = this.viewer
        var entities = selectedLayer.dataSource.entities.values
        var dataset = getData(fieldName)
        this.datas = dataset
        this.bounds = this.createBounds(this.datas)
        function getData(fieldName = '')
        {
            var result = []
            for(let i = 0; i < entities.length; i++)
            {
                let entity = entities[i]
                let position_cart3 = entity.position ? entity.position.getValue(viewer.clock.currentTime) : false
                if(position_cart3)
                {
                    let position_deg = GIAP.cart3toDegree(position_cart3)
                    let propVal = entity.properties[fieldName] ? entity.properties[fieldName].getValue() : 2
                    let item = {
                        x:position_deg.x,
                        y:position_deg.y,
                        value:propVal
                    }
                    result.push(item)
                }

            }
            return result
        }
    }
    createBounds(data)
    {
        return {
            west: Math.min(...data.map((i)=>i.x)),
            south: Math.min(...data.map((i)=>i.y)),
            east: Math.max(...data.map((i)=>i.x)),
            north: Math.max(...data.map((i)=>i.y)),
        };
    }
    hexArray_to_CssColorArray(array)
    {
        
        var gradien_rbgs = new GIAP.Gradient().fromHexs(array,10)
        var len = gradien_rbgs.length
        var result = {}
        gradien_rbgs.forEach((rbg,index)=>
            {
                // console.log(index/(len-1),index,len-1)
                var val = GIAP.Math.lerp(0.01, 0.99, index/(len-1)).toString().substring(1)
                var rbgText = new Cesium.Color(rbg.r/255, rbg.g/255, rbg.b/255).toCssColorString()
                result[val] = rbgText
            })
        // console.log(result)
        return result

    }
    add()
    {
        var Cesium = this.Cesium
        var viewer = this.viewer
        var data = this.datas
        var bounds = this.bounds
        var min_val = Math.min(...data.map((i)=>i.value))
        var max_val = Math.max(...data.map((i)=>i.value))

        var heatMap = CesiumHeatmap.create(
            viewer,
            bounds,
            {
                backgroundColor: this.backgroundColor,
                radius: this.radius,///7.5,
                maxOpacity: this.maxOpacity,
                minOpacity: this.minOpacity,
                blur: this.blur,
                gradient: this.hexArray_to_CssColorArray(this.gradient)
            }
        );
        heatMap.setWGS84Data(0, max_val*2,data);
        heatMap._layer.heatMap = heatMap
        return heatMap
    }
}

class FieldCollection
{
    constructor(entities)
    {
        this.entities = entities
    }
    collectByKey()
    {
        var entities = this.entities
        var props_collection = {}
        for(let i = 0; i < entities.length; i++)
        {
            let entity = entities[i]
            let prop = entity.properties
            let names = prop.propertyNames
            names.forEach(name=>
            {
                // if (!props_collect.includes(name)) props_collect.push(name)
                if(props_collection[name] === undefined)
                {
                    props_collection[name] = {type:undefined,values:[]};
                }
                let prop_value = prop[name].getValue(),
                    type = typeof(prop_value)
                props_collection[name].type = type
                props_collection[name].values.push( prop_value )
            })
        }
        return props_collection
    }
    collectByValue(fieldName)
    {
        var entities = this.entities
        var props_collection = {}
        for(let i = 0; i < entities.length; i++)
        {
            let entity = entities[i]
            let prop = entity.properties
            let prop_value = prop[fieldName] === undefined ? 'undefined' : prop[fieldName].getValue()

            if (props_collection[prop_value]===undefined)
            {
                props_collection[prop_value] = []
            }
            props_collection[prop_value].push(entity)
        }
        return props_collection
    }
    get_names()
    {
        // console.log(this.entities)
        var entities = this.entities
        var field_names = []
        for(let i = 0; i < entities.length; i++)
        {
            let entity = entities[i]
            entity.index = i
            // entity.select = false
            let prop = entity.properties
            if ( prop === undefined)
            {

            }
            else
            {
                let names = prop.propertyNames
                names.forEach(name=>
                {
                    if (!field_names.includes(name)) field_names.push(name)
                })
            }

        }
        return field_names
    }
    get_values(fieldName)
    {
        var entities = this.entities
        var field_values = []
        for(let i = 0; i < entities.length; i++)
        {
            let entity = entities[i]
            let prop = entity.properties
            let prop_value = prop[fieldName] === undefined ? undefined : prop[fieldName].getValue()
            if (!field_values.includes(prop_value)) field_values.push(prop_value)
        }
        return field_values 
    }
}

class Field
{
    constructor(option = {})
    {
        this.current = option.current || ''
        this.values = option.values || []
        this.mode = ''
        // this.collectionByKey = option.collectionByKey || {}
        // this.collectionByValue = option.collectionByValue || {}
        this.isActive = false
    }
}
class Classes
{
    constructor(option = {})
    {
        this.value = option.value || undefined
        this.isActive = false
    }
}
class UniqeColorSchema
{
    constructor(option = {})
    {
        this.material = option.material || ''
        this.material_alpha = option.material_alpha || 1
        this.isActive = false
    }
}
class DensitySchema
{
    constructor(option = {})
    {
        this.backgroundColor = option.backgroundColor || "rgba(0,0,0,0)"
        this.radius = option.radius || 50
        this.maxOpacity = option.maxOpacity || .5
        this.minOpacity = option.minOpacity || .5
        this.blur = option.blur || .85
        this.gradient = option.gradient || []
    }
}
class Color
{
    constructor(option = {})
    {
        this.gradientSchema = option.gradientSchema || []
        this.uniqeColorSchema = option.uniqeColorSchema || {}
        this.densitySchema = option.densitySchema || new DensitySchema()
        this.material = option.material || ''
        this.material_alpha = option.material_alpha || 0.5
        this.isActive = false
    }
}
class Size
{
    constructor(option = {})
    {
        this.min_size = option.min_size || undefined
        this.max_size = option.max_size || undefined
        this.size = option.size || undefined
        this.isActive = false
    }
}
class OutlineColor
{
    constructor(option = {})
    {
        this.outlineColor = option.outlineColor || ''
        this.outlineColor_alpha = option.outlineColor_alpha || 1
        this.isActive = false
    }
}
class OutlineWidth
{
    constructor(option = {})
    {
        this.outlineWidth = option.outlineWidth || undefined
        this.isActive = false
    }
}
class StyleViewModel
{
    constructor(option = {})
    {
        this.field = option.field || new Field()
        this.classes = option.classes || new Classes()
        this.color = option.color || new Color()
        this.size = option.size || new Size()
        this.outlineColor = option.outlineColor || new OutlineColor()
        this.outlineWidth = option.outlineWidth || new OutlineWidth()
    }
}

/*
const ViewModel = 
{
    field://Classify
    {
        current:'',
        values:[],
        collection:{}
    },
    classes:0,//Classify
    color:
    {
        gradientSchema:[],//Classify
        material:'',
        material_alpha:0.5,
        outlineColor_alpha:0.5
    },
    size:
    {
        min_size:1,//Classify
        max_size:10,//Classify
        size:1
    },
    outlineColor:
    {
        outlineColor:'',
        outlineColor_alpha:''
    },
    outlineWidth:
    {
        outlineWidth:''
    },
}
*/

class CesiumStyler
{
    constructor(option = {})
    {
        this.viewModel = option.viewModel || new StyleViewModel()
        this.viewer = option.viewer
        this.geomType = option.geomType,
        this.entities = option.entities,
        this.parent_dataSource = option.parent_dataSource || undefined
    }
    applyChanges()
    {
        // console.log('applyChanges',this.entities.length,this)
        var viewModel = this.viewModel
        for(let i = 0; i < this.entities.length; i++)
        {
            let entity = this.entities[i]
            this.applyMaterial(entity,viewModel.color)
            this.applySize(entity,viewModel.size)
            this.applyOutlineColor(entity,viewModel.outlineColor)
            this.applyOutlineWidth(entity,viewModel.outlineWidth)
        }
    }
    applyChanges_byField()
    {
        // console.log(this.viewModel)
        var viewModel = this.viewModel,
            classes = viewModel.classes.value > 0 ? viewModel.classes.value : undefined,
            field = viewModel.field,
            hexs = viewModel.color.gradientSchema.length > 1 ? viewModel.color.gradientSchema : undefined,
            size = viewModel.size,
            uniqe_colorSchema = viewModel.color.uniqeColorSchema,
            densitySchema = viewModel.color.densitySchema,
            datas_for_density = []
        
        var fieldCollection_byKey = field.current.length > 0 && field.mode === 'Classify' ? new FieldCollection(this.entities).collectByKey() : undefined,
            fieldCollection_byValue = field.current.length > 0 && field.mode === 'Uniqe' ? new FieldCollection(this.entities).collectByValue() : undefined,
            min_field_val = fieldCollection_byKey != undefined ? Math.min(...fieldCollection_byKey[field.current].values) : 0,
            max_field_val = fieldCollection_byKey != undefined ? Math.max(...fieldCollection_byKey[field.current].values) : 0,
            gradient_RGBs = hexs ? new GIAP.Gradient().fromHexs(hexs,classes) : undefined
        

        // console.log(this.entities.length, 'entities are going to apply style')
        for(let i = 0; i < this.entities.length; i++)
        {
            let entity = this.entities[i]
            // console.log(field.current.length,field)
            if(field.current.length > 0 || field.mode === 'Density')
            {

                // console.log('detected field:',entity,field.current)
                
                let field_val = entity.properties === undefined ? undefined : entity.properties[field.current] === undefined ? undefined : entity.properties[field.current].getValue()
                // console.log('detected field value:',field_val)
                if(field_val != undefined || field.mode === 'Density')
                {
                    // console.log(99999)
                    switch (field.mode)
                    {
                        case 'Classify':
                            // console.log('Classify')
                            let field_val_lerp_pos = GIAP.Math.invlerp(min_field_val,max_field_val,field_val)
                            var target_hex = this.getHEX_fromGradientRGB_byPosition(gradient_RGBs, field_val_lerp_pos, classes)
                            // console.log('target_rgb',target_hex)

                            var target_size = GIAP.Math.lerp(size.min_size, size.max_size, field_val_lerp_pos)
                            target_size = isNaN(target_size) ? undefined : target_size
                        
                            let vm_material = {material:target_hex,material_alpha:0.9}
                            let vm_size = {size:target_size}
                            // console.log(target_hex,target_size)
                            this.applyMaterial(entity,vm_material)
                            this.applySize(entity,vm_size)
                            this.applyOutlineColor(entity,viewModel.outlineColor)
                            this.applyOutlineWidth(entity,viewModel.outlineWidth)
                            break;

                        case 'Uniqe':
                            // console.log('Uniqe')
                            // console.log(888,uniqe_colorSchema,field_val)
                            let color = uniqe_colorSchema[field_val]
                            this.applyMaterial(entity,color)
                            break;

                        case 'Density':
                            // console.log('Density')
                            // console.log(entity,position_cart3)
                            if ( entity.point.pixelSize ) entity.point.pixelSize = 1
                            let position_cart3 = entity.position ? entity.position.getValue(this.viewer.clock.currentTime) : false
                            field_val = field_val === undefined ? 1 : field_val
                            if(position_cart3)
                            {
                                let position_deg = GIAP.cart3toDegree(position_cart3)
                                let item = {
                                    x:position_deg.x,
                                    y:position_deg.y,
                                    value:field_val
                                }
                                // console.log(item)
                                datas_for_density.push(item)

                            }
                            break;
                    }

                }

            }
            else
            {
                // console.log('normal styling')
                // console.log('*****',entity.properties[field.current])
                this.applyMaterial(entity,viewModel.color)
                this.applySize(entity,viewModel.size)
                this.applyOutlineColor(entity,viewModel.outlineColor)
                this.applyOutlineWidth(entity,viewModel.outlineWidth)
            }
        }
        if (field.mode === 'Density')
        {
            // console.log('Density2')
            var dataSource = this.parent_dataSource
            var heatMapGenerator = new HeatMapGenerator
            ({
                viewer: this.viewer,
                Cesium,
                entities: this.entities,
                fieldName: field.current
            })
            heatMapGenerator.datas = datas_for_density
            heatMapGenerator.bounds = heatMapGenerator.createBounds(datas_for_density)
            heatMapGenerator.radius = densitySchema.radius,
            heatMapGenerator.maxOpacity = densitySchema.maxOpacity,
            heatMapGenerator.minOpacity = densitySchema.minOpacity,
            heatMapGenerator.blur = densitySchema.blur,
            heatMapGenerator.gradient = densitySchema.gradient
            // console.log(densitySchema,heatMapGenerator)

            if (dataSource.densityMapInstance)
            {
                dataSource.densityMapInstance
                dataSource.entities.remove(dataSource.densityMapInstance._layer)
            }

            var densityMapInstance = heatMapGenerator.add()
            dataSource.densityMapInstance = densityMapInstance
            dataSource.entities.add(densityMapInstance._layer)
            this.viewer.entities.remove(densityMapInstance._layer)
            


            // console.log(densityMapInstance)
        }
    }
    getHEX_fromGradientRGB_byPosition(gradient_RGBs,field_val_lerp_pos,classes)
    {
        var target_hex = undefined
        var target_rgb = gradient_RGBs ? gradient_RGBs[ Math.floor( field_val_lerp_pos * (classes-1) ) ] : undefined
        if (target_rgb)
        {
            target_rgb.r = Math.floor(target_rgb.r)
            target_rgb.g = Math.floor(target_rgb.g)
            target_rgb.b = Math.floor(target_rgb.b)
            target_hex = new GIAP.Gradient().rgbToHex(target_rgb)
        }
        return target_hex
    }
    getSIZE_fromSizeRange_byPosition(size_range, field_val_lerp_pos, classes)
    {
        var target_size = size_range ? size_range[ Math.floor( field_val_lerp_pos * (classes-1) ) ] : undefined
        return target_size
    }
    applyMaterial(entity,viewModel,field)
    {
        // console.log('applyMaterial 1')
        // var viewer = this.viewer
        if(viewModel.material && viewModel.material_alpha)
        {
            // console.log('applyMaterial 1',Cesium.Color.fromCssColorString(viewModel.material))
            let newColor = Cesium.Color.fromCssColorString(viewModel.material).withAlpha(parseFloat(viewModel.material_alpha))
            entity[this.geomType].material = newColor
            entity[this.geomType].color = newColor
        }
    }
    applySize(entity,viewModel,field)
    {
        // var viewer = this.viewer
        if(viewModel.size != undefined)
        {
            // console.log('apply size',this.viewModel.size)
            entity[this.geomType].pixelSize = parseFloat(viewModel.size)
            entity[this.geomType].width = parseFloat(viewModel.size)

        }
        // else console.log('no apply size')
    }
    applyOutlineColor(entity,viewModel,field)
    {
        // var viewer = this.viewer
        if(viewModel.outlineColor && viewModel.outlineColor_alpha)
        {
            let newColor = Cesium.Color.fromCssColorString(viewModel.outlineColor).withAlpha(parseFloat(viewModel.outlineColor_alpha))
            entity[this.geomType].outlineColor = newColor
        }
    }
    applyOutlineWidth(entity,viewModel,field)
    {
        // var viewer = this.viewer
        if(viewModel.outlineWidth)
        {
            entity[this.geomType].outlineWidth = parseFloat(viewModel.outlineWidth)
            entity[this.geomType].outline = true
        }
    }
}

// CesiumStyler.GradientColor = GradientColor
CesiumStyler.get_entities_byGeomKey = function(obj)
{
    
    var entities = obj.entities.values
    var result = {}
    // console.log(entities.length,entities)
    for(let i = 0; i < entities.length; i++)
    {
        let entity = entities[i]
        if(entity.point)
        {
            if(result.point) result.point.push(entity)
            else result.point = [entity]
        }
        if(entity.polygon)
        {
            if(result.polygon) result.polygon.push(entity)
            else result.polygon = [entity]
        }
        if(entity.polyline)
        {
            if(result.polyline) result.polyline.push(entity)
            else result.polyline = [entity]
        }
    }
    
    return result 
}
CesiumStyler.get_fieldCollection_byEntities = function(entities)
{
    var props_collection = {}
    for(let i = 0; i < entities.length; i++)
    {
        let entity = entities[i]
        let prop = entity.properties
        let names = prop.propertyNames
        names.forEach(name=>
        {
            // if (!props_collect.includes(name)) props_collect.push(name)
            if(props_collection[name] === undefined)
            {
                props_collection[name] = {type:undefined,values:[]};
            }
            let prop_value = prop[name].getValue(),
                type = typeof(prop_value)
            props_collection[name].type = type
            props_collection[name].values.push( prop_value )
        })
    }
    return props_collection
}
CesiumStyler.Colorbar = Colorbar

// export default CesiumStyler, {StyleViewModel}
export { 
    CesiumStyler as default, 
    Colorbar,
    FieldCollection,
    Field,
    Classes,
    UniqeColorSchema,
    StyleViewModel,

}