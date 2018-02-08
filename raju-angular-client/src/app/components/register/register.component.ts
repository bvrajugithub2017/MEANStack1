import { AuthService } from './../../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';

import { Router } from '@angular/router';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  rajuFormGroup: FormGroup;  //to get the data from the registration form
  rajuResponseMessage: String;
  rajuBootstrapClass: String;
  rajuProcessing: boolean = false;

  rajuEmailValid: boolean;
  rajuEmailMessage: String;
  rajuUsernameValid: boolean;
  rajuUsernameMessage: String;

  constructor(private formBuilder: FormBuilder, private authService: AuthService, private router: Router) {
    this.createForm(); 
   }

  createForm(){
    this.rajuFormGroup = this.formBuilder.group({

      //these keys names should match with that in the corresponding .html file - formControlName attribute's value
      username: ['', Validators.compose([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(20),
          this.validateUsernameFunction
      ])],
      email: ['', Validators.compose([
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(40),
          this.validateEmailFunction
    ])],
      password: ['', Validators.compose([
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(30),
          this.validatePasswordFunction
    ])],
      confirm: ['', Validators.required]
      
    }, {validator: this.matchingPasswordsFunction('password', 'confirm')} 
  ); //end of group() function call

  } //end of createForm()

  validateUsernameFunction(controls){

    const regExp = new RegExp(/^[0-9a-zA-Z]+$/);
    if( regExp.test(controls.value) ){
      return null; //indicating no error
    } else {
      return { 'validateUsername' : true};
    }  
  }

  validateEmailFunction(controls){

    const regExp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    if( regExp.test(controls.value) ){
      return null; //indicating no error
    } else {
      return { 'validateEmail' : true};
    }  
  }

  validatePasswordFunction(controls){

    const regExp = new RegExp(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\w\s]).{8,30}$/);
    if( regExp.test(controls.value) ){
      return null; //indicating no error
    } else {
      return { 'validatePassword' : true};
    }  
  }

  matchingPasswordsFunction(password, confirm){

    return (rajuGroup:  FormGroup) => {
      if(rajuGroup.controls[password].value == rajuGroup.controls[confirm].value){
          return null;
      } else{
          return {'matchingPasswords': true };
      }
    }
  }

  disableForm(){
    this.rajuFormGroup.controls['username'].disable();
    this.rajuFormGroup.controls['email'].disable();
    this.rajuFormGroup.controls['password'].disable();
    this.rajuFormGroup.controls['confirm'].disable();
  }

  enableForm(){
    this.rajuFormGroup.controls['username'].enable();
    this.rajuFormGroup.controls['email'].enable();
    this.rajuFormGroup.controls['password'].enable();
    this.rajuFormGroup.controls['confirm'].enable();
  }

  onRegisterSubmit(){

    this.rajuProcessing = true;
    this.disableForm();

    const user = {
      username: this.rajuFormGroup.get('username').value,
      email: this.rajuFormGroup.get('email').value,
      password: this.rajuFormGroup.get('password').value
    };

    this.authService.registerUser(user).subscribe(data => {

      //Note: We get this data.success msg (true/false) from authentication.js
      if(!data.success){
        this.rajuBootstrapClass = 'alert alert-danger';  //red msg
        this.rajuResponseMessage = data.message;

        this.rajuProcessing = false;
        this.enableForm();
      } else {
        this.rajuBootstrapClass = 'alert alert-success';  //green msg
        this.rajuResponseMessage = data.message;

        setTimeout( () => {
            this.router.navigate(['/login']); //we shall create it later
        }, 2000);
      }
    });
  }
  
  checkUsernameFunction(){
    this.authService.checkUsernameService(this.rajuFormGroup.get('username').value).subscribe(data => {
      if(!data.success){
          this.rajuUsernameValid = false;
          this.rajuUsernameMessage = data.message;
      } else {
          this.rajuUsernameValid = true;
          this.rajuUsernameMessage = data.message;
      }
    });
  }

  checkEmailFunction(){
    this.authService.checkEmailService(this.rajuFormGroup.get('email').value).subscribe(data => {
      if(!data.success){
          this.rajuEmailValid = false;
          this.rajuEmailMessage = data.message;
      } else {
          this.rajuEmailValid = true;
          this.rajuEmailMessage = data.message;
      }
    });
  }

  ngOnInit() {
  }

}
