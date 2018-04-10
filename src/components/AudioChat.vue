<template>
    <div class="wrapper">
        <div class="content container-fluid">
            <div class="row">
                <div class="col-md-4">
                    <!-- Construct the box with style you want. Here we are using box-danger -->
                    <!-- Then add the class direct-chat and choose the direct-chat-* contexual class -->
                    <!-- The contextual class should match the box, so we are using direct-chat-danger -->
                    <form role="form">
                        <div class="box-body">
                            <div class="form-group">
                                <label for="curUser">Current User</label>
                                <input type="text" id="curUser" class="form-control" v-model="curUser"/>
                            </div>
                            <div class="form-group">
                                <label for="chatWith">Chatting with</label>
                                <input type="text" id="chatWith" class="form-control" v-model="chatObj"/>
                            </div>
                        </div>
                        <!-- /.box-body -->
                    </form>

                    <!--/.direct-chat -->
                </div>
                <div class="col-md-4">
                    <div class="box box-danger direct-chat">
                        <div class="box-header with-border">
                            <h3 class="box-title">Audio Chat</h3>
                        </div>
                        <!-- /.box-header -->
                        <div class="box-body">
                            <!-- Conversations are loaded here -->
                            <div class="direct-chat-messages">
                                <!-- Message. Default to the left -->
                                
                                <div class="direct-chat-msg"
                                     v-bind:class="{right:chat.isSend}"
                                     style="cursor: pointer;"
                                     v-for="chat in chatHistory.files"
                                     v-on:click="playAudio(chat.name)">
                                    <div class="direct-chat-info clearfix">
                                        <span class="direct-chat-name"
                                              v-bind:class="{'pull-left':chat.isReceived,'pull-right':chat.isSend}">
                                            {{chat.isSend?curUser:chatObj}}
                                        </span>
                                        <!--<span class="direct-chat-timestamp pull-right">23 Jan 2:00 pm</span>-->
                                    </div>
                                    <!-- /.direct-chat-info -->
                                    <img class="direct-chat-img"
                                         v-bind:src="chat.isSend?'https://adminlte.io/themes/AdminLTE/dist/img/user1-128x128.jpg':'https://adminlte.io/themes/AdminLTE/dist/img/user3-128x128.jpg'"

                                         alt="message user image">
                                    <!-- /.direct-chat-img -->
                                    <div class="direct-chat-text">
                                        {{chat.name}}
                                    </div>
                                    <!-- /.direct-chat-text -->
                                </div>
                                <!-- /.direct-chat-msg -->

                                <!-- Message to the right -->
                                <div class="direct-chat-msg right">
                                    <div class="direct-chat-info clearfix">
                                        <span class="direct-chat-name pull-right">{{curUser}}</span>
                                        <span class="direct-chat-timestamp pull-left">23 Jan 2:05 pm</span>
                                    </div>
                                    <!-- /.direct-chat-info -->
                                    <img class="direct-chat-img"
                                         src="https://adminlte.io/themes/AdminLTE/dist/img/user1-128x128.jpg"
                                         alt="message user image">
                                    <!-- /.direct-chat-img -->
                                    <div class="direct-chat-text">
                                        You better believe it!
                                    </div>
                                    <!-- /.direct-chat-text -->
                                </div>
                                <!-- /.direct-chat-msg -->
                            </div>
                            <!--/.direct-chat-messages-->
                        </div>
                        <!-- /.box-body -->
                        <div class="box-footer">
                            <div class="input-group">
                                <input type="text" name="message" placeholder="Type Message ..." class="form-control">
                                <span class="input-group-btn">
                            <button type="button" class="btn btn-danger btn-flat">Send</button>
                        </span>
                            </div>
                        </div>
                        <!-- /.box-footer-->
                    </div>
                </div>
            </div>

            <hr/>
            <video id="record" style="visibility:hidden;width:0;"></video>

            <div>
                <button class="btn btn-info"
                        v-bind:disabled="recording"
                        v-on:click="startRecording">Start Recording
                </button>
                <button class="btn btn-info"
                        v-bind:disabled="!recording"
                        id="btn-stop-recording"
                        v-on:click="stopRecordClick">Stop Recording
                </button>
                <button class="btn btn-info"
                        v-on:click="getChatHistory">Get History
                </button>
            </div>
            <footer style="width:100%;position: fixed; right: 0; text-align: center;color:red;">
                <h2 id="footer-h2"></h2>
            </footer>
        </div>

    </div>
</template>

<script>
    import moment from 'moment'

    let RecordRTC = require('recordrtc');
    // let StereoAudiothis.recorder = require('recordrtc');
    export default {
        name: "AudioChat",
        mounted() {

            // fetching DOM references
            this.recording = false;
            // console.log(this)
            this.refreshChats()

        },
        data: () => {
            return {
                curUser: 'Steven',
                chatObj: 'CuiCui',
                recording: false,
                recorder: null,
                mediaStream: null,
                chatHistory:{files:[]}
            }
        },
        methods: {
            stopRecordClick() {
                this.recording = false;
                this.recorder.stopRecording(this.postFiles);
            },
            // this function submits recorded blob to nodejs server
            postFiles() {

                var blob = this.recorder.getBlob();
                let videoElement = document.querySelector('#record');
                // getting unique identifier for the file name
                var fileName = `${moment().format('YYYY_MM_DD_HH_ss')}_${this.curUser}_to_${this.chatObj}.webm`;

                var file = new File([blob], fileName, {
                    type: 'video/webm'
                });

                videoElement.src = '';
                videoElement.poster = '/ajax-loader.gif';
                console.log('file upload is ', file)
                this.xhr('/api/uploadFile', file, function (responseText) {
                    var fileURL = JSON.parse(responseText).fileURL;

                    console.info('fileURL', fileURL);

                });

                if (this.mediaStream) this.mediaStream.stop();
            },
            playAudio(fileName) {
                let videoElement = document.querySelector('#record');
                let fileURL = `/api/uploads/${fileName}`
                videoElement.src = fileURL;
                videoElement.play();
                videoElement.muted = false;
                videoElement.controls = true;
            },
            refreshChats() {
                setInterval(() => {
                    console.log('refresh chats')
                    this.getChatHistory()
                }, 1000)
            }
            ,
            startRecording() {

                let that = this;
                this.recording = true
                this.captureUserMedia(function (stream) {
                    let videoElement = document.querySelector('#record');
                    that.mediaStream = stream;

                    videoElement.src = window.URL.createObjectURL(stream);
                    videoElement.play();
                    videoElement.muted = true;
                    videoElement.controls = false;

                    that.recorder = RecordRTC(stream, {
                        // this.recorderType: StereoAudiothis.recorder,
                        type: 'video'
                    });

                    that.recorder.startRecording();

                    that.recording = true
                });
            },
            captureUserMedia(success_callback) {
                var session = {
                    audio: true,
                    video: false
                };

                navigator.getUserMedia(session, success_callback, function (error) {
                    alert('Unable to capture your camera. Please check console logs.');
                    console.error(error);
                });
            },
            // XHR2/FormData
            xhr(url, data, callback) {
                var request = new XMLHttpRequest();
                request.onreadystatechange = function () {
                    if (request.readyState == 4 && request.status == 200) {
                        callback(request.responseText);
                    }
                };

                request.open('POST', url);

                var formData = new FormData();
                formData.append('file', data);
                request.send(formData);
            },
            getChatHistory() {
                this.$http
                    .get(`/api/listFile?sender=${this.curUser}&receiver=${this.chatObj}`)
                    .then(response => {
                        // get body data
                        this.chatHistory = response.body;
                        let files = this.chatHistory.files;
                        this.chatHistory.files = files.map(f => {
                            let isSend = f.name.indexOf(`${this.curUser}_to`) != -1;
                            return {
                                isSend: isSend,
                                isReceived: ! isSend,
                                name: f.name
                            }

                        })

                    }, response => {
                        // error callback
                        console.error('list files error', response)
                    });
            }


        }

    }
</script>

<style scoped>
    html {
        background-color: #f7f7f7;
    }

    body {
        background-color: white;
        border: 1px solid rgb(15, 158, 238);
        margin: 1% 35%;
        text-align: center;
    }

    hr {
        border: 0;
        border-top: 1px solid rgb(15, 158, 238);
    }

    a {
        color: #2844FA;
        text-decoration: none;
    }

    a:hover, a:focus {
        color: #1B29A4;
    }

    a:active {
        color: #000;
    }

</style>