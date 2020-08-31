/**
 * Socket Class.
 *
 * @class
 *
 */
class Socket{

    constructor(){
        AraDTIO.on('connection', async (socket) => {
            console.log('Connected succesfully to the socket ...');
            socket.on('join', (data) => {
                console.log(data);
                socket.broadcast.to(data.channelId).emit('alert', `${data.displayName} has joined the channel!`);
            });
            socket.on('typing', async () => {
                console.log('Typing ...');
                try{
                    var currentUser = await AraDTDatabase.firebase.auth().currentUser;
                    socket.emit('message', { user: 'admin', text: `${user.name}, welcome to room ${user.room}.`});
                    console.log(currentUser.displayName);
                    return;
                } catch(error) {
                    throw error;
                }
            });
            socket.on('disconnect', function(){
                console.log('Disconnected succesfully to the socket ...');
            });
        });
    }
    
	msgChannel(msgTxt, chatUser){
		var time = 0;
		var msg = `
			<div class="media out">
				<div class="user">
					<img src="${chatUser.photoURL}" alt="Image">
					<p>${chatUser.displayName}</p>
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
	}

}
module.exports = Socket;