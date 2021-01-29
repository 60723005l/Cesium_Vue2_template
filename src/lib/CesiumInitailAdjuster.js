const CesiumInitailAdjuster = 
{
    Cesium:undefined,
    viewer:undefined,
    timelineUI:function()
    {
        var Cesium = this.Cesium
        var viewer = this.viewer


        //-------抗鋸齒----------------------------------------------------
        // viewer.scene.postProcessStages.fxaa.enabled = true
        // viewer.scene.requestRenderMode = true
        // viewer.scene.maximumRenderTimeChange = 2
        viewer._toolbar.style.display = 'none'
        //-------- adjust cesium popup info box -------------------------------------------------------------------------------------------
        document.getElementsByClassName('cesium-viewer-infoBoxContainer')[0].style.cssText =
        `
            position: absolute;
            top: 15%;
            width: -webkit-fill-available;
            height: -webkit-fill-available;
            pointer-events: none;
        `
        document.getElementsByClassName('cesium-viewer-infoBoxContainer')[0].children[0].style.cssText = 'pointer-events: auto;'

        //--------- adjust cesium selectionIndicator ------------------------------------------------------------------------------------------
        document.getElementsByClassName('cesium-viewer-selectionIndicatorContainer')[0].style.cssText = 
        `
            position: absolute;
            top: 0px;
            left: 0px;
        `

        // scene.screenSpaceCameraController.enableZoom = false;
        // scene.primitives.add(Cesium.createOsmBuildings());

        //-------- hide widgets and init the earth ----------------------------------------------------------------
        viewer._cesiumWidget._creditContainer.style.display = "none";
        viewer.navigationHelpButton.container.style.display = 'none'
        // viewer.timeline.container.style.display = "none";
        // viewer.animation.container.style.display = "none";
        // viewer.animation.container.style.zIndex = "1";
        // viewer._cesiumWidget._creditViewport.style.width = '200%'
        // viewer.navigationHelpButton.container.style.top = "140px"
        //--------------------------------------------------------------------------------------------------


        var AnimationViewModel = viewer.animation.viewModel


        var newClockElement = createElementFromHTML
        (`
        <div class="giap-ainmationInfo-container">
            <div class="giap-ainmationInfo-player">
                <div class="giap-animation-button "><button class="giap-animation-playBack"></button></div>
                <div class="giap-animation-button "><button class="giap-animation-player"></button></div>
                <div class="giap-animation-button "><button class="giap-animation-playFront"></button></div>
            </div>
            <div class="giap-ainmationInfo-datetime">
                <span data-bind="text: dateLabel"></span>
            </div>
            <div class="giap-ainmationInfo-datetime">
                <span data-bind="text: timeLabel"></span>
            </div>
            <div class="giap-ainmationInfo-speeder">
                <input type="range" class="giap-animation-speedInput" min="-150" max="150"/>
                <span class="giap-animation-speedText" data-bind="text:multiplierLabel"></span>
            </div>
        </div>
        `)

        var animationHintElement = createElementFromHTML
        (`
        <div class="giap-ainmationInfo-hinter">
        </div>
        `)
        
        var speedElems = newClockElement.getElementsByClassName('giap-ainmationInfo-speeder')[0]
        var speedInput = speedElems.children[0],
            origin_speedIniput_value = Number


        var playerBtns = newClockElement.getElementsByClassName('giap-animation-button')
        var playBack = playerBtns[0],
            player = playerBtns[1],
            playerIcon = player.firstChild,
            playFront = playerBtns[2]

        speedInput.addEventListener('input',function(e)
        {
            var result = Number
            var value = e.target.value
            origin_speedIniput_value = value
            var isPositive = value >= 0 ? true : false
            var positiveValue = Math.abs(value)
            if(positiveValue<=100){result = isPositive ? positiveValue : positiveValue*-1}
            else{result = isPositive ? positiveValue*(positiveValue-100) : positiveValue*(positiveValue-100)*-1}
            AnimationViewModel.clockViewModel.multiplier = result        
            
        })

        playBack.addEventListener('click',function()
        {
            playerIcon.className = 'giap-animation-stoper'
            viewer.clock.multiplier = Math.sqrt(viewer.clock.multiplier**2)*-1
            viewer.clock.shouldAnimate = true
            // speedText.innerText = `✖ ${viewer.clock.multiplier}`
            speedInput.value = (Math.abs(origin_speedIniput_value)*-1).toString()
        })

        player.addEventListener('click',function(e)
        {
            if(viewer.clock.shouldAnimate)
            {
                playerIcon.className = 'giap-animation-player'
                viewer.clock.shouldAnimate = false
            }
            else if (!viewer.clock.shouldAnimate)
            {
                playerIcon.className = 'giap-animation-stoper'
                viewer.clock.shouldAnimate = true
            }
        })

        playFront.addEventListener('click',function()
        {
            playerIcon.className = 'giap-animation-stoper'
            viewer.clock.multiplier = Math.sqrt(viewer.clock.multiplier**2)
            var multiplier = viewer.clock.multiplier
            viewer.clock.shouldAnimate = true
            // speedText.innerText = `x ${viewer.clock.multiplier}`
            speedInput.value = Math.abs(origin_speedIniput_value).toString()
            
        })

        animationHintElement.addEventListener('click',function()
        {
            if(viewer.animation.container.className === 'cesium-viewer-animationContainer')
            {
                animationHintElement.className = 'giap-ainmationInfo-hinter-up'
                viewer.animation.container.className = 'cesium-viewer-animationContainer-hide'
            }
            else if (viewer.animation.container.className === 'cesium-viewer-animationContainer-hide')
            {
                animationHintElement.className = 'giap-ainmationInfo-hinter'
                viewer.animation.container.className = 'cesium-viewer-animationContainer'
            }
        })

        viewer.animation.container.children[1].remove()
        viewer.animation.container.appendChild(newClockElement)
        viewer.animation.container.appendChild(animationHintElement)
        Cesium.knockout.track(AnimationViewModel);
        Cesium.knockout.applyBindings(AnimationViewModel, newClockElement);
        for (var name in AnimationViewModel)
        {
            if (AnimationViewModel.hasOwnProperty(name))
            {
              Cesium.knockout.getObservable(AnimationViewModel, name).subscribe(()=>{});
            }
        }
        var getCurrentTimeString = (TimeString) =>
        {
            var dateandtime = TimeString.toString().split('.')[0].toString().split('T')
            return {date : dateandtime[0], time : dateandtime[1]}
        }
        function createElementFromHTML(htmlString)
        {
            var div = document.createElement('div');
            div.innerHTML = htmlString.trim();
            return div.firstChild; 
        }
        //--------------------------------------------------------------------------------------------------
    },
    earthSpin:function()
    {
        var Cesium = this.Cesium
        var viewer = this.viewer
        //-------- spin earth --------------------------------------------------------
        var extent = Cesium.Rectangle.fromDegrees(90.70,-6.86,150.47,49.61);

        Cesium.Camera.DEFAULT_VIEW_RECTANGLE = extent;
        Cesium.Camera.DEFAULT_VIEW_FACTOR = 0;

        function icrf(scene, time) {
            if (scene.mode !== Cesium.SceneMode.SCENE3D) {
                return;
            }

            var icrfToFixed = Cesium.Transforms.computeIcrfToFixedMatrix(time);
            if (Cesium.defined(icrfToFixed)) {
                var camera = viewer.camera;
                var offset = Cesium.Cartesian3.clone(camera.position);
                var transform = Cesium.Matrix4.fromRotationTranslation(icrfToFixed);
                camera.lookAtTransform(transform, offset);
            }
        }

        viewer.scene.screenSpaceCameraController.enableZoom = false;
        viewer.camera.setView
        ({
            destination: {x: -12844623.681870708, y: 17289881.79300302, z: 11183610.413266469},
        });
        viewer.icrf = icrf
        viewer.scene.postUpdate.addEventListener(viewer.icrf);
        viewer.scene.globe.enableLighting = true;
        viewer.clock.shouldAnimate = true;
        viewer.clock.multiplier = 1500;
        //---------------------------------------------------------------------------------------------------
    }
}

export default CesiumInitailAdjuster