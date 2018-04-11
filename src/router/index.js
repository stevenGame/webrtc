import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import Chat from '@/components/Chat'
import AudioChat from '@/components/AudioChat'
import P2P from '@/components/P2P'

Vue.use(Router)

export default new Router({
    routes: [
        {
            path: '/',
            name: 'HelloWorld',
            component: HelloWorld
        },
        {
            path: '/chat',
            name: 'Chat',
            component: Chat
        },
        {
            path:'/AudioChat',
            name:'AudioChat',
            component:AudioChat
        },
        {
            path:'/P2P',
            name:'P2P',
            component:P2P
        }

    ]
})
