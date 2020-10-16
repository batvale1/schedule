import Vue from 'vue';
import VueRouter from 'vue-router';

import AppTimetable from "@/views/AppTimetable";

Vue.use(VueRouter);

const routes = [
    {
        path: '/timetable',
        name: 'index',
        component: AppTimetable,
    },
    {
        path: '*',
        redirect: '/timetable',
    },
];

const router = new VueRouter({
    mode: 'history',
    routes,
});

export default router;
