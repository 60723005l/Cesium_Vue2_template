import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

const state = {
  Cesium:undefined,
  viewer:undefined,
  scene:undefined,
  DataCenter:undefined,
  selectedLayer:undefined,
}

const mutations = {
  addCesium (state, c) {state.Cesium = c},
  addViewer (state, c) {state.viewer = c},
  addScene (state, c) {state.scene = c},
  setDataCenter (state,c){state.DataCenter = c},
  setSelectedLayer (state,layer) {state.selectedLayer = layer},
  authenticate (state, bool, token) {
    state.authenticated = bool;
    state.token = token;
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