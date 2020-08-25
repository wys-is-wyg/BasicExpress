/**
 * UserModel Class.
 * 
 * Singleton class that wraps Firebase methods for 
 * Auth users, such as signInWithEmailAndPassword()
 *
 * @class
 *
 */
class UserModel{

    /**
     * Model constructor. 
     * 
     * Assigns empty values for current user.
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
     * Asynchronous function that wraps 
     * Firebase.auth().signInWithEmailAndPassword()
     * On success, adds user to session
     * On failure, throws error to calling method
     * 
     * @param {Object}      request       Express request object
     * @param {Object}      response      Express response object
     * 
     * @throws {Error}
     */
    login = async (request, response) => {

        // Extract form data from request
        var user = {
            email: request.body.email,
            password: request.body.password
        }
        // Check is email is valid and password is over 6 chars
        var { valid, errors } = AraDTValidator.loginValid(user);
    
        if (!valid) {
            // Validation failed, so return errors
            throw new Error(errors);
        } else {
            // Firebase email and password login call
            await AraDTDatabase.firebase.auth()
                .signInWithEmailAndPassword(user.email, user.password)
                .then(async (data) => {
                    var userDoc = AraDTDatabase.storage.collection('users').doc(data.user.uid);
                    user = await userDoc.get();
                    if (user.exists) {
                        request.session.user = user.data();
                    } else {
                        // Now users matching these credentials
                        throw new Error('No users match these credentials');
                    }
                    // Promise to return token for the next stage
                    return data.user.getIdToken();
                })
                .then((token) => {
                    // Call suceeded, so store user token in session
                    request.session.token = token;
                })
                .catch((error) => {
                    // Throw login error from Firebase to calling method
                    throw new Error(error);
                })
        }
    };

    /**
     * Asynchronous function that wraps 
     * Firebase.auth().createUserWithEmailAndPassword()
     * On success, adds user to session
     * On failure, throws error to calling method
     * 
     * @param {Object}      request       Express request object
     * @param {Object}      response      Express response object
     * 
     * @throws {Error}
     */
    register = async (request, response) => {
        
        // Extract form data from request
        var user = {
            email: request.body.email,
            password: request.body.password,
            passwordConfirm: request.body.passwordConfirm
        }

        /*
         * Check is email is valid and 
         * password is over 6 chars 
         * and matches passwordConfirm
         */
        var { valid, errors } = AraDTValidator.registerValid(user);

        if (!valid) {
            // Validation failed, so return errors
            throw new Error(errors);
        } else {
            // Firebase email and password registration call
            await AraDTDatabase.firebase.auth()
                .createUserWithEmailAndPassword(user.email, user.password)
                .then(async (data) => {
                    var newUser = await this.addUser(data.user.email, data.user.uid);
                    request.session.user = newUser;
                    // Promise to return token for the next stage
                    return data.user.getIdToken();
                })
                .then((token) => {
                    // Call suceeded, so store user token in session
                    request.session.token = token;
                    return;
                })
                .catch((error) => {
                    // Throw error from Firebase to calling method
                    throw new Error(error);
                });
        }
    };

    /**
     * Asynchronous function that updates the user doc
     * On success, adds updated user to session
     * On failure, throws error to calling method
     * 
     * @param {Object}      request       Express request object
     * @param {Object}      response      Express response object
     * 
     * @throws {Error}
     */
    update =  async (request, response) => {
              
        if (!request.body.displayName) {
            // Validation failed, so return errors
            throw new Error('You need to include a display name');
        } else if (request.body.email) {
            // Email updating no longer allowed
            throw new Error('Updating email has now been deprecated');
        } else {
            var currentUser = request.session.user;

            // Extract form data from request
            var updatedUser = {
                uid: currentUser.uid,
                displayName: request.body.displayName,
            }

            // If form includes new avatar, upload this
            if (request.files) {
                updatedUser.photoURL = this.updateAvatar(request, currentUser.uid);
            }

            var userDoc = AraDTDatabase.storage.collection('users').doc(currentUser.uid);
            var updateRef = await userDoc.update(updatedUser);
            var user = await userDoc.get();
            
            if (user.exists) {
                request.session.user = user.data();
                response.locals.user = request.session.user;
            } else {
                // No users matching these credentials
                throw new Error('No users match these credentials');
            }
        }
    };

    /**
     * Simple middleware that destroys session and local variables
     * and redirects user to hoome page
     * 
     * @param {Object}      request       Express request object
     * @param {Object}      response      Express response object
     * 
     * @returns {Object}    response.redirect call
     */
    logout = async (request, response) => {
        request.session.errors.general = ['You have been logged out'];
        response.locals.loggedin = false;
        request.session.destroy();
        await AraDTDatabase.firebase.auth().signOut()
            .then(function() {
                response.redirect('/');
            })
            .catch(function(error) {
                response.redirect('/');
            });
    }

    /**
     * Simple middleware that checks user is logged in, 
     * then renders ./views/account.ejs.
     * 
     * @param {Object}      request       Express request object
     * @param {Object}      response      Express response object
     * 
     * @returns {Object}    response.render call
     */
    getAccount(request, response){
        
        if (!request.session.token) {
            response.redirect('/');
        }
        response.render('account');
    }
    
    /**
     * Uses ImageUpload class to check if filetype is allowed
     * then saves avatar to '/public/img/userid.ext'
     * 
     * @param {Object}      request     Express request object
     * @param {Object}      userId      user Id
     * 
     * @throws {Error}
     * 
     */
    updateAvatar(request, userId){
        
        var { result, validExtension } = AraDTImageUpload.uploadImage(request.files.avatar, userId);
        if (validExtension) {
            return result;
        } else {
            // Upload failed, so throw error
            throw new Error(result);
        }

    };

    /**
     * addUser method stores validated 
     * User data to Firebase as a new User
     * 
     * @param {Object} newUser new User object
     * 
     * @throws {Object} Error std error class
     */
    addUser = async (userEmail, userUid) => {
        
        var newUser = {
            uid: userUid,
            email: userEmail,
            displayName: '',
            photoURL: '',
            createdAt: new Date().toISOString()
        }
        //Add User
        await AraDTDatabase.storage.collection('users')
            .doc(newUser.uid)
            .set(newUser)
            .catch((error) => {
                throw Error(error);
            });

        return newUser;
    }

    /**
     * Gets all users from Firebase
     * 
     * @param {String}     currentUserId        Option to exclude user from returned list
     * 
     * @returns {Array}    array of all registered users
     */
    getUsers = async() => {
        var users = [];
        
        var users = [];
        await AraDTDatabase.storage.collection('users')
            .get()
            .then((data) => {
                data.forEach((user) => {
                    users.push(user.data());
                });
                if (users.length == 0) {
                    users = false;
                }
            })
            .catch((error) => {
                console.log('Error fetching channel data:' + error.message);
            });
        return users;
    }

    /**
     * buildUser method fetches validated 
     * User data from POST request object
     * 
     * @param {Object} request Express request object
     * 
     * @returns {Object} user object
     */
    buildUser = async (request) => {
        
        // If form includes new avatar, upload this
        // Extract form data from request
        var userEmail = request.body.email;
        var displayName = request.body.displayName;
        var currentUser = request.session.user;
        var photoURL = '';
        
        // If form includes new avatar, upload this
        if (request.files) {
            photoURL = this.updateAvatar(request, response);
        }

        var userData = {
            uid: currentUser.uid,
            email: userEmail,
            displayName: displayName,
            photoURL: photoURL
        }

        return userData;
    }

}
module.exports = UserModel;