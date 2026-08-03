import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TopBarComponent } from './components/top-bar/top-bar.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet, TopBarComponent, HeaderComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App {
  private readonly router = inject(Router);

  protected readonly title = signal('premolex');
  protected readonly isAuthPage = signal(false);

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        const url = (event as NavigationEnd).urlAfterRedirects;
        this.isAuthPage.set(url.startsWith('/login'));
      });
  }
}