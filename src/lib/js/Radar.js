const Cesium = require('cesium/Cesium');
import GIAP from "@/lib/GIAP"

class Radar extends Cesium.Entity
{
    constructor(option = {})
    {
        super(option)
        this.viewer = option.viewer
        this.position = option.position
        this.scanColor = option.scanColor || new Cesium.Color(0.0, 1.0, 0.0, 1);
        this.maxRadius = option.maxRadius || 1000
        this.duration = option.duration || 3000
        this.pp_stages = undefined
        this._show = true
    }
}

class CircleScanRadar extends Radar
{
    constructor(option = {})
    {
        super(option)
        this.create()
    }
    create() {
        this.viewer.scene.globe.depthTestAgainstTerrain = true;
        var lastStage = addCircleScanPostStage(this.viewer, this.position.getValue(this.viewer.clock.currentTime), this.maxRadius, this.scanColor, this.duration);
        this.point = new Cesium.PointGraphics ({
            pixelSize:7,
            color:Cesium.Color.RED
        })
        this.pp_stages = [lastStage]
        // console.log(lastStage)
        // this.viewer.entities.add(this)
        return this
    }
    set show ( bool )
    {
        super.show = bool
        if ( bool && this.pp_stages != undefined)
        {
            var pp_stages_flat = pp_stages.flat()
            pp_stages_flat.forEach(pp=>pp.enabled = true)
            this._show = true
        }
        else if ( !bool && this.pp_stages != undefined )
        {
            var pp_stages_flat = pp_stages.flat()
            pp_stages_flat.forEach(pp=>pp.enabled = false)
            this._show = false
        }
    }
    get show()
    {
        return this._show
    }

}

/**
 * A CustomDataSource containing CircleScanRadars
 */
class RadarDataSource extends Cesium.CustomDataSource
{
    constructor(name)
    {
        super(name)
        this.pp_stages = []
        this._show = true
        this._setCollectionChangedEvent()
    }
    /**
     * 
     * @param {Array} arr Array with CircleScanRadar object
     */
    addRadars(arr)
    {
        for ( let i = 0; i < arr.lengh; i++ )
        {
            let radar = arr[i]
            this.entities.add(radar)
            this.pp_stages.push(radar.pp_stages)
        }
        return this
    }
    /**
     * 
     * @param {Function} func A arrow function whitch return an array contains CircleScanRadars
     */
    loadFunction(func)
    {
        this.addRadars( func() )
        return this
    }
    _setCollectionChangedEvent()
    {
        var handleAddedEvent = (added) =>
        {
            // console.log('handleAddedEvent', added)
            for ( let i = 0 ; i < added.length; i++ )
            {
                let entity = added[i]
                this.pp_stages.push(entity.pp_stages)
            }
        }
        var handleRemovedEvent = (removed) =>
        {
            // console.log('handleRemovedEvent')
        }
        var handlecCangedEvent = (changed) =>
        {
            // console.log('handlecCangedEvent')
        }

        this.entities.collectionChanged.addEventListener((collection, added, removed, changed)=>
        {
            handleAddedEvent(added)
            handleRemovedEvent(removed)
            handlecCangedEvent(changed)
        })
    }
    set show(bool)
    {
        super.show = bool
        var pp_stages_flat = this.pp_stages.flat()
        pp_stages_flat.forEach(pp=>pp.enabled = bool)
        this.entities.show = bool
        this._show = bool
    }
    get show()
    {
        return this._show
    }
}

// 清除
// viewer.scene.postProcessStages.remove(lastStage);


/*
  添加扩散效果扫描线
  viewer
  cartographicCenter 扫描中心
  radius  半径 米
  scanColor 扫描颜色
  duration 持续时间 毫秒
*/
function addCircleScanPostStage(viewer, cartographicCenter, maxRadius, scanColor, duration) {
    var _Cartesian3Center = cartographicCenter//new Cesium.Cartesian3.fromDegrees(cartographicCenter._value.x,cartographicCenter._value.y,cartographicCenter._value.z)//Cesium.Cartographic.toCartesian(cartographicCenter);//
    // console.log(cartographicCenter,_Cartesian3Center)
    var _Cartesian4Center = new Cesium.Cartesian4(_Cartesian3Center.x, _Cartesian3Center.y, _Cartesian3Center.z, 1);

    // var _CartograhpicCenter1 = new Cesium.Cartesian3.fromDegrees(cartographicCenter.x,cartographicCenter.y,cartographicCenter.z+500)//new Cesium.Cartographic(cartographicCenter.longitude, cartographicCenter.latitude, cartographicCenter.height + 500);//
    var _Cartesian3CenterDegree = GIAP.cart3toDegree(cartographicCenter)
    var _Cartesian3Center1 = new Cesium.Cartesian3.fromDegrees(_Cartesian3CenterDegree.x,_Cartesian3CenterDegree.y,_Cartesian3CenterDegree.z+500)//Cesium.Cartographic.toCartesian(_CartograhpicCenter1);
    var _Cartesian4Center1 = new Cesium.Cartesian4(_Cartesian3Center1.x, _Cartesian3Center1.y, _Cartesian3Center1.z, 1);

    var _time = (new Date()).getTime();

    var _scratchCartesian4Center = new Cesium.Cartesian4();
    var _scratchCartesian4Center1 = new Cesium.Cartesian4();
    var _scratchCartesian3Normal = new Cesium.Cartesian3();


    var ScanPostStage = new Cesium.PostProcessStage({
        fragmentShader: getScanSegmentShader(),
        uniforms: {
            u_scanCenterEC: function () {
                var temp = Cesium.Matrix4.multiplyByVector(viewer.camera._viewMatrix, _Cartesian4Center, _scratchCartesian4Center);
                return temp;
            },
            u_scanPlaneNormalEC: function () {
                var temp = Cesium.Matrix4.multiplyByVector(viewer.camera._viewMatrix, _Cartesian4Center, _scratchCartesian4Center);
                var temp1 = Cesium.Matrix4.multiplyByVector(viewer.camera._viewMatrix, _Cartesian4Center1, _scratchCartesian4Center1);

                _scratchCartesian3Normal.x = temp1.x - temp.x;
                _scratchCartesian3Normal.y = temp1.y - temp.y;
                _scratchCartesian3Normal.z = temp1.z - temp.z;

                Cesium.Cartesian3.normalize(_scratchCartesian3Normal, _scratchCartesian3Normal);

                return _scratchCartesian3Normal;
            },
            u_radius: function () {
                return maxRadius * (((new Date()).getTime() - _time) % duration) / duration;
            },
            u_scanColor: scanColor
        }
    });
    
    viewer.scene.postProcessStages.add(ScanPostStage);
    return ScanPostStage;
}
//扩散效果Shader
function getScanSegmentShader() {
    var scanSegmentShader = `
            uniform sampler2D colorTexture;
            uniform sampler2D depthTexture;
            varying vec2 v_textureCoordinates;
            uniform vec4 u_scanCenterEC;
            uniform vec3 u_scanPlaneNormalEC;
            uniform float u_radius;
            uniform vec4 u_scanColor;
            
            vec4 toEye(in vec2 uv,in float depth)
            {
                        vec2 xy = vec2((uv.x * 2.0 - 1.0),(uv.y * 2.0 - 1.0));
                        vec4 posIncamera = czm_inverseProjection * vec4(xy,depth,1.0);
                        posIncamera = posIncamera/posIncamera.w;
                        return posIncamera;
            }
            
            vec3 pointProjectOnPlane(in vec3 planeNormal,in vec3 planeOrigin,in vec3 point)
            {
                        vec3 v01 = point - planeOrigin;
                        float d = dot(planeNormal,v01);
                        return (point-planeNormal * d);
            }
            float getDepth(in vec4 depth)
            {
                        float z_window = czm_unpackDepth(depth);
                        z_window = czm_reverseLogDepth(z_window);
                        float n_range = czm_depthRange.near;
                        float f_range = czm_depthRange.far;
                        return (2.0 * z_window - n_range - f_range)/(f_range-n_range);
            } 
            void main()
            {
                        gl_FragColor = texture2D(colorTexture,v_textureCoordinates);
                        float depth = getDepth(texture2D(depthTexture,v_textureCoordinates));
                        vec4 viewPos = toEye(v_textureCoordinates,depth);
                        vec3 prjOnPlane = pointProjectOnPlane(u_scanPlaneNormalEC.xyz,u_scanCenterEC.xyz,viewPos.xyz);
                        float dis = length(prjOnPlane.xyz - u_scanCenterEC.xyz);
                        if(dis<u_radius)
                        {
                            float f = 1.0-abs(u_radius - dis )/ u_radius;
                            f = pow(f,4.0);
                            gl_FragColor = mix(gl_FragColor,u_scanColor,f);
                        }
            }`;
    return scanSegmentShader;
}

/*
  添加雷达扫描线
  viewer
  cartographicCenter 扫描中心
  radius  半径 米
  scanColor 扫描颜色
  duration 持续时间 毫秒
*/
function addRadarScanPostStage(viewer, cartographicCenter, radius, scanColor, duration) {
    var _Cartesian3Center = Cesium.Cartographic.toCartesian(cartographicCenter);
    var _Cartesian4Center = new Cesium.Cartesian4(_Cartesian3Center.x, _Cartesian3Center.y, _Cartesian3Center.z, 1);

    var _CartographicCenter1 = new Cesium.Cartographic(cartographicCenter.longitude, cartographicCenter.latitude, cartographicCenter.height + 500);
    var _Cartesian3Center1 = Cesium.Cartographic.toCartesian(_CartographicCenter1);
    var _Cartesian4Center1 = new Cesium.Cartesian4(_Cartesian3Center1.x, _Cartesian3Center1.y, _Cartesian3Center1.z, 1);

    var _CartographicCenter2 = new Cesium.Cartographic(cartographicCenter.longitude + Cesium.Math.toRadians(0.001), cartographicCenter.latitude, cartographicCenter.height);
    var _Cartesian3Center2 = Cesium.Cartographic.toCartesian(_CartographicCenter2);
    var _Cartesian4Center2 = new Cesium.Cartesian4(_Cartesian3Center2.x, _Cartesian3Center2.y, _Cartesian3Center2.z, 1);
    var _RotateQ = new Cesium.Quaternion();
    var _RotateM = new Cesium.Matrix3();

    var _time = (new Date()).getTime();

    var _scratchCartesian4Center = new Cesium.Cartesian4();
    var _scratchCartesian4Center1 = new Cesium.Cartesian4();
    var _scratchCartesian4Center2 = new Cesium.Cartesian4();
    var _scratchCartesian3Normal = new Cesium.Cartesian3();
    var _scratchCartesian3Normal1 = new Cesium.Cartesian3();

    var ScanPostStage = new Cesium.GIAP_PPS_Entity({//PostProcessStage
        fragmentShader: getRadarScanShader(),
        uniforms: {
            u_scanCenterEC: function () {
                return Cesium.Matrix4.multiplyByVector(viewer.camera._viewMatrix, _Cartesian4Center, _scratchCartesian4Center);
            },
            u_scanPlaneNormalEC: function () {
                var temp = Cesium.Matrix4.multiplyByVector(viewer.camera._viewMatrix, _Cartesian4Center, _scratchCartesian4Center);
                var temp1 = Cesium.Matrix4.multiplyByVector(viewer.camera._viewMatrix, _Cartesian4Center1, _scratchCartesian4Center1);
                _scratchCartesian3Normal.x = temp1.x - temp.x;
                _scratchCartesian3Normal.y = temp1.y - temp.y;
                _scratchCartesian3Normal.z = temp1.z - temp.z;

                Cesium.Cartesian3.normalize(_scratchCartesian3Normal, _scratchCartesian3Normal);
                return _scratchCartesian3Normal;
            },
            u_radius: radius,
            u_scanLineNormalEC: function () {
                var temp = Cesium.Matrix4.multiplyByVector(viewer.camera._viewMatrix, _Cartesian4Center, _scratchCartesian4Center);
                var temp1 = Cesium.Matrix4.multiplyByVector(viewer.camera._viewMatrix, _Cartesian4Center1, _scratchCartesian4Center1);
                var temp2 = Cesium.Matrix4.multiplyByVector(viewer.camera._viewMatrix, _Cartesian4Center2, _scratchCartesian4Center2);

                _scratchCartesian3Normal.x = temp1.x - temp.x;
                _scratchCartesian3Normal.y = temp1.y - temp.y;
                _scratchCartesian3Normal.z = temp1.z - temp.z;

                Cesium.Cartesian3.normalize(_scratchCartesian3Normal, _scratchCartesian3Normal);

                _scratchCartesian3Normal1.x = temp2.x - temp.x;
                _scratchCartesian3Normal1.y = temp2.y - temp.y;
                _scratchCartesian3Normal1.z = temp2.z - temp.z;

                var tempTime = (((new Date()).getTime() - _time) % duration) / duration;
                Cesium.Quaternion.fromAxisAngle(_scratchCartesian3Normal, tempTime * Cesium.Math.PI * 2, _RotateQ);
                Cesium.Matrix3.fromQuaternion(_RotateQ, _RotateM);
                Cesium.Matrix3.multiplyByVector(_RotateM, _scratchCartesian3Normal1, _scratchCartesian3Normal1);
                Cesium.Cartesian3.normalize(_scratchCartesian3Normal1, _scratchCartesian3Normal1);
                return _scratchCartesian3Normal1;
            },
            u_scanColor: scanColor
        }
    });
    viewer.scene.postProcessStages.add(ScanPostStage);

    return ScanPostStage;
}


//雷达扫描线效果Shader
function getRadarScanShader() {
    var scanSegmentShader =
        "uniform sampler2D colorTexture;\n" +
        "uniform sampler2D depthTexture;\n" +
        "varying vec2 v_textureCoordinates;\n" +
        "uniform vec4 u_scanCenterEC;\n" +
        "uniform vec3 u_scanPlaneNormalEC;\n" +
        "uniform vec3 u_scanLineNormalEC;\n" +
        "uniform float u_radius;\n" +
        "uniform vec4 u_scanColor;\n" +

        "vec4 toEye(in vec2 uv, in float depth)\n" +
        " {\n" +
        " vec2 xy = vec2((uv.x * 2.0 - 1.0),(uv.y * 2.0 - 1.0));\n" +
        " vec4 posInCamera =czm_inverseProjection * vec4(xy, depth, 1.0);\n" +
        " posInCamera =posInCamera / posInCamera.w;\n" +
        " return posInCamera;\n" +
        " }\n" +

        "bool isPointOnLineRight(in vec3 ptOnLine, in vec3 lineNormal, in vec3 testPt)\n" +
        "{\n" +
        "vec3 v01 = testPt - ptOnLine;\n" +
        "normalize(v01);\n" +
        "vec3 temp = cross(v01, lineNormal);\n" +
        "float d = dot(temp, u_scanPlaneNormalEC);\n" +
        "return d > 0.5;\n" +
        "}\n" +

        "vec3 pointProjectOnPlane(in vec3 planeNormal, in vec3 planeOrigin, in vec3 point)\n" +
        "{\n" +
        "vec3 v01 = point -planeOrigin;\n" +
        "float d = dot(planeNormal, v01) ;\n" +
        "return (point - planeNormal * d);\n" +
        "}\n" +

        "float distancePointToLine(in vec3 ptOnLine, in vec3 lineNormal, in vec3 testPt)\n" +
        "{\n" +
        "vec3 tempPt = pointProjectOnPlane(lineNormal, ptOnLine, testPt);\n" +
        "return length(tempPt - ptOnLine);\n" +
        "}\n" +

        "float getDepth(in vec4 depth)\n" +
        "{\n" +
        "float z_window = czm_unpackDepth(depth);\n" +
        "z_window = czm_reverseLogDepth(z_window);\n" +
        "float n_range = czm_depthRange.near;\n" +
        "float f_range = czm_depthRange.far;\n" +
        "return (2.0 * z_window - n_range - f_range) / (f_range - n_range);\n" +
        "}\n" +

        "void main()\n" +
        "{\n" +
        "gl_FragColor = texture2D(colorTexture, v_textureCoordinates);\n" +
        "float depth = getDepth( texture2D(depthTexture, v_textureCoordinates));\n" +
        "vec4 viewPos = toEye(v_textureCoordinates, depth);\n" +
        "vec3 prjOnPlane = pointProjectOnPlane(u_scanPlaneNormalEC.xyz, u_scanCenterEC.xyz, viewPos.xyz);\n" +
        "float dis = length(prjOnPlane.xyz - u_scanCenterEC.xyz);\n" +
        "float twou_radius = u_radius * 2.0;\n" +
        "if(dis < u_radius)\n" +
        "{\n" +
        "float f0 = 1.0 -abs(u_radius - dis) / u_radius;\n" +
        "f0 = pow(f0, 64.0);\n" +
        "vec3 lineEndPt = vec3(u_scanCenterEC.xyz) + u_scanLineNormalEC * u_radius;\n" +
        "float f = 0.0;\n" +
        "if(isPointOnLineRight(u_scanCenterEC.xyz, u_scanLineNormalEC.xyz, prjOnPlane.xyz))\n" +
        "{\n" +
        "float dis1= length(prjOnPlane.xyz - lineEndPt);\n" +
        "f = abs(twou_radius -dis1) / twou_radius;\n" +
        "f = pow(f, 3.0);\n" +
        "}\n" +
        "gl_FragColor = mix(gl_FragColor, u_scanColor, f + f0);\n" +
        "}\n" +
        "}\n";
    return scanSegmentShader;
}


// export default Radar
export {
    Radar as default,
    CircleScanRadar,
    RadarDataSource
}
