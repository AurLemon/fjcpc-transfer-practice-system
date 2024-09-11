import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            meta: {
                title: '计大船政转轨考刷题系统 - 首页'
            },
            component: HomeView
        },
        {
            path: '/practice',
            name: 'practice',
            meta: {
                title: '计大船政转轨考刷题系统 - 刷题'
            },
            component: () => import('../views/PracticeView.vue')
        },
        {
            path: '/test',
            name: 'test',
            meta: {
                title: '计大船政转轨考刷题系统 - 组卷'
            },
            component: () => import('../views/TestView.vue')
        },
        {
            path: '/view',
            name: 'view',
            meta: {
                title: '计大船政转轨考刷题系统 - 看题'
            },
            component: () => import('../views/AllQuestionsView.vue')
        },
        {
            path: '/star',
            name: 'star',
            meta: {
                title: '计大船政转轨考刷题系统 - 收藏'
            },
            component: () => import('../views/StarView.vue')
        },
        {
            path: '/stat',
            name: 'stat',
            meta: {
                title: '计大船政转轨考刷题系统 - 统计'
            },
            component: () => import('../views/StatView.vue')
        },
        {
            path: '/advanced',
            name: 'advanced',
            meta: {
                title: '计大船政转轨考刷题系统 - 设置'
            },
            component: () => import('../views/AdvancedView.vue')
        },
        {
            path: '/about',
            name: 'adout',
            meta: {
                title: '计大船政转轨考刷题系统 - 关于'
            },
            component: () => import('../views/AboutView.vue')
        },
        {
            path: '/debug',
            name: 'debug',
            component: () => import('../views/DebugView.vue')
        }
    ]
})

export default router
