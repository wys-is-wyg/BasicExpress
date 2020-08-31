/**
 * Socket Class.
 *
 * @class
 *
 */
class Socket{

    constructor(){

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

}
module.exports = Socket;