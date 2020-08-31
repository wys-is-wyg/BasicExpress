var chatUser = {
	uid: "",
	photoURL: "",
	displayName: ""
}
var channelId = "";
var channelName = "";

$(document).ready(function(){

   	//make connection
	var socket = io.connect('http://localhost:3000');
	var msgBox = $("#message-box");
	var joined = false;

	if (msgBox.length) {

		if (!joined) {
			startChat();
			socket.emit('join', chatUser);
			joined = true;
		}

		//Emit typing
		msgBox.bind('keypress', () => {
			socket.emit('typing', chatUser);
		})

		//Submit msg
		$('#postMsg').bind('click', () => {
			socket.emit('message', msgBox.val(), chatUser);
		})

		socket.on('alert', (alertTxt) => {
			alertChannel(alertTxt);
		});

		socket.on('message', (msgTxt) => {
			msgChannel(msgTxt);
		});
	}
	
	function startChat(){
		chatUser.uid 			= $('#userId').val();
		chatUser.photoURL 		= $('#userId').val();
		chatUser.displayName 	= $('#displayName').val();
		channelId 				= $('#channelId').val();
		channelName 			= $('#channelName').val();
		var msgTxt 				= `Welcome to ${channelName}, ${chatUser.displayName }!`;
		alertChannel(msgTxt);
	}
	
	function alertChannel(alertTxt){
		var alert = `<div class="alert alert-primary" role="alert">${alertTxt}</div>`;
		$('#chat').append(alert);
		$('#chat .alert').delay(2000).fadeOut(600, function() { $(this).remove(); }); 
	}

});