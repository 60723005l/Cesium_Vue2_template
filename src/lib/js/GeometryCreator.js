const Cesium = require('cesium/Cesium');

class GeometryCreator
{
    constructor(option = {})
    {
        this.polyline = option.plyline || undefined
        this.polygon = option.polygon || undefined
        this.point = option.point || undefined
    }
}

/**
 * Cesium canvas 繪製點線面的父層類別,
 * 由DrawPoint, DrawPolyline, DrawPolygon 繼承
 *
 * @param option An object specifying configuration options
 * @param {Cesium.Viewer} option.viewer 必要參數
 * @param {DataFactory} option.targetDataSource DataFactory物件, onFinishDrawing時將會至物件加入至DataFactory中
 * @param {Function} option.onFinishDrawing 繪圖完成後的callback, 首參為Draw物件本身, 二參為targetDataSource
 */
class Draw
{
    constructor(option = {})
    {

        this.viewer = option.viewer
        this.targetDataSource = option.targetDataSource || undefined
        this.onFinishDrawing = option.onFinishDrawing || undefined
        this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
        this.pointArray = []
        this.activeShapePoints = []
        this.floatingPoint = undefined
        this.activeShape = undefined
        this.returnShape = undefined
        this.default_left_dbclick = undefined
        this.default_left_click = undefined
        this.isActiveDrawing = false
        
    }

    /**
     * Cesium canvas 繪圖初始化, 取消預設滑鼠事件, 後續請複寫start方法並增加其他事件如下:
     * 
     *@default 
     *  start()
     *  {
     *     super.start()
     *     super.left_click()
     *     super.left_dbclick()
     *  }
     */

    start()
    {
        this.remove_default_clickEvent()
        this.isActiveDrawing = true
        // console.log('parent start')
    }
    remove_default_clickEvent()
    {
        this.default_left_dbclick = viewer.cesiumWidget.screenSpaceEventHandler.getInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
        this.default_left_click = viewer.cesiumWidget.screenSpaceEventHandler.getInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
        this.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        this.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }
    reset_default_clickEvent()
    {
        this.viewer.cesiumWidget.screenSpaceEventHandler.setInputAction(this.default_left_dbclick, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
        this.viewer.cesiumWidget.screenSpaceEventHandler.setInputAction(this.default_left_click, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    }
    left_dbclick()
    {
        this.handler.setInputAction
        (
            (event)=>this.finish(event, this), 
            Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
        )
    }
    left_click()
    {
        // console.log(1, this)
        this.handler.setInputAction
        (
            (event)=>this.left_click_event(event, this), 
            Cesium.ScreenSpaceEventType.LEFT_CLICK
        )
    }
    mouse_move()
    {
        this.handler.setInputAction
        (
            (event)=>this.mouse_move_event(event, this), 
            Cesium.ScreenSpaceEventType.MOUSE_MOVE
        )
    }

    /**
     * 結束所有 Cesium canvas 繪圖滑鼠事件
     */
    finish(event, self)
    {
        console.log('finish drawing')
        this.activeShapePoints.pop();
        this.onFinishDrawing(this,this.targetDataSource)
        this.isActiveDrawing = false
        this.remove_every_ScreenSpaceEvents()
        this.remove_pointArray()
        this.reset_default_clickEvent()
        
        this.viewer.entities.remove(this.floatingPoint);
        this.viewer.entities.remove(this.activeShape);
        this.floatingPoint = undefined;
        this.activeShape = undefined;
        this.activeShapePoints = [];
        
    }
    terminate()
    {

    }
    remove_pointArray()
    {
        this.pointArray.forEach(point=>
            {
                this.viewer.entities.remove(point)
            })
    }
    remove_every_ScreenSpaceEvents()
    {
        var ScreenSpaceEventTypes = Object.keys(Cesium.ScreenSpaceEventType)
        ScreenSpaceEventTypes.forEach(type=>
            {
                this.handler.removeInputAction(Cesium.ScreenSpaceEventType[type])
            })
    }
    createPoint(worldPosition)
    {
        var viewer = this.viewer
        var point = viewer.entities.add
        ({
            position: worldPosition,
            point:
            {
              color: Cesium.Color.AQUA,
              pixelSize: 5,
              outlineColor: Cesium.Color.CADETBLUE,
              outlineWidth: 2,
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            },
        });
        this.pointArray.push(point)
        return point;
    }
    left_click_event(event, self)
    {
        var viewer = this.viewer
        var earthPosition = viewer.scene.pickPosition(event.position);
        var ellipsoidPosition = viewer.camera.pickEllipsoid(event.position)
        if ( Cesium.defined(earthPosition) || Cesium.defined(ellipsoidPosition) )
        {
            this.left_click_callback(event, earthPosition, ellipsoidPosition)
        }
    }
    mouse_move_event(event)
    {
        if (Cesium.defined(this.floatingPoint))
        {
            var newPosition = this.viewer.scene.pickPosition(event.endPosition);
            var ellipsoidPosition = this.viewer.camera.pickEllipsoid(event.endPosition)
            if ( Cesium.defined(newPosition) || Cesium.defined(ellipsoidPosition) )
            {
              this.floatingPoint.position.setValue(ellipsoidPosition);
              this.activeShapePoints.pop();
              this.activeShapePoints.push(ellipsoidPosition);
            }
          }
    }
    left_click_callback(event, earthPosition, ellipsoidPosition)
    {
        // console.log('left_click_callback: ', event, earthPosition, ellipsoidPosition)
        this.createPoint(ellipsoidPosition)
    }

}

/**
 * Cesium canvas 繪製點的類別, 繼承自Draw
 *
 * @param option An object specifying configuration options
 * @param {Cesium.Viewer} option.viewer 必要參數
 * @param {DataFactory} option.targetDataSource DataFactory物件, onFinishDrawing時將會至物件加入至DataFactory中
 * @param {Function} option.onFinishDrawing 繪圖完成後的callback, 首參為Draw物件本身, 二參為targetDataSource
 */
class DrawPoint extends Draw
{
    constructor(option = {})
    {
        super(option)
    }
    start()
    {
        super.start()
        super.left_click() //create point
        super.left_dbclick() // remove every ScreenSpaceEvents
    }
    left_click_callback(event, earthPosition, ellipsoidPosition)
    {
        this.createPoint(ellipsoidPosition)
    }
    createPoint(worldPosition)
    {
        var viewer = this.viewer
        var point = viewer.entities.add
        ({
            position: worldPosition,
            point:
            {
              color: Cesium.Color.WHITE,
              pixelSize: 5,
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            },
        });
        this.pointArray.push(point)
        return point;
    }
}

/**
 * Cesium canvas 繪製線的類別, 繼承自Draw
 *
 * @param option An object specifying configuration options
 * @param {Cesium.Viewer} option.viewer 必要參數
 * @param {DataFactory} option.targetDataSource DataFactory物件, onFinishDrawing時將會至物件加入至DataFactory中
 * @param {Function} option.onFinishDrawing 繪圖完成後的callback, 首參為Draw物件本身, 二參為targetDataSource
 */
class DrawPolyline extends Draw
{
    
    constructor(option = {})
    {
        super(option)
    }
    start()
    {
        super.start()
        super.left_click() //create point
        super.left_dbclick() // remove every ScreenSpaceEvents
        super.mouse_move()
    }
    left_click_callback(event, earthPosition, ellipsoidPosition)
    {
        if ( this.activeShapePoints.length === 0 )
        {
            this.floatingPoint = super.createPoint(ellipsoidPosition)
            this.activeShapePoints.push(ellipsoidPosition)
            // console.log(this.activeShapePoints)
            var dynamicPositions = new Cesium.CallbackProperty
            (
                ()=> { return this.activeShapePoints }, false
            );
            this.activeShape = this.createLine(dynamicPositions)
        }
        this.activeShapePoints.push(ellipsoidPosition);
        super.createPoint(ellipsoidPosition)
    }
    createLine(positionData)
    {
        var shape = viewer.entities.add
        ({
            polyline: 
            {
              positions: positionData,
              clampToGround: true,
              width: 3,
            },
        });
        return shape
    }
}

/**
 * Cesium canvas 繪製面的類別, 繼承自Draw
 *
 * @param option An object specifying configuration options
 * @param {Cesium.Viewer} option.viewer 必要參數
 * @param {DataFactory} option.targetDataSource DataFactory物件, onFinishDrawing時將會至物件加入至DataFactory中
 * @param {Function} option.onFinishDrawing 繪圖完成後的callback, 首參為Draw物件本身, 二參為targetDataSource
 */
class DrawPolygon extends Draw
{
    constructor(option = {})
    {
        super(option)
    }
    start()
    {
        super.start()
        super.left_click() //create point
        super.left_dbclick() // remove every ScreenSpaceEvents
        super.mouse_move()
    }
    left_click_callback(event, earthPosition, ellipsoidPosition)
    {
        if ( this.activeShapePoints.length === 0 )
        {
            this.floatingPoint = super.createPoint(ellipsoidPosition)
            this.activeShapePoints.push(ellipsoidPosition)
            var dynamicPositions = new Cesium.CallbackProperty
            (
                ()=> { return new Cesium.PolygonHierarchy(this.activeShapePoints) }, false
            );
            // console.log(dynamicPositions)
            this.activeShape = this.createPolygon(dynamicPositions)
        }
        this.activeShapePoints.push(ellipsoidPosition);
        super.createPoint(ellipsoidPosition)
    }
    createPolygon(positionData) 
    {
        var shape = viewer.entities.add
        ({
            polygon: 
            {
              hierarchy: positionData,
              material: new Cesium.ColorMaterialProperty(Cesium.Color.WHITE.withAlpha(0.7)),
            },
        });
        return shape
    }
}


export {
    GeometryCreator as default,
    Draw,
    DrawPoint,
    DrawPolyline,
    DrawPolygon

}