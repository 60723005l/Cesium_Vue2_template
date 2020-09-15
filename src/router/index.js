import Vue from 'vue'
import Router from 'vue-router'
import CesiumContainer from '@/components/CesiumContainer'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'CesiumContainer',
      component: CesiumContainer
    }
  ]
})
