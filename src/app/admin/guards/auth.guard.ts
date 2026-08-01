import { CanActivateFn } from '@angular/router';

/**
 * Placeholder AuthGuard for the /admin routes.
 *
 * TODO: Wire this up to a real authentication service (e.g. Firebase Auth).
 * Currently it always allows access so the admin shell can be developed.
 */
export const authGuard: CanActivateFn = () => {
  // TODO: Replace with real auth check, e.g.:
  //   return this.authService.isAuthenticated()
  //     ? true
  //     : this.router.createUrlTree(['/login']);
  return true;
};