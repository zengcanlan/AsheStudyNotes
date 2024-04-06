'use strict'


// 参考: https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Simple_RTCDataChannel_sample
// 消息显示区域
var ta1 = document.querySelector('textarea#ta1');
var ta2 = document.querySelector('textarea#ta2');

// 消息发送区域
var input1 = document.querySelector('input#input1');
var input2 = document.querySelector('input#input2');

// 消息发送按钮
var bt1= document.querySelector('button#bt1');
var bt2 = document.querySelector('button#bt2');

bt1.onclick = ()=>{
    console.log('input1: ', input1.value);
    dataChanLocal.send(input1.value);
}
bt2.onclick = ()=>{
    console.log('input2: ', input2.value);
    dataChanRemote.send(input2.value);
}

function handelError(err)
{
    console.log('handelError: ', err);
}

var pcLocal = new RTCPeerConnection();  // 本地端peerConnection
var pcRemote = new RTCPeerConnection(); // 远程端peerConnection

// 双向数据通道
var dataChanLocal = null;
var dataChanRemote = null;

pcLocal.onconnectionstatechange = (e)=>{
    console.log('pcLocal: ', pcLocal.connectionState);
};
pcRemote.onconnectionstatechange = (e)=>{
    console.log('pcRemote: ', pcRemote.connectionState);
};

// ice candidate
pcLocal.onicecandidate = (e) => {
    pcRemote.addIceCandidate(e.candidate);
};
pcRemote.onicecandidate = (e) => {
    pcLocal.addIceCandidate(e.candidate);
};

// 创建数据通道, 填充消息通道事件函数
// 两端建立连接后remote端会触发ondatachannel事件,事件中Local端创建的数据通道
dataChanLocal = pcLocal.createDataChannel("dataChannel");
dataChanLocal.onopen    = e => console.log('dataChanLocal onopen');
dataChanLocal.onmessage    = e => {
    console.log('dataChanLocal.onmessage: ', e.data);
    ta1.value = ta1.value + e.data;
};
dataChanLocal.onclose   = e => console.log('dataChanLocal onclose');

pcRemote.ondatachannel = (e) =>{
    console.log('pcRemote.ondatachannel');
    dataChanRemote = e.channel;
    dataChanRemote.onopen       = e => console.log('dataChanRemote onopen');
    dataChanRemote.onmessage    = e => {
        console.log('dataChanRemote.onmessage: ', e.data);
        ta2.value = ta2.value + e.data;
    };
    dataChanRemote.onclose      = e => console.log('dataChanRemote onclose');
};

// 媒体协商
pcLocal.createOffer()
.then(offer => pcLocal.setLocalDescription(offer))
.then(() => pcRemote.setRemoteDescription(pcLocal.localDescription))
.then(() => pcRemote.createAnswer())
.then(answer => pcRemote.setLocalDescription(answer))
.then(() => pcLocal.setRemoteDescription(pcRemote.localDescription))
.catch(handelError);


