/**
 * Socket Class.
 *
 * @class
 *
 */
class Socket{

    constructor(){

        this.channel = '';

        AraDTIO.on('connection', async (socket) => {
            
            // once a client has connected, we expect to get a ping from them saying what room they want to join
            socket.on('join', (data) => {
                console.log('############## JOIN ALERT ####################');
                console.log(data);
                socket.join(data.channel.uid);
                socket.to(data.channel.uid).emit('alert', `${data.user.name} has joined the channel ${data.channel.name}!`);
            });
            socket.on('typing', async (data) => {
                console.log('############## TYPE SERVER ####################');
                console.log(data);
                socket.to(data.channel.uid).emit('typing', data.user.uid);
            });
            socket.on('disconnect', function(data){
                console.log('############## DISCONNECT ALERT ####################');
                console.log(data);
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