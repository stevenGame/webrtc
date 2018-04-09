<template>
    <div class="wrapper">
        <div class="content container-fluid">
           
            <!-- Construct the box with style you want. Here we are using box-danger -->
            <!-- Then add the class direct-chat and choose the direct-chat-* contexual class -->
            <!-- The contextual class should match the box, so we are using direct-chat-danger -->
            <div class="box box-danger direct-chat" style="width: 30%;">
                <div class="box-header with-border">
                    <h3 class="box-title">Audio Chat</h3>
                </div>
                <!-- /.box-header -->
                <div class="box-body">
                    <!-- Conversations are loaded here -->
                    <div class="direct-chat-messages">
                        <!-- Message. Default to the left -->
                        <div class="direct-chat-msg">
                            <div class="direct-chat-info clearfix">
                                <span class="direct-chat-name pull-left">Alexander Pierce</span>
                                <span class="direct-chat-timestamp pull-right">23 Jan 2:00 pm</span>
                            </div>
                            <!-- /.direct-chat-info -->
                            <img class="direct-chat-img"
                                 src="https://adminlte.io/themes/AdminLTE/dist/img/user1-128x128.jpg"
                                 alt="message user image">
                            <!-- /.direct-chat-img -->
                            <div class="direct-chat-text">
                                Is this template really for free? That's unbelievable!
                            </div>
                            <!-- /.direct-chat-text -->
                        </div>
                        <!-- /.direct-chat-msg -->

                        <!-- Message to the right -->
                        <div class="direct-chat-msg right">
                            <div class="direct-chat-info clearfix">
                                <span class="direct-chat-name pull-right">Sarah Bullock</span>
                                <span class="direct-chat-timestamp pull-left">23 Jan 2:05 pm</span>
                            </div>
                            <!-- /.direct-chat-info -->
                            <img class="direct-chat-img"
                                 src="https://adminlte.io/themes/AdminLTE/dist/img/user3-128x128.jpg"
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
            <!--/.direct-chat -->
            <hr/>
            <video id="record" style="visibility:hidden"
            src="/api/uploads/upload_da5a972992edf1700e4233b7fc95a0dd.wav"></video>
            <div>
                <label id="percentage">0% x</label>
                <progress id="progress-bar" value=0></progress>
                <br/>
            </div>
            <div>
                <button id="btn-start-recording">Start Recording</button>
                <button id="btn-stop-recording" disabled="">Stop Recording</button>
            </div>
            <footer style="width:100%;position: fixed; right: 0; text-align: center;color:red;">
                <h2 id="footer-h2"></h2>
            </footer>
        </div>

    </div>
</template>

<script>
    let RecordRTC = require('recordrtc');
    // let StereoAudioRecorder = require('recordrtc');
    export default {
        name: "AudioChat",
        mounted: () => {

            // fetching DOM references
            var btnStartRecording = document.querySelector('#btn-start-recording');
            var btnStopRecording = document.querySelector('#btn-stop-recording');

            var videoElement = document.querySelector('#record');

            var progressBar = document.querySelector('#progress-bar');
            var percentage = document.querySelector('#percentage');

            var recorder;

            // reusable helpers

            // this function submits recorded blob to nodejs server
            function postFiles() {
                var blob = recorder.getBlob();

                // getting unique identifier for the file name
                var fileName = generateRandomString() + '.webm';

                var file = new File([blob], fileName, {
                    type: 'video/webm'
                });

                videoElement.src = '';
                videoElement.poster = '/ajax-loader.gif';

                xhr('/api/uploadFile', file, function (responseText) {
                    var fileURL = JSON.parse(responseText).fileURL;

                    console.info('fileURL', fileURL);
                    videoElement.src = fileURL;
                    videoElement.play();
                    videoElement.muted = false;
                    videoElement.controls = true;

                    document.querySelector('#footer-h2').innerHTML = '<a href="' + videoElement.src + '">' + videoElement.src + '</a>';
                });

                if (mediaStream) mediaStream.stop();
            }

            // XHR2/FormData
            function xhr(url, data, callback) {
                var request = new XMLHttpRequest();
                request.onreadystatechange = function () {
                    if (request.readyState == 4 && request.status == 200) {
                        callback(request.responseText);
                    }
                };

                request.upload.onprogress = function (event) {
                    progressBar.max = event.total;
                    progressBar.value = event.loaded;
                    progressBar.innerHTML = 'Upload Progress ' + Math.round(event.loaded / event.total * 100) + "%";
                };

                request.upload.onload = function () {
                    percentage.style.display = 'none';
                    progressBar.style.display = 'none';
                };
                request.open('POST', url);

                var formData = new FormData();
                formData.append('file', data);
                request.send(formData);
            }

            // generating random string
            function generateRandomString() {
                if (window.crypto) {
                    var a = window.crypto.getRandomValues(new Uint32Array(3)),
                        token = '';
                    for (var i = 0, l = a.length; i < l; i++) token += a[i].toString(36);
                    return token;
                } else {
                    return (Math.random() * new Date().getTime()).toString(36).replace(/\./g, '');
                }
            }

            var mediaStream = null;

            // reusable getUserMedia
            function captureUserMedia(success_callback) {
                var session = {
                    audio: true,
                    video: false
                };

                navigator.getUserMedia(session, success_callback, function (error) {
                    alert('Unable to capture your camera. Please check console logs.');
                    console.error(error);
                });
            }

            // UI events handling
            btnStartRecording.onclick = function () {
                btnStartRecording.disabled = true;

                captureUserMedia(function (stream) {
                    mediaStream = stream;

                    videoElement.src = window.URL.createObjectURL(stream);
                    videoElement.play();
                    videoElement.muted = true;
                    videoElement.controls = false;

                    recorder = RecordRTC(stream, {
                        // recorderType: StereoAudioRecorder,
                        type: 'video'
                    });

                    recorder.startRecording();

                    // enable stop-recording button
                    btnStopRecording.disabled = false;
                });
            };


            btnStopRecording.onclick = function () {
                btnStartRecording.disabled = false;
                btnStopRecording.disabled = true;

                recorder.stopRecording(postFiles);
            };

            window.onbeforeunload = function () {
                startRecording.disabled = false;
            };
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

    /*audio, video {*/
    /*border: 1px solid rgb(15, 158, 238); width: 94%;*/
    /*}*/
    button[disabled], input[disabled] {
        background: rgba(216, 205, 205, 0.2);
        border: 1px solid rgb(233, 224, 224);
    }


</style>