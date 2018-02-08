import { AuthService } from './../services/auth.service';
import { Injectable }     from '@angular/core';
import { CanActivate, Router }    from '@angular/router';

@Injectable()
export class NotAuthGuard implements CanActivate {

    constructor(private authService: AuthService, private router: Router){}
    
    canActivate() {
    
        //just doing the opposite the the previous one
    if(!this.authService.loggedIn()) {
        return true;
      } else {
        this.router.navigate(['/']); //if authorized, redirecting to home page
        return false;
      }
  }
}