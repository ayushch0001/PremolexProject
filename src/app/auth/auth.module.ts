import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AUTH_ROUTES } from './auth.routes';

/**
 * AuthModule groups the authentication layer together:
 *  - LoginComponent (UI, standalone)
 *  - AuthService (state + API calls)
 *  - AuthGuard (route protection)
 *  - AuthInterceptor (JWT attachment)
 *
 * The services are provided at the root level via `providedIn: 'root'`,
 * and the interceptor is registered in `app.config.ts`.
 */
@NgModule({
  imports: [CommonModule, RouterModule.forChild(AUTH_ROUTES)],
})
export class AuthModule {}