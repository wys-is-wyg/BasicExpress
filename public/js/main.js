$(document).ready(function(){

	setNotices = function(notice){
		$('#notices').html(`<p>${notice}</p>`);
	}
	
	$('[data-toggle="tooltip"]').tooltip();
	$('[data-toggle="popover"]').popover();

	$('.custom-file-input').change(function(e){
		var fileName = e.target.files[0].name;
		$(this).next('.custom-file-label').html(fileName);
	});

   	//make connection
	var socket = io.connect('http://localhost:3000')
	var message = $("#message-box");
	var joined = false;
	var notice = false;

	if (message.length) {
		if (!joined) {
			var data = {
				userId: "",
				displayName: "",
				channelId: "",
				channelName: ""
			}
			data.userId = $('#userId').val();
			data.displayName = $('#displayName').val();
			data.channelId = $('#channelId').val();
			data.channelName = $('#channelName').val();
			socket.emit('join', data);
		}
		socket.on('notice', notice => {
			setNotices(notice);
		});

		//Emit typing
		message.bind('keypress', () => {
			socket.emit('typing');
		})

	}

});