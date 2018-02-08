import { AuthService } from './../../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-public-profile',
  templateUrl: './public-profile.component.html',
  styleUrls: ['./public-profile.component.css']
})
export class PublicProfileComponent implements OnInit {

  currentUrl;
  user;
  foundProfile = false;
  rajuBootstrapClass;
  rajuResponseMessage;

  constructor(private authService: AuthService, private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.currentUrl = this.activatedRoute.snapshot.params;
    this.authService.getPublicProfileService(this.currentUrl.username).subscribe(data => {

      if(!data.success){
        this.rajuBootstrapClass = 'alert alert-danger';
        this.rajuResponseMessage = data.message;
      } else {
        this.user = data.user;
      }
      
    });
  }

}
