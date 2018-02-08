import { BlogService } from './../../services/blog.service';
import { AuthService } from './../../services/auth.service';
import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms'

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css']
})
export class BlogComponent implements OnInit {

  rajuBootstrapClass;
  rajuResponseMessage;
  newPost = false;
  loadingBlogs = false;
  rajuBlogFormGroup;
  rajuProcessing = false;
  blogCreatorName;
  blogPosts;

  //comment related fields
  commentForm;
  newCommentArr = [];  
  //because we r going to have many posts on the page, 
  //we need a way to track which post the person is going to comment on.
  //when they click on "Post Comment" button, grab the id of the post they are going to comment on
  //inserting into this array for tracking purposes, once posted, remove it from here.
  enabledCommentsArr = [];

  constructor(private formBuilder: FormBuilder, private authService: AuthService, 
    private blogService: BlogService) {
    this.createNewBlogForm();

    this.createCommentForm(); // Create form for posting comments on a user's blog post
   }

   //comment validation stuff
   //comment function1
  createCommentForm(){
    this.commentForm = this.formBuilder.group({
      //FrondEnd Angular Validations
      //recollect that BackEnd Validations were done in the Model: Blog.js
      comment: ['', Validators.compose([
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(150)
      ])]
    });
  }

  createNewBlogForm(){

    this.rajuBlogFormGroup =this.formBuilder.group({
      
      title: ['', Validators.compose([
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(40),
        this.alphaNumericValidation
      ])],

      body: ['', Validators.compose([
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(500),
      ])]

    });
  }

  enableNewBlogForm(){
    this.rajuBlogFormGroup.get('title').enable();
    this.rajuBlogFormGroup.get('body').enable();
  }

  disableNewBlogForm(){
    this.rajuBlogFormGroup.get('title').disable();
    this.rajuBlogFormGroup.get('body').disable();
  }

  // Enable the comment form
  //comment function2
  enableCommentForm() {
    this.commentForm.get('comment').enable(); // Enable comment field
  }

  // Disable the comment form
  //comment function3
  disableCommentForm() {
    this.commentForm.get('comment').disable(); // Disable comment field
  }

  alphaNumericValidation(controls){
    const regExp = new RegExp(/^[a-zA-Z0-9 ]+$/);

    if(regExp.test(controls.value)){
      return null;
    } else {
      return { 'alphaNumericValidation' : true}
    }
  }

  ngOnInit() {
    //To get the current user name on page load- required to know who the blog creator is
    //this data is used while the blog object creation inside onBlogSubmit()
    this.authService.getProfileService().subscribe( profile => {
      this.blogCreatorName = profile.user.username;
    });

    this.getAllBlogs();
  }

  //gets invoked when we click on "New Post" button
  newBlogForm(){
    this.newPost = true;
  }

  //gets invoked when we click on "Reload" button
  reloadBlogs(){
      this.loadingBlogs = true;
      this.getAllBlogs();
      //to avoid the user continuously clicking on "reload" button over and over again and spam
      setTimeout( () => {
        this.loadingBlogs = false;
      }, 4000);
      //locking for 4 seconds
  }

  // Function to post a new comment on blog post
  //comment function4
  draftComment(id) {
    this.commentForm.reset(); // Reset the comment form each time users starts a new comment
    this.newCommentArr = []; // Clear array so only one post can be commented on at a time
    this.newCommentArr.push(id); // Add the post that is being commented on to the array
  }

  // Function to cancel new post transaction
  //comment function5
  cancelSubmission(id) {
    const index = this.newCommentArr.indexOf(id); // Check the index of the blog post in the array
    this.newCommentArr.splice(index, 1); // Remove the id from the array to cancel post submission
    this.commentForm.reset(); // Reset  the form after cancellation
    this.enableCommentForm(); // Enable the form after cancellation
    this.rajuProcessing = false; // Enable any buttons that were locked
  }

  //we shall edit it now
  //function to post a new comment
  //comment function6
  postComment(id){
    this.disableCommentForm(); // Disable form while saving comment to database
    this.rajuProcessing = true; // Lock buttons while saving comment to database
    const comment = this.commentForm.get('comment').value; // Get the comment value to pass to service function
    this.blogService.postCommentService(id, comment).subscribe( data =>{

      this.getAllBlogs(); // Refresh all blogs to reflect the new comment
      const index = this.newCommentArr.indexOf(id); // Get the index of the blog id to remove from array
      this.newCommentArr.splice(index, 1); // Remove id from the array
      this.enableCommentForm(); // Re-enable the form
      this.commentForm.reset(); // Reset the comment form
      this.rajuProcessing = false; // Unlock buttons on comment form
      if (this.enabledCommentsArr.indexOf(id) < 0) {
        this.expand(id); // Expand comments for user on comment submission
      }

    });
  }

   // Expand the list of comments
   //comment function7
   expand(id) {
    this.enabledCommentsArr.push(id); // Add the current blog post id to array
  }

  // Collapse the list of comments
  //comment function8
  collapse(id) {
    const index = this.enabledCommentsArr.indexOf(id); // Get position of id in array
    this.enabledCommentsArr.splice(index, 1); // Remove id from array
  }

  onBlogSubmit(){
    
    this.rajuProcessing= true;
    this.disableNewBlogForm();

    //creating blog object from the inputs
    const blog = {
      title: this.rajuBlogFormGroup.get('title').value,
      body: this.rajuBlogFormGroup.get('body').value,
      createdBy: this.blogCreatorName
    }

    //Subscribing to the Blog Service
    this.blogService.newBlog(blog).subscribe(data => {

      if(!data.success){
        this.rajuBootstrapClass = 'alert alert-danger';
        this.rajuResponseMessage = data.message;
        this.rajuProcessing = false;
        this.enableNewBlogForm();
      } else {
        this.rajuBootstrapClass = 'alert alert-success';
        this.rajuResponseMessage = data.message;
        this.getAllBlogs();

        setTimeout( () => {
            this.newPost = false;
            this.rajuProcessing = false;
            this.rajuResponseMessage = null;
            this.rajuBlogFormGroup.reset();
            this.enableNewBlogForm();
        }, 2000);
      }

    });
  }

  getAllBlogs(){
    this.blogService.getAllBlogs().subscribe(data => {
      this.blogPosts = data.allBlogs;

    });
  }

  likeBlog(id){
    this.blogService.likeBlog(id).subscribe(data => {
      this.getAllBlogs();
    });
  }

  disLikeBlog(id){
    this.blogService.disLikeBlog(id).subscribe(data => {
      this.getAllBlogs();
    });
  }

  goBack(){
    window.location.reload(); //clears all the states of the form fields
  }

}