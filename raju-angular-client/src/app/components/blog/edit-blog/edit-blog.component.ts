import { BlogService } from './../../../services/blog.service';
import { Component, OnInit } from '@angular/core';
import {Location} from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-edit-blog',
  templateUrl: './edit-blog.component.html',
  styleUrls: ['./edit-blog.component.css']
})
export class EditBlogComponent implements OnInit {

  rajuBootstrapClass;
  rajuResponseMessage;
  processing = false;
  blog;
  currentUrl;
  loading = true;  //Loading the current blog post data

  constructor( private location: Location, private activatedRoute: ActivatedRoute, 
  private blogService: BlogService, private router: Router) { }

  ngOnInit() {
    this.currentUrl = this.activatedRoute.snapshot.params; // When component loads, grab the id
    this.blogService.getSingleBlog(this.currentUrl.id).subscribe(data => {

      if(!data.success){
        this.rajuBootstrapClass = 'alert alert-danger';
        this.rajuResponseMessage = data.message;
      } else {
        this.blog = data.blog;
        this.loading  = false;   //loading is done
      }
      
    });
  }
  
  // Function to Submit Update
  updateBlogSubmit() {
    this.processing = true; // Lock form fields
    // Function to send blog object to backend
    this.blogService.editBlog(this.blog).subscribe(data => {
      // Check if PUT request was a success or not
      if (!data.success) {
        this.rajuBootstrapClass = 'alert alert-danger'; // Set error bootstrap class
        this.rajuResponseMessage = data.message; // Set error message
        this.processing = false; // Unlock form fields
      } else {
        this.rajuBootstrapClass = 'alert alert-success'; // Set success bootstrap class
        this.rajuResponseMessage = data.message; // Set success message
        // After two seconds, navigate back to blog page
        setTimeout(() => {
          this.router.navigate(['/blog']); // Navigate back to route page
        }, 2000);
      }
    });
  }

  goBack(){
    this.location.back();
  }

}
