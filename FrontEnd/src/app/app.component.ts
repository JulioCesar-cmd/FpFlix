import { Component, OnInit, HostListener } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from './services/auth.service';
import { MovieService } from './services/movie.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
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

  checkLoginStatus() {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.username = localStorage.getItem('username') || 'Usuário';
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!event.target.closest('.dropdown')) {
      this.isMenuOpen = false;
    }
  }

  onSearchChange(event?: any) {
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
