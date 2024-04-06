'use strict'

var localVideo = document.querySelector('video#localVideo');
var remoteVideo = document.querySelector('video#remoteVideo');
var buttonStart = document.querySelector('button#buttonStart');
var buttonCall = document.querySelector('button#buttonCall');
var buttonHangUp = document.querySelector('button#buttonHangUp');

var devMediaStream; // 设备媒体流
var pcLocal;  // 本地端peerConnection
var pcRemote; // 远程端peerConnection


// 获取到设备媒体流后的处理
function getMediaStream(stream)
{
    devMediaStream = stream; // 赋值给全局变量， 后面可能还要处理
     localVideo.srcObject = stream;
    
}

// 处理错误
function handleError(err)
{
    console.error("ERROR: ", err);
}

// 点击开始按钮
function start()
{
    console.log("start");

    // 如果设备不支持媒体流则直接返回错误
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia)
    {
        console.error("device not support media");
        return;
    }

    // 采集本地媒体流并显示在浏览器上
    navigator.mediaDevices.getUserMedia({video:true, audio:true}).then(getMediaStream).catch(handleError);
}


function call()
{
    console.log("call");

    /* 1.创建两端peerconnection */
    pcLocal = new RTCPeerConnection();  // 本地端peerConnection
    pcRemote = new RTCPeerConnection(); // 远程端peerConnection

    pcLocal.onconnectionstatechange  = (e) =>
    {
        console.log(pcLocal.connectionState);
    };

    /* 3.媒体协商 */
    /* 3.0 setLocalDescription后会触发onicecandidate事件 */
    pcLocal.onicecandidate = (event) => {
        //console.log("pcLocal candidate:", event);
        pcRemote.addIceCandidate(event.candidate);
    }
    pcRemote.onicecandidate = (event) => {
        //console.log("pcRemote candidate:", event);
        pcLocal.addIceCandidate(event.candidate);
    }
    //3.0 远端有媒体流后会触发ontrack事件
    pcRemote.ontrack = (event) => {
        //console.log("pcRemote ontrack:", event);
        remoteVideo.srcObject = event.streams[0];
    }
    /* 2.本地端添加媒体流到peerconnection中 */
    devMediaStream.getTracks().forEach((track) => {
        //console.log(track);
        pcLocal.addTrack(track, devMediaStream);
    });

    // 3.1 本地端创建offer并调用setLocalDescription，将offer设置到本地槽
    pcLocal.createOffer().then((offer) => {
        //console.log("offer: ", offer);
        pcLocal.setLocalDescription(offer);

        // 3.2 offer经信令服务器转发给pcRemote

        // 3.3 远端调用setRemoteDescription将offer设置到远程槽
        pcRemote.setRemoteDescription(offer);

        // 3.4 远端创建answer，并设置到本地槽
        pcRemote.createAnswer().then((answer) => {
            console.log("answer: ", answer);
            pcRemote.setLocalDescription(answer);
            // 3.5 远端将answer通过信令服务器发给本地端

            // 3.6 本地端调用setRemoteDescription将Answer设置到本地槽
            pcLocal.setRemoteDescription(answer);
        }).catch(handleError);

    }).catch(handleError);



    /* 这时候就会触发onicecandidate事件了*/


}

function hangUp()
{
    console.log("hangUp");
    pcLocal.close();
    pcRemote.close();
    pcLocal = null;
    pcRemote = null;
}

buttonStart.onclick = start;
buttonCall.onclick = call;
buttonHangUp.onclick = hangUp;


