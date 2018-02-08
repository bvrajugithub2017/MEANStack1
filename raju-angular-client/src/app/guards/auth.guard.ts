import { AuthService } from './../services/auth.service';
import { Injectable }     from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable()
export class AuthGuard implements CanActivate {

    redirectURL;

    constructor(private authService: AuthService, private router: Router){}
    
    canActivate(routeSnapshot: ActivatedRouteSnapshot, stateSnapshot: RouterStateSnapshot) {
    
    if(this.authService.loggedIn()) {
        return true;
      } else {
        this.redirectURL = stateSnapshot.url;  //saving the user requested route
        this.router.navigate(['/login']); //if unauthorized, redirecting to login page
        return false;
      }
  }
}