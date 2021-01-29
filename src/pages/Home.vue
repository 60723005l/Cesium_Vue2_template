<template>
    <div>
        <CesiumContainer
            :dataCenterName="dataCenterName"
            :CesiumViewerElemID="CesiumViewerElemID"
        ></CesiumContainer>
        
    </div>
</template>
<script>
import CesiumContainer from '@/components/CesiumContainer'
export default {
    name : "Home",
    data()
        {
            return {
                    dataCenterName:"my_DataCenter",
                    CesiumViewerElemID:"my_CesiumViewerContainer",
            }
        },
    components:
        {
            CesiumContainer
        }
}
</script>
<style scoped>
    
</style>