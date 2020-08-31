/**
 * MessageModel Class.
 * 
 * Singleton class that wraps Firebase methods for 
 * CRUD commands on message docs
 *
 * @class
 *
 */
class MessageModel{


    /**
     * Model constructor. 
     * 
     * On subsequent instantiation, returns initial class.
     */
    constructor(){
        
        // If class already instatiated, return the initial instance
        if (typeof this.instance === 'object') {
            return this.instance;
        }

        // assign class instance to this.instance
        this.instance = this;
        return this;
    }


    /**
     * getMessages method retrieves channel messages
     * 
     * @param {string} channelId channel to fetch messages for from Firebase
     * 
     * @returns {Object} channel data
     */

    getMessages = async (channelId) => {

    }

}
module.exports = MessageModel;