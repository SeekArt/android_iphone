/**
* 手机API转接

* @author Aeolus
* @copyright IBOS
*/
var appSdk = {
	ready : function(func){
		document.addEventListener("deviceready", func, false);
	}
}
appSdk.camera = {
	// 当成功获得一张照片的Base64编码数据后被调用
	onPhotoDataSuccess : function (imageData) {
		// 取消注释以查看Base64编码的图像数据
		// console.log(imageData);
		// 显示拍摄的照片
		// 使用内嵌CSS规则来缩放图片
		return "data:image/jpeg;base64," + imageData;
	},
	// 当成功得到一张照片的URI后被调用
	onPhotoURISuccess : function (imageURI) {
		// 取消注释以查看图片文件的URI
		// console.log(imageURI);
		// 显示拍摄的照片
		// 使用内嵌CSS规则来缩放图片
		return imageURI;
	},
	// “Capture Photo”按钮点击事件触发函数
	capturePhoto : function (onPhotoDataSuccess) {
		// 使用设备上的摄像头拍照，并获得Base64编码字符串格式的图像
		navigator.camera.getPicture(onPhotoDataSuccess, onFail, { quality: 50 });
	},
	// “Capture Editable Photo”按钮点击事件触发函数
	capturePhotoEdit : function (onPhotoDataSuccess) {
		// 使用设备上的摄像头拍照，并获得Base64编码字符串格式的可编辑图像
		navigator.camera.getPicture(onPhotoDataSuccess, onFail, { quality: 20, allowEdit: true });
	},
	//“From Photo Library”/“From Photo Album”按钮点击事件触发函数
	getPhoto : function (source) {
		// 从设定的来源处获取图像文件URI
		navigator.camera.getPicture(onPhotoURISuccess, onFail, { quality: 50, destinationType: destinationType.FILE_URI,sourceType: source });
	},
	// 当有错误发生时触发此函数
	onFail : function (mesage) {
		alert('Failed because: ' + message);
	}
}

appSdk.gps = {
	getLocation : function(onSuccess,onError,param){
		navigator.geolocation.getCurrentPosition(onSuccess, onError, {enableHighAccuracy: true,frequency: 3000 });
	},
	/**	获取位置信息成功时调用的回调函数
	*	该方法接受一个“Position”对象，包含当前GPS坐标信息
	* 	postion 
	*/
	onSuccess : function(position) {
		console.log(position);
		lat = position.coords.latitude;
		lng = position.coords.longitude;
		alt = position.coords.altitude;
		// alert('Latitude: '          + position.coords.latitude          + '\n' +
			// 'Longitude: '         + position.coords.longitude         + '\n' +
			// 'Altitude: '          + position.coords.altitude          + '\n' +
			// 'Accuracy: '          + position.coords.accuracy          + '\n' +
			// 'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
			// 'Heading: '           + position.coords.heading           + '\n' +
			// 'Speed: '             + position.coords.speed             + '\n' +
			// 'Timestamp: '         + new Date(position.timestamp)      + '\n');
	},
	// onError回调函数接收一个PositionError对象
	onError : function (error) {
		alert('code: '    + error.code    + '\n' +
			'message: ' + error.message + '\n');
	},
	getAddress : function(lat,lng,callback){
		$.ajax({
			url: 		"http://api.map.baidu.com/geocoder/v2/?ak=9b104dba813b77a1abfc5772ccf5cca8&callback=?&location="+lat+","+lng+"&output=json&pois=0",
			/**	百度参数返回
				+ result: 
					+ addressComponent: 
						city: "保定市"
						district: "安新县"
						province: "河北省"
						street: ""
						street_number: ""
					business: ""
					cityCode: 307
					formatted_address: "河北省保定市安新县"
					+ location: 
						lat: 39.000000106057
						lng: 116.00000003025
				status: 0
			*/
			success: 	callback,
			error: 		function(err){ console.log(err); }
		});
	}
}