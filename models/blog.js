const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');

//VALIDATORS FOR TITLE
let titleLengthValidator = (title) => {
    if(!title){
        //if blank
        return false;
    }
    else if(title.length < 5 || title.length > 40){
        return false;
    }
    else {
        return true;
    }
};

let alphaNumericTitleValidator = (title) => {
    if(!title){
        return false;
    }
    else {
        const regExp = new RegExp(/^[a-zA-Z0-9 ]+$/);
        //alphanumerics and spaces only are allowed
        return regExp.test(title); //returns true or false value
        
    }
};

//VALIDATOR FOR BODY
let bodyLengthValidator = (body) => {
    if(!body){
        return false;
    }
    else if(body.length < 5 || body.length > 500){
        return false;
    }
    else {
        return true;
    }
};


//VALIDATOR FOR COMMENT
let commentLengthValidator = (comment) => {
    if(!comment){
        return false;
    }
    else if(comment.length < 2 || comment.length > 150){
        return false;
    }
    else {
        return true;
    }
};

//---------------------------------------
const myTitleValidatorsArray = [
    {
        validator: titleLengthValidator, 
        message: 'Title must be atleast 5 characters and no more than 40'
    },
    {
        validator: alphaNumericTitleValidator, 
        message: 'Title can contain only alpha numberic and spaces'
    }
];
const myBodyValidatorsArray = [
    {
        validator: bodyLengthValidator, 
        message: 'Body must be atleast 5 characters and no more than 500'
    },
];
const myCommentValidatorsArray = [
    {
        validator: commentLengthValidator, 
        message: 'Comment must be atleast 2 characters and no more than 150'
    },
];

const blogSchema = new Schema({

    title: { type: String, required: true, validate: myTitleValidatorsArray },
    body: { type: String, required: true, validate: myBodyValidatorsArray },
    createdBy: { type: String, required: true },
    createdAt: { type: Date, default: Date.now()},
    likes: {type: Number, default: 0},
    likedBy: {type: Array},
    disLikes: {type: Number, default: 0},
    disLikedBy: {type: Array},
    comments: [
        {
            comment: {type: String, validate: myCommentValidatorsArray},
            commentator: {type: String}
        }
    ]
});


module.exports = mongoose.model('Blog', blogSchema);