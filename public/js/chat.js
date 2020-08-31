$(document).ready(function(){

	var msgBox = $("#message-box");
	var joined = false;
	var typing = false;
	var timeoutTyping;

	if (msgBox.length) {

		var user = $('#chat-info').data('user');
		var channel = $('#chat-info').data('channel');

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

		socket.on('messageIn', (msgData) => {
			addMsg(msgData);
		});

		//Emit typing
		msgBox.bind('keypress', () => {
			socket.emit('typing', {user: user, channel: channel});
		})

		//Submit msg
		$('#postMsg').bind('click', () => {
			var msgOut = {
				user: user,
				channel: channel,
				msg: msgBox.val(),
				direction: 'out',
			}
			socket.emit('messageOut', msgOut);
			addMsg(msgOut);
		})
	}

	function hideTyping() {
		if (typing) {
			$('#participants small').addClass('d-none');
		}
		typing = false;
	}

	function startChat(){
		var msgTxt 			= `Welcome to ${channel.name}, ${user.name }!`;
		alertChannel(msgTxt);
	}
	
	function alertChannel(alertTxt){
		var alert = `<div class="alert alert-primary" role="alert">${alertTxt}</div>`;
		$('#chat').append(alert);
		$('#chat .alert').delay(2000).fadeOut(600, function() { $(this).remove(); }); 
	}

	function addMsg(msgData){
		var msg = `
			<div class="media ${msgData.direction}" data-time="${msgData.time}">
				<div class="user">
					<img src="${msgData.user.image}" alt="Image">
					<p>${msgData.user.name}</p>
				</div>
				<div class="media-body">
					${msgData.msg}
					<i class="fas fa-ellipsis-h" 
						data-toggle="popover" 
						data-html="true" 
						data-placement="bottom" 
						data-content="<i class='fas fa-edit'></i><i class='fas fa-trash-alt'></i>">
					</i>
				</div>
				<small class="text-muted">Just now</small>
			</div>
		`;
		$('#chat').append(msg);
	}

});