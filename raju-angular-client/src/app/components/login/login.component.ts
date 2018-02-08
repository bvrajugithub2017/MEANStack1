import { AuthGuard } from './../../guards/auth.guard';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';

import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  rajuFormGroup: FormGroup;  //to get the data from the registration form
  rajuResponseMessage: String;
  rajuBootstrapClass: String;
  rajuProcessing: boolean = false;
  previousUrl;

  constructor(
    private formBuilder: FormBuilder, private authService: AuthService, 
    private router: Router, private authGuard : AuthGuard
  ) {

    this.createLoginForm();
   }

   createLoginForm(){
     this.rajuFormGroup = this.formBuilder.group({

      username: ['', Validators.required],
      password: ['', Validators.required]
     });
   }

   disableLoginForm(){
    this.rajuFormGroup.controls['username'].disable();
    this.rajuFormGroup.controls['password'].disable();
    
  }

  enableLoginForm(){
    this.rajuFormGroup.controls['username'].enable();
    this.rajuFormGroup.controls['password'].enable();
  }

  onLoginSubmit(){
    this.rajuProcessing = true;
    this.disableLoginForm();
    const user = {
      username: this.rajuFormGroup.get('username').value,
      password: this.rajuFormGroup.get('password').value
    };

    this.authService.loginService(user).subscribe(data => {
      if(!data.success){

        this.rajuBootstrapClass = 'alert alert-danger';
        this.rajuResponseMessage = data.message;
        this.rajuProcessing = false;
        this.enableLoginForm();
      } else {

        this.rajuBootstrapClass = 'alert alert-success';
        this.rajuResponseMessage = data.message;
        this.authService.storeUserDataService(data.token, data.user);

        setTimeout(() => {
          if(this.previousUrl){
            this.router.navigate([this.previousUrl]);
          } else {
            this.router.navigate(['/dashboard']);
          }
        }, 2000);
      }
    });
  }


  ngOnInit() {
  //whcking if the redirectUrl exits, we know that the user is redirected from somewhere else
  // so that we can send to the destination url after login

    if(this.authGuard.redirectURL){
      this.rajuBootstrapClass = 'alert alert-danger';
      this.rajuResponseMessage = 'You must be logged in to view that page';
      this.previousUrl = this.authGuard.redirectURL;
      this.authGuard.redirectURL = undefined; 
      //to clear the state, to avoid continuously redirect users when they login in
    }
  }

}
