$(document).ready(function(){

	var msgBox = $("#message-box");
	var joined = false;
	var typing = false;
	var timeoutTyping;

	if (msgBox.length) {

		var user = $('#chat-info').data('user');
		var channel = $('#chat-info').data('channel');

	 	var socket = io.connect('http://localhost:3000');
		socket.on('connect', function() {
			if (!joined) {
				var msgTxt = `Welcome to ${channel.name}, ${user.name }!`;
				alertChannel(msgTxt);
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

		msgBox.bind('keypress', () => {
			socket.emit('typing', {user: user, channel: channel});
		})

		$('#postMsg').bind('click', () => {
			var msgData = {
				user: user,
				channel: channel,
				msg: msgBox.val(),
				direction: 'out',
			}
			addMsg(msgData);
			msgData.direction = 'in d-flex flex-row-reverse'
			socket.emit('messageOut', msgData);
		})
	}

	function hideTyping() {
		if (typing) {
			$('#participants small').addClass('d-none');
		}
		typing = false;
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