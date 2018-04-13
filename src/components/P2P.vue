<template>
    <div id="container" class="wrapper clearfix">
        <div class="row">
            <div class="col-md-3">
                <div class="box box-solid box-default">
                    <div class="box-header">
                        <h3 class="box-title">Online contacts</h3>
                    </div>
                    <div class="box-body">
                        <ul class="contacts-list">
                            <li>
                                <a>
                                    <img class="contacts-list-img"
                                         src="https://adminlte.io/themes/AdminLTE/dist/img/user1-128x128.jpg"
                                         alt="Contact Avatar">
                                    <div class="contacts-list-info">
                                        <span class="contacts-list-name" style="color:black;width: 56%;">
                                            Steven

                                        </span>
                                        <div class="pull-right">

                                                <span class="contact-btn call-btn reject-btn badge"
                                                      v-if="p2p_status.INCOMING == call_status|| call_status== p2p_status.CALLING">
                                                    <i class="fa fa-phone"></i>
                                                </span>
                                            &nbsp;&nbsp;
                                            <!--Accept button-->
                                            <span class="contact-btn call-btn accept-btn badge"
                                                  v-if="p2p_status.INCOMING == call_status"
                                            >
                                                    <i class="fa fa-phone"></i>
                                                </span>

                                            <span class="contact-btn call-btn badge"
                                                  v-if="call_status == p2p_status.READ_TO_CALL">
                                                    <i class="fa fa-phone "></i>
                                                </span>

                                        </div>
                                    </div>
                                    <!-- /.contacts-list-info -->
                                </a>
                            </li>
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
                                                   v-on:click="onAcceptCall(false)">
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
            <div class="col-md-6">
                <div id="demoContainer">
                    <div id="connectControls">
                        <button id="connectButton" v-on:click="connect">Connect</button>
                        <button id="hangupButton" v-on:click="hangup">Hangup</button>
                        <div id="iam">Not yet connected...</div>
                        <br/>
                        <strong>Connected users:</strong>
                        <div id="otherClients"></div>
                    </div>

                    <!-- Note... this demo should be updated to remove video references -->
                    <div id="videos">
                        <video id="callerAudio"></video>
                        <div id="acceptCallBox">
                            <!-- Should be initially hidden using CSS -->
                            <div id="acceptCallLabel"></div>
                            <button id="callAcceptButton">Accept</button>
                            <button id="callRejectButton">Reject</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- /.contatcts-list -->
        <hr/>

    </div>
</template>

<script>
    function disable(domId) {
        document.getElementById(domId).disabled = "disabled";
    }

    function clearConnectList() {
        var otherClientDiv = document.getElementById("otherClients");
        while (otherClientDiv.hasChildNodes()) {
            otherClientDiv.removeChild(otherClientDiv.lastChild);
        }

    }

    function enable(domId) {
        document.getElementById(domId).disabled = "";
    }

    export default {

        name: "P2P",

        created() {
            let loadJs = (jsUrl) => {
                let recaptchaScript = document.createElement('script')
                recaptchaScript.setAttribute('src', jsUrl)
                document.head.appendChild(recaptchaScript)
            }

            loadJs('/socket.io/socket.io.js')
            loadJs('/rtc/easyrtc/easyrtc.js')
        },
        mounted() {

            // TODO: find way to load easyrtc and socket.io in vue js
            //       remove timeout function
            setTimeout(this.init, 1000)

        },
        destroyed() {
            easyrtc.disconnect();
        },
        methods: {
            loadOccupants(occupants) {
                console.table(occupants)
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
                document.getElementById("acceptCallBox").style.display = "block";
                if (easyrtc.getConnectionCount() > 0) {
                    document.getElementById("acceptCallLabel")
                        .textContent = "Drop current call and accept new from " + easyrtcid + " ?";
                }
                else {
                    document.getElementById("acceptCallLabel")
                        .textContent = "Accept incoming call from " + easyrtcid + " ?";
                }
                var acceptTheCall = function (wasAccepted) {
                    document.getElementById("acceptCallBox").style.display = "none";
                    if (wasAccepted && easyrtc.getConnectionCount() > 0) {
                        easyrtc.hangupAll();
                    }
                    that.call_status = that.p2p_status.CALLING
                    callback(wasAccepted);
                };
                this.onAcceptCall = acceptTheCall
                document.getElementById("callAcceptButton").onclick = function () {
                    acceptTheCall(true);
                };
                document.getElementById("callRejectButton").onclick = function () {
                    acceptTheCall(false);
                };
            },
            disconnect() {
                document.getElementById("iam").innerHTML = "logged out";
                easyrtc.disconnect();
                console.log("disconnecting from server");
                enable("connectButton");
                // disable("disconnectButton");
                clearConnectList();
            },
            init() {
                var that = this
                easyrtc.setStreamAcceptor(function (easyrtcid, stream) {
                    var audio = document.getElementById("callerAudio");
                    easyrtc.setVideoObjectSrc(audio, stream);
                    enable("hangupButton");
                    that.call_status = that.p2p_status.CALLING
                });

                easyrtc.setOnStreamClosed(function (easyrtcid) {
                    easyrtc.setVideoObjectSrc(document.getElementById("callerAudio"), "");
                    disable("hangupButton");
                    that.call_status = that.p2p_status.READ_TO_CALL
                });

                easyrtc.setAcceptChecker(that.onIncomingCall);
            },
            hangup() {
                easyrtc.hangupAll();
                disable("hangupButton");
            },
            performCall(otherEasyrtcid) {
                console.log('calling>>>>',otherEasyrtcid)
                easyrtc.hangupAll();
                var acceptedCB = function (accepted, caller) {
                    if (!accepted) {
                        easyrtc.showError("CALL-REJECTED", "Sorry, your call to " + easyrtc.idToName(caller) + " was rejected");
                        enable("otherClients");
                    }
                };
                var successCB = function () {
                    enable("hangupButton");
                };
                var failureCB = function () {
                    enable("otherClients");
                };
                easyrtc.call(otherEasyrtcid, successCB, failureCB, acceptedCB);
            },
            loginFailure(errorCode, message) {
                easyrtc.showError(errorCode, message);
            },
            loginSuccess(easyrtcid) {
                disable("connectButton");
                // // enable("disconnectButton");
                enable("otherClients");
                this.call_status = this.p2p_status.READ_TO_CALL;
                this.selfEasyrtcid = easyrtcid;
                document.getElementById("iam").innerHTML = "I am " + easyrtcid;
            },
            convertListToButtons(roomName, occupants, isPrimary) {
                clearConnectList();
                var that = this;
                var otherClientDiv = document.getElementById("otherClients");
                for (var easyrtcid in occupants) {
                    var button = document.createElement("button");
                    button.onclick = function (easyrtcid) {
                        return function () {
                            that.performCall(easyrtcid);
                        };
                    }(easyrtcid);

                    var label = document.createElement("text");
                    label.innerHTML = easyrtc.idToName(easyrtcid);
                    button.appendChild(label);
                    otherClientDiv.appendChild(button);
                }
                // vue functions
                that.loadOccupants(occupants)
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
            }
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