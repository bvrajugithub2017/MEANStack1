import { BlogService } from './../../../services/blog.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-delete-blog',
  templateUrl: './delete-blog.component.html',
  styleUrls: ['./delete-blog.component.css']
})
export class DeleteBlogComponent implements OnInit {

  rajuBootstrapClass;
  rajuResponseMessage;
  foundBlog = false;
  processing = false;
  blog;
  currentUrl;
  
  constructor(private blogService: BlogService, 
    private activatedRoute : ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.currentUrl = this.activatedRoute.snapshot.params; // When component loads, grab the id
    this.blogService.getSingleBlog(this.currentUrl.id).subscribe(data => {

      if(!data.success){
        this.rajuBootstrapClass = 'alert alert-danger';
        this.rajuResponseMessage = data.message;
      } else {
        this.blog = data.blog;
        this.foundBlog = true;
      }
      
    });

  }

  deleteBlog(){
    this.processing = true;
    this.blogService.deleteBlog(this.currentUrl.id).subscribe(data => {
      if(!data.success){
          this.rajuBootstrapClass = 'alert alert-danger'
          this.rajuResponseMessage = data.message;
      } else {
        this.rajuBootstrapClass = 'alert alert-success'
        this.rajuResponseMessage = data.message;

        setTimeout(() => {
          this.router.navigate(['/blog']);
        }, 2000);
      }

    });
  }

}
