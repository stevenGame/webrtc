<template>

    <div id="container">

        <div id="demoContainer">
            <div id="connectControls">
                <button id="connectButton" >Connect</button>
                <button id="hangupButton" disabled="disabled">Hangup</button>
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
</template>

<script>
    // import 'socket.io'
    import RemoteJS from '@/components/RemoteJS'

    export default {

        name: "P2P",
        components: {
            RemoteJS
        },
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
            var selfEasyrtcid = "";

            function disable(domId) {
                document.getElementById(domId).disabled = "disabled";
            }


            function enable(domId) {
                document.getElementById(domId).disabled = "";
            }


            function connect() {
                console.log("Initializing.");
                easyrtc.enableVideo(false);
                easyrtc.enableVideoReceive(false);
                easyrtc.setRoomOccupantListener(convertListToButtons);
                easyrtc.initMediaSource(
                    function () {    // success callback
                        easyrtc.connect("easyrtc.audioOnly", loginSuccess, loginFailure);
                    },
                    function (errorCode, errmesg) {
                        easyrtc.showError(errorCode, errmesg);
                    }  // failure callback
                );
            }


            function terminatePage() {
                easyrtc.disconnect();
            }


            function hangup() {
                easyrtc.hangupAll();
                disable("hangupButton");
            }


            function clearConnectList() {
                var otherClientDiv = document.getElementById("otherClients");
                while (otherClientDiv.hasChildNodes()) {
                    otherClientDiv.removeChild(otherClientDiv.lastChild);
                }

            }

            let btn = (id) => document.querySelector(id)
            btn('#connectButton').onclick = connect
            btn('#hangupButton').onclick = hangup

            function convertListToButtons(roomName, occupants, isPrimary) {
                clearConnectList();
                var otherClientDiv = document.getElementById("otherClients");
                for (var easyrtcid in occupants) {
                    var button = document.createElement("button");
                    button.onclick = function (easyrtcid) {
                        return function () {
                            performCall(easyrtcid);
                        };
                    }(easyrtcid);

                    var label = document.createElement("text");
                    label.innerHTML = easyrtc.idToName(easyrtcid);
                    button.appendChild(label);
                    otherClientDiv.appendChild(button);
                }
            }


            function performCall(otherEasyrtcid) {
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
            }


            function loginSuccess(easyrtcid) {
                disable("connectButton");
                // enable("disconnectButton");
                enable("otherClients");
                selfEasyrtcid = easyrtcid;
                document.getElementById("iam").innerHTML = "I am " + easyrtcid;
            }


            function loginFailure(errorCode, message) {
                easyrtc.showError(errorCode, message);
            }


            function disconnect() {
                document.getElementById("iam").innerHTML = "logged out";
                easyrtc.disconnect();
                console.log("disconnecting from server");
                enable("connectButton");
                // disable("disconnectButton");
                clearConnectList();
            }

            let init = () => {
                console.log("easyrtc loaded")
                easyrtc.setStreamAcceptor(function (easyrtcid, stream) {
                    var audio = document.getElementById("callerAudio");
                    easyrtc.setVideoObjectSrc(audio, stream);
                    enable("hangupButton");
                });


                easyrtc.setOnStreamClosed(function (easyrtcid) {
                    easyrtc.setVideoObjectSrc(document.getElementById("callerAudio"), "");
                    disable("hangupButton");
                });


                easyrtc.setAcceptChecker(function (easyrtcid, callback) {
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
                        callback(wasAccepted);
                    };
                    document.getElementById("callAcceptButton").onclick = function () {
                        acceptTheCall(true);
                    };
                    document.getElementById("callRejectButton").onclick = function () {
                        acceptTheCall(false);
                    };
                });
            }
            // TODO: find way to load easyrtc and socket.io in vue js
            //       remove the timer function
            setTimeout(init,1000)

        }

    }
</script>

<style scoped>
    video {
        width: 320px;
        height: 240px;
    }

    .divHolder {
        position: relative;
        float: left;
        background-color: blue;
        margin: 1px;
    }
</style>