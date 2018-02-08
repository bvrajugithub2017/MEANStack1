import { Injectable } from '@angular/core';

import {Http, Headers, RequestOptions} from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';

import { tokenNotExpired } from 'angular2-jwt';

@Injectable()
export class AuthService {

  domain = "http://localhost:3000";  //Node.js Server's port
  authToken;
  user;
  options;

  constructor(private http:Http) { }

  //we shall use this function anytime we need to attach headers. Headers will be
  //needed anytime a user has to be authenticated before they can access any page, Eg: his/her Profile page
  createAuthenticationHeaders(){
    this.loadToken();
    this.options =new RequestOptions({
      headers: new Headers({
          'Content-Type' : 'application/json',  //format set to JSON
          'authorization' : this.authToken      //attaching the token
      })
    });
  }

  //gets the token from the Web Browser's local storage
  loadToken(){
    this.authToken = localStorage.getItem('token');;
  }

  //We shall use/run this function inside the Profile component
  getProfileService(){
    this.createAuthenticationHeaders();
    return this.http.get(this.domain + "/authentication/profile", this.options).map(res => res.json());
  }

  getPublicProfileService(username){
    this.createAuthenticationHeaders();
    return this.http.get(this.domain + "/authentication/publicProfile/" + username, this.options).
                                                            map(res => res.json());
  }

  //A function that is going to Register the users
  //By invoking the (backend)RESTFuL API url
  //Refer to authentication.js for RESTFul API routes
  registerUser(user){
    return this.http.post(this.domain + '/authentication/register', user).map(res => res.json());
  }
  //Recollect that the prefix is given in index.js

  //Checking whether the username and email are available or not
  //the following routes are defined in the authentication.js
  checkUsernameService(username){
    return this.http.get(this.domain + '/authentication/checkUsername/' + username).map(res => res.json());
  }

  checkEmailService(email){
    return this.http.get(this.domain + '/authentication/checkEmail/' + email).map(res => res.json());
  }

  //to login the user
  loginService(user){
    return this.http.post(this.domain + "/authentication/login", user).map(res => res.json());
  }

  //to logout:
  logoutService(){
    this.authToken = null;
    this.user = null;
    localStorage.clear();
  }

  //to store in the browser
  storeUserDataService(token, user){
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.authToken = token;
    this.user = user;
  }

  loggedIn() {
    return tokenNotExpired();
  }
  
}
