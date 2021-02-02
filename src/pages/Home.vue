<template>
    <div class="home">
        <CesiumContainer
            :dataCenterName="dataCenterName"
            :CesiumViewerElemID="CesiumViewerElemID"
        ></CesiumContainer>
        <Compass
            class="widget-compass"
            :dataCenterName="dataCenterName"
            :CesiumViewerElemID="CesiumViewerElemID"
            :active="true"/>
        
    </div>
</template>
<script>
import CesiumContainer from '@/components/CesiumContainer'
import Compass from '@/components/MapWidget/Compass'

export default {
    name : "Home",
    data()
        {
            return {
                    dataCenterName:"my_DataCenter",
                    CesiumViewerElemID:"my_CesiumViewerContainer",
            }
        },
    methods:
        {

        },
    components:
        {
            CesiumContainer,Compass
        }
}
</script>
<style scoped>
.home{
    width: 100vw;
    height: 100vh;
} 
.widget-compass{
    position: absolute;
    top: 0px;
    right: 0px;
}
</style>