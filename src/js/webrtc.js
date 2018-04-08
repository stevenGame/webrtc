

/**
*	即时聊天
*	实现的步骤：1.录制视频 2.上传视频
*/


/**
*	1.MediaStream  			捕获音视频
*	2.RTCPeerConnection 	传输音视频流
*   3.RTCDataChannel    	上传音视频为禁止数据(一般用到流的上传)
*/


/**
*	MediaSteam只收WebRTC和底层物理流的中间层,由MediaStreamStrck和MediaStream两部分构成
*	MediaStreamStrck是一个单独的音轨，MediaStream是大于等于0个MediaStreamStrck
*   创建一个MediaStream对象，用来获取音视频的录制权限等
*/


let WebRTC = {
	constraints: {
		//设置捕获音视频
		video: true,	//视频
		audio: false    //音频		
	}
};
let ms = null;
let videoElement = null;



ms = new MediaStream();


/**
*	获取音频或视频成功的回调
*/
function successCallback(stream){
	window.stream = stream; //MediaStream实例
	if(window.URL){
		videoElement.src = window.URL.createObjectURL(stream);    //用来创建可以播放的src
	}else{
		videoElement.src = stream;
	}
}

/**
*	获取音频或视频失败的回调
*/
function errorCallback(error){
	console.log("创建失败", error);
}


/**
*	获取音频或视频
*/
function getUserMedia(ele, constraints){
	//因为浏览器的原因，所以需要使用下面的方法获取navigator.getUserMedia, 分别为W3C标准、Chrome、Firefox
	navigator.getUserMedia 	= navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUSerMedia;	
	WebRTC.constraints 		= constraints || WebRTC.constraints;
	videoElement 			= ele;
	navigator.getUserMedia( WebRTC.constraints, successCallback, errorCallback);
}



/**
*	或去音视频后开始流的交换
*	1.需要获取对象的IP地址和端口号
*	2.需要对对方的音视频编码解码等电脑硬件信息有所了解
*	3.前两部分的条件满足后就可以通过RTCPeerConnection对象来建立连接
*/


/**
*	获取对方的IP地址和端口号
*/








export default{
	getUserMedia(ele){
		//获取MediaStream实例
		// console.log(ele.src);
		videoElement = ele;
		// navigator.getUserMedia(constraints, successCallback, errorCallback);		
	}
}






























