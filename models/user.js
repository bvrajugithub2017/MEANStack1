const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');

//VALIDATORS FOR EMAIL
let emailLengthValidator = (email) => {
    if(!email){
        //if blank
        return false;
    }
    else if(email.length < 5 || email.length > 40){
        return false;
    }
    else {
        return true;
    }
};

let emailFormatValiditor = (email) => {
    if(!email){
        return false;
    }
    else {
        //regular expression validation
        const regExp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
        return regExp.test(email); //returns true or false value
        
    }
};

//VALIDATORS FOR USERNAME
let usernameLengthValidator = (username) => {
    if(!username){
        return false;
    }
    else if(username.length < 3 || username.length > 20){
        return false;
    }
    else {
        return true;
    }
};

let usernameFormatValiditor = (username) => {
    if(!username){
        return false;
    }
    else {
        //regular expression validation
        const regExp = new RegExp(/^[0-9a-zA-Z]+$/);
        return regExp.test(username); //returns true or false value
        
    }
};


//VALIDATORS FOR PASSWORD
let passwordLengthValidator = (password) => {
    if(!password){
        return false;
    }
    else if(password.length < 8 || password.length > 30){
        return false;
    }
    else {
        return true;
    }
};

let passwordFormatValiditor = (password) => {
    if(!password){
        return false;
    }
    else {
        //regular expression validation
        const regExp = new RegExp(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\w\s]).{8,30}$/);
        return regExp.test(password); //returns true or false value
        
    }
};

//---------------------------------------
const myEmailValidatorsArray = [
    {
        validator: emailLengthValidator, message: 'Email must be atleast 5 characters and no more than 40'
    },
    {
        validator: emailFormatValiditor, message: 'Must be a valid e-mail'
    }
];
const myUsernameValidatorsArray = [
    {
        validator: usernameLengthValidator, message: 'Username must be atleast 3 characters and no more than 20'
    },
    {
        validator: usernameFormatValiditor, message: 'Username must not have special characters'
    }
];
const myPasswordValidatorsArray = [
    {
        validator: passwordLengthValidator, message: 'Password must be atleast 8 characters and no more than 30'
    },
    {
        validator: passwordFormatValiditor, message: 'Password must have atleast 1 lowercase, 1 uppercase, 1 digit and 1 special character'
    }
];

const userSchema = new Schema({

    email: { type: String, required: true, unique: true, lowercase: true, validate: myEmailValidatorsArray },
    username: { type: String, required: true, unique: true, lowercase: true, validate: myUsernameValidatorsArray },
    password: { type: String, required: true, validate: myPasswordValidatorsArray }

});

//this middleware is going to run before persisting the data
userSchema.pre('save', function(next){
    if(!this.isModified('password'))
        return next(); //if password is not yet entered by user

    //password encryption
    bcrypt.hash(this.password, null, null, (err, hash) => {
        if(err)
            return next(err);
        this.password = hash;
        next();
    });
});

//password decryption (useful while login for authentication)
userSchema.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.password);
    //comparing the existing password with the current input password
};

module.exports = mongoose.model('User', userSchema);