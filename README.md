# giap

> A Vue2 Cesium1.73 template project

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).


## Change Cesium Time line Style

1. 下載 Widget.zip https://drive.google.com/file/d/1EFreacwVNrCwi41V-Z6V8HR43KcJDjY1/view?usp=sharing ，內有 CesiumInitailAdjuster.js 與 Widgets 資料夾
2. cd to ./node_modules/cesium/Source, 把 Widget 資料夾替換成剛剛下載完解壓縮後的 Widget 資料夾
3. 在創建 Cesium Viewer 時，import CesiumInitailAdjuster.js，並執行以下script
( 專案模板中已經做好了，以下可略 )
``` js
import CesiumInitailAdjuster from "@/lib/CesiumInitailAdjuster"
const Cesium = require("cesium/Cesium");

var viewer = new Cesium.Viewer(/*CesiumViewerElemID*/);
CesiumInitailAdjuster.Cesium = Cesium
CesiumInitailAdjuster.viewer = viewer
CesiumInitailAdjuster.timelineUI()
```
