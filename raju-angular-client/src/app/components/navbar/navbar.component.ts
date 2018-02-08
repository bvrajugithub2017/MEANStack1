import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FlashMessagesService } from 'angular2-flash-messages';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor(
    public authService: AuthService,
    private router: Router,
     private flashMessagesService: FlashMessagesService
  ) { }

  onLogoutClick(){

    this.authService.logoutService();
    this.flashMessagesService.show('You are logged out successfully!', {cssClass: 'alert-info'});
    //By default flash message is visible for 2.5 seconds and then deleted.
    //{ cssClass: 'alert-info', timeout: 1000 }
    this.router.navigate(['/']);
  }

  ngOnInit() {
  }

}
