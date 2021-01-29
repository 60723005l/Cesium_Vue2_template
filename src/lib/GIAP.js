var Cesium = require('cesium/Cesium');

const GIAP = 
{
    createAndSetElement:function (tag, attrs, inner=false)
    {
        var el= document.createElement(tag);
        if (inner) el.innerText = inner
        for (var k in attrs)
            el.setAttribute(k, attrs[k]);
        return el;
    },
    dragElement_v2:function (d)
    {
        var dragItem = d//document.getElementById("#d");
        var container = document//.querySelector("#ifrmheader");

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

        function dragStart(e)
        {
            if (e.type === "touchstart")
            {
                initialX = e.touches[0].clientX - xOffset;
                initialY = e.touches[0].clientY - yOffset;
            }
            else
            {
                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;
            }

            if (e.target === dragItem)
            {
                active = true;
            }
        }

        function dragEnd(e)
        {
            initialX = currentX;
            initialY = currentY;

            active = false;
        }

        function drag(e)
        {
            if (active)
            {
            
                e.preventDefault();
            
                if (e.type === "touchmove")
                {
                    currentX = e.touches[0].clientX - initialX;
                    currentY = e.touches[0].clientY - initialY;
                }
                else
                {
                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;
                }

                xOffset = currentX;
                yOffset = currentY;

                setTranslate(currentX, currentY, dragItem);
            }
        }

        function setTranslate(xPos, yPos, el)
        {
            el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
        }
    },
    cart3toDegree:function(ori_cart3)
    {
        let cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(ori_cart3);
        let longitudeString = parseFloat(Cesium.Math.toDegrees(cartographic.longitude));
        let latitudeString = parseFloat(Cesium.Math.toDegrees(cartographic.latitude));
        let height = parseFloat(cartographic.height)
        let pos_deg = {x:longitudeString,y:latitudeString,z:height}
        return pos_deg
    },
    getPerformanceTiming:function()
    {
        var connectStart = performance.timing.connectStart
        return{
            dom_loading:performance.timing.domInteractive-performance.timing.responseEnd,
            dom_complete:performance.timing.domComplete-performance.timing.domInteractive,
            pro_request:performance.timing.responseStart-performance.timing.navigationStart,
            latancy:performance.timing.responseStart-performance.timing.requestStart,
            server:performance.timing.responseEnd-performance.timing.responseStart,
        }
    }
}
class Gradient
{
  fromRGBs(colors, times = 10)
  {
    var colors_arr = { r: [], b: [], g: [] }
    for (let i = 0; i < colors.length; i++)
    {
      let color = colors[i]
      colors_arr.r.push(color.r)
      colors_arr.b.push(color.b)
      colors_arr.g.push(color.g)
    }
    var colors_r = this.interpolateArray(colors_arr.r, times),
        colors_b = this.interpolateArray(colors_arr.b, times),
        colors_g = this.interpolateArray(colors_arr.g, times)
    var result = []
    for (let i = 0; i < colors_r.length; i++)
    {
      result.push({r:colors_r[i], g:colors_g[i], b:colors_b[i]})
    }
    return result
  }
  fromHexs(hexs, times = 10)
  {
    //   console.log(hexs)
    var rgbs = hexs.map(hex=>this.hexToRgbA(hex))
    return this.fromRGBs(rgbs,times)
  }
  hexToRgbA(hex)
  {
    var c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex))
    {
        c= hex.substring(1).split('');
        if(c.length== 3)
        {
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        return {r:(c>>16)&255,g:(c>>8)&255,b:c&255}
    }
    throw new Error('Bad Hex');
  }
  rgbToHex(rgb)
  {
    function componentToHex(c)
    {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }
    return "#" + componentToHex(rgb.r) + componentToHex(rgb.g) + componentToHex(rgb.b)
  }
  interpolateArray(data, fitCount)
  {
    var linearInterpolate = function (before, after, atPoint)
    {
      return before + (after - before) * atPoint;
    };
  
    var newData = new Array();
    var springFactor = new Number((data.length - 1) / (fitCount - 1));
    newData[0] = data[0]; // for new allocation
    for (var i = 1; i < fitCount - 1; i++)
    {
      var tmp = i * springFactor;
      var before = new Number(Math.floor(tmp)).toFixed();
      var after = new Number(Math.ceil(tmp)).toFixed();
      var atPoint = tmp - before;
      newData[i] = linearInterpolate(data[before], data[after], atPoint);
    }
    newData[fitCount - 1] = data[data.length - 1]; // for new allocation
    return newData;
  };
}
GIAP.Gradient = Gradient








const lerp = (x, y, a) => x * (1 - a) + y * a;
const clamp = (a, min = 0, max = 1) => Math.min(max, Math.max(min, a));
const invlerp = (x, y, a) => clamp((a - x) / (y - x));

GIAP.Math = {}
GIAP.Math.lerp = (x, y, a) => x * (1 - a) + y * a;
GIAP.Math.clamp = (a, min = 0, max = 1) => Math.min(max, Math.max(min, a));
GIAP.Math.invlerp = (x, y, a) => clamp((a - x) / (y - x));

GIAP.cloneObject = function (obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = GIAP.cloneObject(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = GIAP.cloneObject(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}

export default GIAP;