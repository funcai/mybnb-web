import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ResultsView from '../views/ResultsView.vue'
import ContactView from '../views/ContactView.vue'
import {
  searchLegacyRouteName,
  searchLegacyRoutePath,
  searchRouteName,
  searchRoutePath,
} from './searchRoute'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: searchRoutePath,
      name: searchRouteName,
      component: ResultsView,
    },
    {
      path: searchLegacyRoutePath,
      name: searchLegacyRouteName,
      component: ResultsView,
    },
    {
      path: '/contact',
      name: 'contact',
      component: ContactView,
    },
  ],
})

export default router
