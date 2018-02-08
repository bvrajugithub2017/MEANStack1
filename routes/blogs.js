const express = require('express');
const router = express.Router();

const User = require('../models/user.js');
const Blog = require('../models/blog.js');

const jwt = require('jsonwebtoken');
const dbConfig = require('../config/database.js');  //.js extension is optional

router.post('/newBlog', (req, res) => {

    if (!req.body.title) {
        res.json({ success: false, message: 'You must provide Blog title.' });
    }
    else {
        if (!req.body.body) {
            res.json({ success: false, message: 'You must provide Blog body.' });
        } else {
            if (!req.body.createdBy) {
                res.json({ success: false, message: 'Blog creator is required.' });
            } else {
                let blog = new Blog({
                    title: req.body.title,
                    body: req.body.body,
                    createdBy: req.body.createdBy
                });
                blog.save((err) => {
                    if (err) {
                        //validation errors specific to each fields
                        if (err.errors.title) {
                            res.json({ success: false, message: err.errors.title.message });
                        } else {
                            if (err.errors.body) {
                                res.json({ success: false, message: err.errors.body.message });
                            } else {
                                res.json({ success: false, message: err.errmsg });
                            }
                        }
                    } else {
                        res.json({ success: true, message: 'Blog saved Successfully!' });
                    }
                });
            }
        }
    }
});

router.get('/allBlogs', (req, res) => {

    Blog.find({}, (err, blogs) => {
        if (err) {
            res.json({ success: false, message: err });
        } else {
            if (!blogs) {
                res.json({ success: false, message: 'No blogs found.' });
            } else {
                res.json({ success: true, allBlogs: blogs });
            }
        }
    }).sort({ '_id': -1 });  //to display newest posts first
});

//useful For Edit Blog and Delete Blog
router.get('/singleBlog/:id', (req, res) => {

    if (!req.params.id) {
        res.json({ success: false, message: 'Blog Id was not provided' });
    } else {
        Blog.findOne({ _id: req.params.id }, (err, blog) => {
            if (err) {
                res.json({ success: false, message: err });
            } else {
                if (!blog) {
                    res.json({ success: false, message: 'Blog not found' });
                } else {
                    res.json({ success: true, blog: blog });
                }
            }
        });
    }
});

//Note: Only for update CRUD operation we need to provide two routes, 1st one to get the existing data
//2nd one to update the new data
router.put('/updateBlog', (req, res) => {
    // Check if id was provided
    if (!req.body._id) {
        res.json({ success: false, message: 'No blog id provided' }); 
    } else {
        // Check if id exists in database
        Blog.findOne({ _id: req.body._id }, (err, blog) => {
            // Check if id is a valid ID
            if (err) {
                res.json({ success: false, message: 'Not a valid blog id' }); 
            } else {
                // Check if id was found in the database
                if (!blog) {
                    res.json({ success: false, message: 'Blog id was not found.' }); 
                } else {

                    blog.title = req.body.title; // Save latest blog title
                    blog.body = req.body.body; // Save latest body
                    blog.save((err) => {
                        if (err) {
                            if (err.errors) {
                                res.json({ success: false, message: 'Plz fill the form properly' });
                            } else {
                                res.json({ success: false, message: err }); 
                            }
                        } else {
                            res.json({ success: true, message: 'Blog Updated!' }); 
                        }
                    });
                }
            }
        });
    }

});


router.delete('/deleteBlog/:id', (req, res) => {
    if (!req.params.id) {
        res.json({ success: false, message: 'Blog Id was not provided' });
    } else {
        Blog.findOne({ _id: req.params.id }, (err, blog) => {
            if (err) {
                res.json({ success: false, message: err }); //may be invalid id
            } else {
                if (!blog) {
                    res.json({ success: false, message: 'Blog not found' });
                } else {
                    blog.remove( (err) => {
                        if(err){
                            res.json({success: false, message: err});
                        } else {
                            res.json({success: true, message : 'Blog deleted successfully!'});
                        }
                    });

                }
            }
        });
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


router.put('/likeBlog/', (req, res) => {
    //console.log("router.put() invoked " + req.body.id);
    //These console statements won't be displayed on the Browser Developer Tools
    //These are visible on the command prompt where Node.js Server is running
    //Note: req.body contains only id passed from likeBlog() in blog.service.ts
    if (!req.body.id) {
        res.json({ success: false, message: 'Blog Id was not provided' });
    } else {
        Blog.findOne({ _id: req.body.id }, (err, blog) => {
            if (err) {
                res.json({ success: false, message: err }); //may be invalid id
            } else {
                if (!blog) {
                    res.json({ success: false, message: 'Blog not found' });
                } else {
                    //here we have to pass the userid but not blog id
                    //req.body.id: gives blog id
                    //req.decoded.userId gives user id
                    User.findOne({_id: req.decoded.userId}, (err, user) => {
                        if(err){
                            res.json({success: false, message : err});
                        } else {
                            if(!user){
                                res.json({success: false, message : "Error1: " + err});
                            } else {
                                //make sure that the person liking the blog post is not the same person who posted it
                                if(user.username == blog.createdBy){
                                    res.json({success: false, message : 'Can not like your own post.'});
                                } else {
                                    //checking if already liked it:
                                    if(blog.likedBy.includes(user.username)){
                                        res.json({success: false, message: 'You already liked it'});
                                    } else {
    //checking if the user has disliked it before, then we have to decrement the disLikes count, 
    //remove his/her name from the disLikedBy array and increment the likes count and add his/her name
                                        //to the likedBy array
                                        if(blog.disLikedBy.includes(user.username)){
                                            blog.disLikes--;

                                            //look for the user in the disLikedBy array
                                            const arrayIndex = blog.disLikedBy.indexOf(user.username);
                                            //remove the user from the disLikedBy array
                                            blog.disLikedBy.splice(arrayIndex, 1); //to remove one element

                                            //then increment the likes count
                                            blog.likes++;
                                            //add the user to the likedBy array
                                            blog.likedBy.push(user.username);

                                            blog.save( (err) => {
                                                if(err){
                                                    res.json({success: false, message: err});
                                                } else {
                                                    res.json({success: true, message: 'This Blog Post liked!'});
                                                }
                                            });

                                        } else {
                            //if the user has never disliked this blog post before
                            //similar code but without touching the disLikes count or disLikedBy array
                                                //then increment the likes count
                                            blog.likes++;
                                            blog.likedBy.push(user.username);
                                            blog.save( (err) => {
                                                if(err){
                                                    res.json({success: false, message: err});
                                                } else {
                                                    res.json({success: true, message: 'This Blog Post liked!'});
                                                }
                                            }); //end of save()
                                        }
                                    }
                                }
                            }
                        }
                    }); //end of User.findOne()
                }
            }
        }); //end of blog.findOne()
    }
}); //end of router.put()

router.put('/disLikeBlog/', (req, res) => {
    if (!req.body.id) {
        res.json({ success: false, message: 'Blog Id was not provided' });
    } else {
        Blog.findOne({ _id: req.body.id }, (err, blog) => {
            if (err) {
                res.json({ success: false, message: err }); //may be invalid id
            } else {
                if (!blog) {
                    res.json({ success: false, message: 'Blog not found' });
                } else {
                    User.findOne({_id: req.decoded.userId}, (err, user) => {

                        if(err){
                            res.json({success: false, message : err});
                        } else {
                            if(!user){
                                res.json({success: false, message : 'Could not authenticate user.'});
                            } else {
                                if(user.username == blog.createdBy){
                                    res.json({success: false, message : 'Can not disLike your own post.'});
                                } else {
                                    //checking if already disLiked it:
                                    if(blog.disLikedBy.includes(user.username)){
                                        res.json({success: false, message: 'You already disLiked it'});
                                    } else {
    //checking if the user has liked it before, then we have to decrement the Likes count, 
    //remove his/her name from the LikedBy array and increment the disLikes count and add his/her name
                                        //to the disLikedBy array
                                        if(blog.likedBy.includes(user.username)){
                                            blog.likes--;

                                            //look for the user in the likedBy array
                                            const arrayIndex = blog.likedBy.indexOf(user.username);
                                            //remove the user from the likedBy array
                                            blog.likedBy.splice(arrayIndex, 1); //to remove one element

                                            //then increment the disLikes count
                                            blog.disLikes++;
                                            //add the user to the disLikedBy array
                                            blog.disLikedBy.push(user.username);

                                            blog.save( (err) => {
                                                if(err){
                                                    res.json({success: false, message: err});
                                                } else {
                                                    res.json({success: true, message: 'This Blog Post disLiked!'});
                                                }
                                            });

                                        } else {
                                            blog.disLikes++;
                                            blog.disLikedBy.push(user.username);
                                            blog.save( (err) => {
                                                if(err){
                                                    res.json({success: false, message: err});
                                                } else {
                                                    res.json({success: true, message: 'This Blog Post disLiked!'});
                                                }
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    });
                }
            }
        });
    }
});

router.post('/comment', (req, res) => {
        if(!req.body.comment){
            res.json({success: false, message : 'No Comment provided'});
        } else{
            if(!req.body.id){
                res.json({success: false, message : 'No Blog Id provided'});
            } else {
                Blog.findOne({_id: req.body.id}, (err, blog) => {
                    if(err){
                        res.json({success: false, message : "Blog: " + err});
                    } else {
                        if(!blog){
                            res.json({success: false, message : 'Blog not found'});
                        } else {
                            User.findOne({_id: req.decoded.userId}, (err, user) => {
                                if(err){
                                    res.json({success: false, message : "User: " + err});
                                } else {
                                    if(!user){
                                        res.json({success: false, message : 'User not found'});
                                    } else {
                                        blog.comments.push({
                                            comment: req.body.comment,
                                            commentator: user.username
                                        });

                                        blog.save( (err) => {
                                            if(err){
                                                console.log("Raju: " + err);
                                                res.json({success: false, message : 'Comment not saved: ' + err});
                                            } else {
                                                res.json({success: true, message : 'Comment saved!'});
                                            }
                                        });
                                    }
                                }
                            });  //end of user.findOne()
                        }
                        
                    }
                }); //end of blog.findOne()
            }
        }
});  //end of router.post()

module.exports = router;
