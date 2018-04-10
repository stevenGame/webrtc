<template>
  <div class="hello">
    <!-- 创建用于MediaStream捕获显示的视频 -->
      <!-- 创建聊天UI -->
      <!--
        1. 显示聊天的发送的按钮
        2. 切换聊天文字聊天和语音聊天
        3. 显示聊天信息
       -->

      <div class="chat-container">
          <div class="chat-left"></div>
          <div class="chat-right">
              <h2>测试</h2>
          </div>
      </div>

      <div id="aa">
          <div id="messages"></div>
          <div id="msg">
              <!-- 发送文字消息 -->
              <input @click="changeMsgType" type="button" value="文字" name="">
              <input id="word" v-if="msgtype=='text'" type="text" name="">
              <!-- 语音消息 -->
              <input id="recordBtn" type="button" v-show="msgtype=='sound'" value="录制消息" name="">
              <input type="button" v-if="msgtype=='text'" value="发送" name="">
          </div>
      </div>


      <!-- 创建一个audio -->
      <div id="msgt">
          <!-- 语音消息临时显示 -->
      </div>
      <div id="talkbubble"></div>
<!--     <h1>{{ msg }}</h1>
    <h2>Essential Links</h2>
    <ul>
      <li>
        <a
          href="https://vuejs.org"
          target="_blank"
        >
          Core Docs
        </a>
      </li>
      <li>
        <a
          href="https://forum.vuejs.org"
          target="_blank"
        >
          Forum
        </a>
      </li>
      <li>
        <a
          href="https://chat.vuejs.org"
          target="_blank"
        >
          Community Chat
        </a>
      </li>
      <li>
        <a
          href="https://twitter.com/vuejs"
          target="_blank"
        >
          Twitter
        </a>
      </li>
      <br>
      <li>
        <a
          href="http://vuejs-templates.github.io/webpack/"
          target="_blank"
        >
          Docs for This Template
        </a>
      </li>
    </ul>
    <h2>Ecosystem</h2>
    <ul>
      <li>
        <a
          href="http://router.vuejs.org/"
          target="_blank"
        >
          vue-router
        </a>
      </li>
      <li>
        <a
          href="http://vuex.vuejs.org/"
          target="_blank"
        >
          vuex
        </a>
      </li>
      <li>
        <a
          href="http://vue-loader.vuejs.org/"
          target="_blank"
        >
          vue-loader
        </a>
      </li>
      <li>
        <a
          href="https://github.com/vuejs/awesome-vue"
          target="_blank"
        >
          awesome-vue
        </a>
      </li>
    </ul> -->
  </div>
</template>

<script>
    import io from 'socket.io-client';

    import {Record} from '../lib/recorder'

    let socket = null;
export default {
  name: 'HelloWorld',

    mounted(){
        //挂载完成开始初始化客户端
        console.log("runned Hello world mounted>>>")
        /**
         * 1.连接socket
         * 2.获取需要操作的HTML元素,并添加相应的业务代码
         */

        Record.getUserMedia();
        let mgst = document.getElementById('msgt');

        this.socket = io('localhost:3000');
        socket = this.socket;
        var self = this;
        this.socket.on('connect', function(){
            //服务器连接成功
        })


        this.socket.on('uploadsuccess', function(url){
            //收到服务端推送过来的语音消息,创建播放的空间
            let audioContainer = document.createElement('div');
            let playBtn = document.createElement('button');
            let audio = document.createElement('audio');

            audioContainer.className = 'sound-msg-container';
            playBtn.style.width = "40px";
            playBtn.style.height = "20px";
            playBtn.style.backgroundColor = "transparent";

            audio.src = url;
            playBtn.onmousedown = function(e){
                audio.play();
            }

            audioContainer.appendChild(playBtn);
            audioContainer.appendChild(audio);
            mgst.appendChild(audioContainer);
        })
    },
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
        socket: null,
        msgtype: 'text',   //消息的类型, text, sound, file, img,
        recordBtn: null,
    }
  },
    methods:{
        sendMsg(){
            console.log("sendMsg");
            this.socket.emit("message", {
                type: 'sound',
                data: ""
            })
        },
        changeMsgType(e){
            // console.log("changeMsgType--->",e.target.value);
            var val = e.target.value;
            switch(val) {
                case "文字":
                    e.target.value = "语音";
                    this.msgtype = "sound";


                    if(!this.recordBtn){
                        setTimeout(()=>{
                            this.recordBtn = this.recordBtn || document.getElementById('recordBtn');
                            if(!this.recordBtn) return;
                            this.recordBtn.onmousedown = function(e){
                                //按下btn的时候开始录音
                                Record.startRecord();
                            }

                            this.recordBtn.onmouseup = function(e){
                                //松开btn的时候将录音消息发送
                                Record.stopRecord();
                            }
                        }, 1000);
                    }

                    break;
                case "语音":
                    e.target.value = "文字";
                    this.msgtype  ="text";
                    break;
                default:
                    this.msgtype = null;
                    break;
            }
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}

#soundmsg {
    width: 180px;
}

.chat-container {
    border: 1px solid red;
    height: 500px;
    margin-bottom: 20px;
    margin-left: 20px;
    margin-right: 20px;
    padding: 5px 5px;
}

.chat-left {
    height: 100%;
    width: 300px;
    border:1px solid #333;
    float: left;
}


.chat-right {
    margin-left: 320px;
    border: 1px solid #555;
    height: 100%;
}


.chat-right h2 {
    text-align: center;
}

.sound-msg-container {
    background-color: #86DB49;
    border-radius: 5px;
    -moz-border-radius: 5px;
    -webkit-border-radius: 5px;
    height: 30px;
    min-width: 60px;
    max-width: 100px;
}

#talkbubble {
    position: relative;
    width: 100px;
    height: 30px;
    background-color: #86DB49;
    border-radius: 5px;
    -webkit-border-radius: 5px;
    -moz-border-radius: 5px;
}

#talkbubble:before {
    content:"";
    position: absolute;
    right: 100%;
    top: 10px;
    width: 0;
    height: 0;
    border-top: 6px solid transparent;
    border-right: 15px solid #86DB49;
    border-bottom: 6px solid transparent;
}
</style>
