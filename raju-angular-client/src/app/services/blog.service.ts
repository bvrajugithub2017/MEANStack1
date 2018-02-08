import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';
import {Http, Headers, RequestOptions} from '@angular/http';

@Injectable()
export class BlogService {
  domain = this.authService.domain;
  options;

  constructor(private authService: AuthService, private http: Http) { }

  createAuthenticationHeaders(){
    this.authService.loadToken();
    this.options =new RequestOptions({
      headers: new Headers({
          'Content-Type' : 'application/json', //Format set to JSON
          'authorization' : this.authService.authToken  //attaching the token
      })
    });
  }

  newBlog(blog){
    this.createAuthenticationHeaders();
    return this.http.post(this.domain + '/blogs/newBlog',blog, this.options).map(res => res.json());
  }

  getAllBlogs(){
    this.createAuthenticationHeaders();
    return this.http.get(this.domain + '/blogs/allBlogs',this.options).map(res => res.json());
  }

  // Function to get the blog using the id
  getSingleBlog(id){
    this.createAuthenticationHeaders();
    return this.http.get(this.domain + '/blogs/singleBlog/' + id,this.options).map(res => res.json());
  }
  
  editBlog(blog){
    this.createAuthenticationHeaders();
    return this.http.put(this.domain + '/blogs/updateBlog/', blog, this.options).map(res => res.json());
  }

  deleteBlog(id){
    this.createAuthenticationHeaders();
    return this.http.delete(this.domain + '/blogs/deleteBlog/' + id,this.options).map(res => res.json());
  }

  likeBlog(id){
    const blogData = {id: id};  //would be received in the route as request body
    return this.http.put(this.domain + '/blogs/likeBlog/', blogData, this.options).map(res => res.json());
  }

  disLikeBlog(id){
    const blogData = {id: id};  //would be received in the route as request body
    return this.http.put(this.domain + '/blogs/disLikeBlog/', blogData, this.options).map(res => res.json());
  }

  postCommentService(blogId, comment){
    this.createAuthenticationHeaders();
    const blogData = {
      id : blogId,
      comment : comment
    };
    return this.http.post(this.domain + '/blogs/comment', blogData, this.options).map(res => res.json());
  }
  
}
