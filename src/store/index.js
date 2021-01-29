import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

const state = {
  // Cesium:undefined,
  // viewer:{},
  // DataCenter:{},
  selectedLayer:undefined,
  selectedProject:undefined,
  authenticated:false,
}

const mutations = {
  // addCesium (state, c) {state.Cesium = c},
  // addViewer (state, {viewerElemID,viewer})
  // {
  //   state.viewer[viewerElemID] = viewer
  // },
  // setDataCenter (state,{centerName,center})
  // {
  //   state.DataCenter[centerName] = center
  // },
  setSelectedLayer (state,layer) {state.selectedLayer = layer},
  setSelectedProject (state,project) {state.selectedProject = project},
  authenticate (state, {status,user_info})
  {
    state.authenticated = status;
    state.user_info = user_info;
    console.log('User authenticated!')
  },
  deauthenticate(state, bool){
    state.authenticated = bool;
    state.token = undefined;
    console.log("Login Failed!");
  },
  logout(state, bool){
    state.authenticated = bool;
    state.token = undefined;
    console.log("Logout!");
  }

}

const actions = {

}

export default new Vuex.Store({
  state,
  mutations,
  actions
})