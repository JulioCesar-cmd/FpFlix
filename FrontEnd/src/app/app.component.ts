import { Component, OnInit, HostListener } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, query, animate } from '@angular/animations'; // ✅ Adicionado
import { AuthService } from './services/auth.service';
import { MovieService } from './services/movie.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  animations: [ // ✅ Definição do Fade Suave
    trigger('routeAnimations', [
      transition('* <=> *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(5px)' })
        ], { optional: true }),
        query(':enter', [
          animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
        ], { optional: true })
      ])
    ])
  ]
})
export class AppComponent implements OnInit {
  isLoggedIn = false;
  username = '';
  searchTerm = '';
  isMenuOpen = false;

  constructor(
    private authService: AuthService,
    private movieService: MovieService,
    private router: Router
  ) {}

  ngOnInit() {
    this.checkLoginStatus();
    this.router.events.subscribe(() => {
      this.checkLoginStatus();
      this.isMenuOpen = false;
    });
  }

  // ✅ Prepara a rota para a animação disparar
  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData;
  }

  checkLoginStatus() {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.username = localStorage.getItem('username') || 'Usuário';
  }

  toggleMenu(event: Event) {
    event.stopPropagation();
    this.isMenuOpen = !this.isMenuOpen;
  }

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!event.target.closest('.dropdown-container')) {
      this.isMenuOpen = false;
    }
  }

  onSearchChange() {
    this.movieService.changeSearchTerm(this.searchTerm);
    if (this.router.url !== '/') {
      this.router.navigate(['/']);
    }
  }

  logout() {
    this.authService.logout();
    this.isLoggedIn = false;
    this.searchTerm = '';
    this.isMenuOpen = false;
    this.movieService.changeSearchTerm('');
    this.router.navigate(['/login']);
  }
}
