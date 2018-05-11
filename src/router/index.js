import Vue from 'vue'
import Router from 'vue-router'

import AppView from '@/components/app-view'
import Home from '@/pages/home'

Vue.use(Router)

const page = name => () => import('@/pages/' + name)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '',
      component: AppView,
      children: [
        {path: '/', name: 'home', component: Home},
        {path: '/404', name: '404', component: page('404')},
        {path: '/500', name: '500', component: page('500')},
        {path: '/user-manager', name: 'user-manager', component: page('user-manager')},
        {path: '/work-manager', name: 'work-manager', component: page('work-manager')},
        {path: '/exhibition-manager', name: 'exhibition-manager', component: page('exhibition-manager')},
        {path: '/exhibition-work-manager', name: 'exhibition-work-manager', component: page('exhibition-work-manager')},
        {path: '/course-manager', name: 'course-manager', component: page('course-manager')},
        {path: '/update-pwd', name: 'update-pwd', component: page('update-pwd')},
        {path: '/carousel-manager', name: 'carousel-manager', component: page('carousel-manager')}
      ]
    },
    {path: '/login', name: 'login', component: page('login')},
    {path: '*', redirect: {name: '404'}}
  ]
})
