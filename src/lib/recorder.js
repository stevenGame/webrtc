/**
*	录音
*/

import Recorder from 'recorderjs';



let audio_context  = null;
let Record         = {};  
let isSupportMedia = false;
let debug 		   = true;   //是否显示log消息


function showLog(...msg){
	if(debug){
		console.log(...msg);
	}
}


/**
*	检测是支持getUserMedia
*/
function checkSupporMedia(){
	try{
	  navigator.getUserMedia 	= navigator.getUserMedia || navigator.webkitGetUserMedia ;
	  window.AudioContext 		= window.AudioContext || window.webkitAudioContext;
	  window.URL 				= window.URL || window.webkitURl;

	  return true;
	}catch(e){
		console.log("getUserMedia err : ", e);
	}	
	return false;
}



/**
*	初始化record
*/

function startUserMedia(stream){
	let input = audio_context.createMediaStreamSource(stream);
	Record.record = new Recorder(input);
}

Record.getUserMedia = function(){
	isSupportMedia = checkSupporMedia();

	if(!isSupportMedia){
		showLog("该浏览器版本不支持获取麦克风设备");
		return;
	}	
	audio_context 	= new AudioContext;
	navigator.getUserMedia({audio:true}, startUserMedia, function(){
		console.log('getUserMedia success');
	})	
}




/**
*	开始录音
*/
Record.startRecord = function(callback){
  this.record && this.record.record();
  if(callback){
  	callback();
  }
}



/**
*	停止录音
*/
Record.stopRecord = function(callback){
	this.record && this.record.stop();
	createDownLink(callback);
	this.record && this.record.clear();
}




/**
*	录音停止后创建连接
*/
Record.createDownLink = function(callback){
  this.record && this.record.exportWAV(function(blod){
    let reader = new FileReader();
    reader.readAsArrayBuffer(blod);
    reader.onload = function(event){
      //读取音乐文件的二进制文件
		if(callback){
			callback(event.target.result);
		}
    }
  })
}




export {Record};























