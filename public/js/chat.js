var user = {
	uid: "",
	image: "",
	name: ""
}
var channel = {
	uid: "",
	name: ""
}

$(document).ready(function(){

	var msgBox = $("#message-box");
	var joined = false;
	var typing = false;
	var timeoutTyping;

	if (msgBox.length) {

		channel.uid 		= $('#channelId').val();
		//make connection
	 	var socket = io.connect('http://localhost:3000');
		socket.on('connect', function() {
			if (!joined) {
				startChat();
				socket.emit('join', {user: user, channel: channel});
				joined = true;
			}
		});

		socket.on('alert', (alertTxt) => {
			alertChannel(alertTxt);
		});

		socket.on('typing', (typist) => {
			typing = true;
			$('#user' + typist + ' small').removeClass('d-none'); 
			clearTimeout(timeoutTyping);
			timeoutTyping = setTimeout(hideTyping, 2000);
		});

		socket.on('message', (msgTxt) => {
			console.log('############## MSG ####################');
			console.log(msgTxt);
			msgChannel(msgTxt);
		});

		//Emit typing
		msgBox.bind('keypress', () => {
			socket.emit('typing', {user: user, channel: channel});
		})

		//Submit msg
		$('#postMsg').bind('click', () => {
			socket.emit('message', msgBox.val(), user);
		})
	}

	function hideTyping() {
		if (typing) {
			$('#participants small').addClass('d-none');
		}
		typing = false;
	}

	function startChat(){
		user.uid 			= $('#userId').val();
		user.image	 		= $('#photoURL').val();
		user.name 			= $('#displayName').val();
		channel.uid 		= $('#channelId').val();
		channel.name 		= $('#channelName').val();
		var msgTxt 			= `Welcome to ${channel.name}, ${user.name }!`;
		alertChannel(msgTxt);
	}
	
	function alertChannel(alertTxt){
		var alert = `<div class="alert alert-primary" role="alert">${alertTxt}</div>`;
		$('#chat').append(alert);
		$('#chat .alert').delay(2000).fadeOut(600, function() { $(this).remove(); }); 
	}

	function msgChannel(msgTxt){
		var time = 0;
		var msg = `
			<div class="media out">
				<div class="user">
					<img src="${user.image}" alt="Image">
					<p>${user.name}</p>
				</div>
				<div class="media-body">
					${msgTxt}
					<i class="fas fa-ellipsis-h" 
						data-toggle="popover" 
						data-html="true" 
						data-placement="bottom" 
						data-content="<i class='fas fa-edit'></i><i class='fas fa-trash-alt'></i>">
					</i>
				</div>
				<small class="text-muted">${time}</small>
			</div>
		`;
		$('#chat').append(msg);
	}

});