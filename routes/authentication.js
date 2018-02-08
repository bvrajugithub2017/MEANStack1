const express = require('express');
const router = express.Router();

const User = require('../models/user.js');
//we shall use it later for persisting the User object to the MongoDB database
//Note: ../ means parent(root) of the current directory(routes)

const jwt = require('jsonwebtoken');
const dbConfig = require('../config/database.js');  //.js extension is optional

router.post('/register', (req, res) => {

    if(!req.body.email){
        //these conditions can't validate if we give only spaces as the value
        //for the rescue we need user-defined validators
        res.json({ success: false, message: 'You must provide an email'});
    }
    else{
        if(!req.body.username){
            res.json({ success: false, message: 'You must provide a username'});
        } else {
            if(!req.body.password){
                res.json({ success: false, message: 'You must provide a password'});
            } else{
                let user = new User({
                    email: req.body.email.toLowerCase(),
                    username: req.body.username.toLowerCase(),
                    password: req.body.password
                });
                user.save( (err) => {
                    if(err){
                        //specific one
                        if(err.code == 11000){
                            res.json({ success: false, message: 'email or username already exists', err});
                        }
                        else{
                            if(err.errors){
                                if(err.errors.email){
                                    //to display custom validation error message
                                    res.json({success: false, message: err.errors.email.message});
                                } else {
                                    if(err.errors.username){
                                        //to display custom validation error message
                                        res.json({success: false, message: err.errors.username.message});
                                    } else {
                                        if(err.errors.password){
                                            //to display custom validation error message
                                            res.json({success: false, message: err.errors.password.message});
                                        } else {
                                            //general one
                                            res.json({ success: false, message: 'Error: ', err});
                                        }
                                    }
                                }
                            }  
                        }
                    }
                    else{
                        res.json({ success: true, message: 'User Account Registered Successfully!'});
                    }
                });     
            }
        }
    }
});


router.get('/checkUsername/:username', (req, res) => {

    if(!req.params.username){
        res.json({success: false, message: 'Hello, username was not provided!'});
    } else {
        User.findOne( {username: req.params.username}, (err, user) => {
            if(err){
                res.json({success: false, message: err});
            } else {
                if(user){
                    res.json({success: false, message: 'username is already taken'});
                } else {
                    res.json({success: true, message: 'username is available'});
                }
            }

        });
    }
});


router.get('/checkEmail/:email', (req, res) => {

    if(!req.params.email){
        res.json({success: false, message: 'Hello, E-mail was not provided!'});
    } else {
        User.findOne( {email: req.params.email}, (err, user) => {
            if(err){
                res.json({success: false, message: err});
            } else {
                if(user){
                    res.json({success: false, message: 'E-mail is already taken'});
                } else {
                    res.json({success: true, message: 'E-mail is available'});
                }
            }

        });
    }
});

//Router for Login
router.post('/login', (req, res) => {
    if(!req.body.username){
        res.json({success: false, message: 'No username was provided'});
    } else {
        if(!req.body.password){
            res.json({success: false, message: 'No password was provided'});
        } else {
            User.findOne({username: req.body.username.toLowerCase()}, (err, user) => {
                    if(err){
                        res.json({success: false, message: err});
                    } else {
                        if(!user){
                            res.json({success: false, message: 'Username not found'});
                        } else{
                            const validPassword = user.comparePassword(req.body.password);

                            if(!validPassword){
                                res.json({success: false, message: 'Invalid Password'});
                            } else{
                                
                                const myToken = jwt.sign(
                                    {userId: user._id}, 
                                    dbConfig.secret,
                                    {expiresIn: '2h'}
                                );

                                res.json({
                                            success: true, 
                                            message: 'Success!', 
                                            token: myToken,
                                            user: {username: user.username}
                                        });
                            }
                        }
                    }
            });
        }
    }
});

//adding a middleware for intercepting the headers and grabbing the tokens from them
router.use( (req, res,next) => {
    const token = req.headers['authorization']; //key inside createAuthenticationHeaders() of auth.service.ts file
    if(!token){
        res.json({success: false, message: 'No token provided'});
    } else {
        jwt.verify(token, dbConfig.secret, (err, decodedToken) => {
            if(err){
                //token has expired or invalid
                res.json({success: false, message: 'Token invalid/expired: ' + err});
            } else {
                req.decoded = decodedToken;
                next();
            }
        });
    }
});

//Router for Profile
router.get('/profile', (req, res) => {

    //the token contains the info: userId, time it was created, expiry time
    //res.send(req.decoded);

    User.findOne({ _id: req.decoded.userId}).select('username email').exec((err, user) => {

        if(err){
            res.json({success: false, message: err});
        } else {
            if(!user){
                res.json({success: false, message : 'User not found'});
            } else {
                res.json({success: true, user: user});
            }
        }

    });
});

router.get('/publicProfile/:username', (req, res) => {
    if(!req.params.username){
        res.json({success: false, message: 'No username was provided'});
    } else {
        User.findOne({username : req.params.username}).select('username email').exec((err, user) => {
            if(err){
                res.json({success: false, message: err});
            } else {
                if(!user){
                    res.json({success: false, message: 'username not found'});
                } else {
                    res.json({success: true, user: user});
                }
            }
        });
    }
});


module.exports = router;
