/**
 * MessageController Class.
 * 
 * Adds routing middleware for all message functionality.
 *
 * @class MessageController
 *
 */
class MessageController{

    constructor(){
        this.setVariables();
        AraDTApp.get('/messages', this.fetchMessages);
        AraDTApp.post('/messages/add', this.addMessage);
        AraDTApp.get('/messages/delete/:messageId', this.deleteMessage);
        AraDTApp.post('/messages/edit/:messageId', this.updateMessage);
    }
    
    /**
     * Transfer variables from sessions to locals.
     */
    setVariables(){
        AraDTApp.use(async (request, response, next) => {
            response.locals.messages = {};
            if (!response.locals.errors){
                response.locals.errors = {};
            }
            if (!request.session.errors.messages){
                request.session.errors.messages = {};
            }
            if (!response.locals.errors.messages){
                response.locals.errors.messages = {};
            }
        
            try{
                await this.fetchMessageData(request, response, next);
            } catch(error) {
                response.locals.errors.general = [error.message];
            }

            next();
        });
    }

    /**
     * Just gets all messages
     */
    fetchMessages = async (request, response, next) => {
        next();
    };

    /**
     * 
     */
    addMessage = async (request, response, next) => {
        next();
    };

    /**
     * Fetchs data for the message you wish to edit:
     */
    readMessage = async (request, response, next) => {
        next();
    };

    /**  
     * 
     */
    updateMessage = async (request, response, next) => {
        next();
    };

    /**
     * 
     */
    deleteMessage = async (request, response, next) => {
        next();
    }

}
module.exports = MessageController;