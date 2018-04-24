<template>
    <div id="container" class="wrapper clearfix">
        <div class="row">
            <div class="col-md-3">
                <div class="box box-solid box-default">
                    <div class="box-header">
                        <h3 class="box-title">{{selfEasyrtcid.toString().substr(0,5)}} Online contacts</h3>
                    </div>
                    <div class="box-body">
                        <ul class="contacts-list">

                            <li v-for="contact in onlineContacts">
                                <a>
                                    <img class="contacts-list-img"
                                         src="https://adminlte.io/themes/AdminLTE/dist/img/user1-128x128.jpg"
                                         alt="Contact Avatar">
                                    <div class="contacts-list-info">
                                        <span class="contacts-list-name" style="color:black;width: 56%;">
                                            {{contact.easyrtcid.toString().substr(0, 5)}}
                                            <span v-if="call_status == p2p_status.CALLING">calling</span>
                                        </span>
                                        <div class="pull-right">
                                             <span class="contact-btn call-btn reject-btn badge"
                                                   v-if="p2p_status.INCOMING == call_status|| call_status == p2p_status.CALLING"
                                                   v-on:click="hangup">
                                                    <i class="fa fa-phone"></i>
                                                </span>
                                            &nbsp;
                                            <!--Accept button-->
                                            <span class="contact-btn call-btn accept-btn badge"
                                                  v-if="p2p_status.INCOMING == call_status"
                                                  v-on:click="onAcceptCall(true)"
                                            >
                                                    <i class="fa fa-phone"></i>
                                                </span>

                                            <span class="contact-btn call-btn badge"
                                                  v-if="call_status == p2p_status.READ_TO_CALL"
                                                  v-on:click="performCall(contact.easyrtcid)">
                                                <i class="fa fa-phone "></i>
                                            </span>
                                        </div>
                                    </div>
                                    <!-- /.contacts-list-info -->
                                </a>
                            </li>
                            <!-- End Contact Item -->
                        </ul>
                    </div>
                </div>

            </div>
            <video id="callerAudio" style="display: none"></video>
            <!--<div class="col-md-6">-->
                <!--<div id="demoContainer">-->
                    <!--<div id="connectControls">-->
                        <!--<button id="connectButton" v-on:click="connect">Connect</button>-->
                        <!--<button id="hangupButton" v-on:click="hangup">Hangup</button>-->
                        <!--<div id="iam">Not yet connected...</div>-->
                        <!--<br/>-->
                        <!--<strong>Connected users:</strong>-->
                        <!--<div id="otherClients"></div>-->
                    <!--</div>-->

                    <!--&lt;!&ndash; Note... this demo should be updated to remove video references &ndash;&gt;-->
                    <!--<div id="videos">-->
                        <!--<video id="callerAudio"></video>-->
                        <!--<div id="acceptCallBox">-->
                            <!--&lt;!&ndash; Should be initially hidden using CSS &ndash;&gt;-->
                            <!--<div id="acceptCallLabel"></div>-->
                            <!--<button id="callAcceptButton">Accept</button>-->
                            <!--<button id="callRejectButton">Reject</button>-->
                        <!--</div>-->
                    <!--</div>-->
                <!--</div>-->
            <!--</div>-->
        </div>

        <!-- /.contatcts-list -->
        <hr/>

    </div>
</template>

<script>

    var P2P_SERVER_URL = 'http://localhost:8080'

    export default {

        name: "P2P",

        created() {
            let loadJs = (jsUrl) => {
                let recaptchaScript = document.createElement('script');
                recaptchaScript.setAttribute('src', jsUrl);
                document.head.appendChild(recaptchaScript)
            };

            loadJs(`${P2P_SERVER_URL}/socket.io/socket.io.js`);
            loadJs(`${P2P_SERVER_URL}/easyrtc/easyrtc.js`)
        },
        mounted() {

            // TODO: find way to load easyrtc and socket.io in vue js
            //       remove timeout function
            setTimeout(this.init, 2500)

        },
        destroyed() {
            easyrtc.disconnect();
        },
        methods: {
            loadOccupants(occupants) {
                console.table(occupants);
                this.onlineContacts = occupants
            },
            connect() {
                var that = this;
                easyrtc.enableVideo(false);
                easyrtc.enableVideoReceive(false);
                easyrtc.setRoomOccupantListener(this.convertListToButtons);
                easyrtc.initMediaSource(
                    function () {    // success callback
                        easyrtc.connect("easyrtc.audioOnly", that.loginSuccess, that.loginFailure);
                    },
                    function (errorCode, errmesg) {
                        easyrtc.showError(errorCode, errmesg);
                    }  // failure callback
                );
            },
            onIncomingCall(easyrtcid, callback) {
                this.call_status = this.p2p_status.INCOMING;
                var that = this;
                if (easyrtc.getConnectionCount() > 0) {
                    console.log("Drop current call and accept new from " + easyrtcid + " ?")

                }
                else {
                    console.log("Accept incoming call from " + easyrtcid + " ?");

                }
                var acceptTheCall = function (wasAccepted) {

                    if (wasAccepted && easyrtc.getConnectionCount() > 0) {
                        easyrtc.hangupAll();
                    }
                    that.call_status = that.p2p_status.CALLING;
                    callback(wasAccepted);
                };
                this.onAcceptCall = acceptTheCall

            },
            disconnect() {
                document.getElementById("iam").innerHTML = "logged out";
                easyrtc.disconnect();
                console.log("disconnecting from server");

            },
            init() {
                var that = this;
                easyrtc.setStreamAcceptor(function (easyrtcid, stream) {
                    var audio = document.getElementById("callerAudio");
                    easyrtc.setVideoObjectSrc(audio, stream);
                    that.call_status = that.p2p_status.CALLING
                });
                // 
                easyrtc.setSocketUrl(P2P_SERVER_URL);
                easyrtc.setOnStreamClosed(function () {
                    easyrtc.setVideoObjectSrc(document.getElementById("callerAudio"), "");
                    that.call_status = that.p2p_status.READ_TO_CALL
                });

                easyrtc.setAcceptChecker(that.onIncomingCall);
                this.connect()
            },
            hangup() {
                easyrtc.hangupAll();

            },
            /**
             * TODO: need maintain callback in function onIncomingCall(easyrtcid, callback)
             *       call stack
             */
            rejectCall() {
                if (this.onAcceptCall) {
                    this.onAcceptCall(false)
                }
            }
            ,
            performCall(otherEasyrtcid) {
                var that = this;
                easyrtc.hangupAll();
                var acceptedCB = function (accepted, caller) {
                    if (!accepted) {
                        easyrtc.showError("CALL-REJECTED", "Sorry, your call to " + easyrtc.idToName(caller) + " was rejected");
                    }
                };
                var successCB = function () {
                    that.call_status = that.p2p_status.CALLING;
                    // TODO: accept up logic
                    console.log('hangup')
                };
                var failureCB = function () {
                    that.call_status = this.READ_TO_CALL;
                    console.log('called canceled')

                };
                easyrtc.call(otherEasyrtcid, successCB, failureCB, acceptedCB);
            },
            loginFailure(errorCode, message) {
                easyrtc.showError(errorCode, message);
            },
            loginSuccess(easyrtcid) {

                this.call_status = this.p2p_status.READ_TO_CALL;
                this.selfEasyrtcid = easyrtcid;

            },
            convertListToButtons(roomName, occupants, isPrimary) {
                // vue functions
                this.loadOccupants(occupants)
            }
        },
        data() {
            // move it to module config
            var p2p_status = {
                DISCONNECT: 'disconnected',
                READ_TO_CALL: 'ready to call',
                INCOMING: 'incoming',
                CALLING: 'calling', // on the phone or accept phone call
                DIAL_OUT: 'dial out'
            };
            return {
                onlineContacts: [],
                selfEasyrtcid: '',
                // p2p call status
                call_status: p2p_status.DISCONNECT,
                p2p_status: p2p_status,
                // call back function when accept the call
                //
                onAcceptCall: null
            }
        }
    }
</script>

<style scoped>
    .contact-btn {
        position: relative;
        top: -27px;
        right: -15px;
        font-size: 25px;
        border-radius: 50%;
        line-height: 30px;
        padding: 8px 15px;
        cursor: pointer;
    }

    .call-btn {
        background: #00a65a;
    }

    .reject-btn {

        background: red;
    }

    .reject-btn .fa {
        transform: rotate(138deg);
    }

</style>