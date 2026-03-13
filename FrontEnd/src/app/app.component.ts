import { Component, OnInit, HostListener } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, query, animate } from '@angular/animations';
import { AuthService } from './services/auth.service';
import { MovieService } from './services/movie.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  animations: [
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
  isScrolled = false;

  // ✅ ADICIONE ESTAS VARIÁVEIS PARA O EXPLORAR FUNCIONAR
  isGenresOpen = false;
  genres: string[] = [];

  constructor(
    private authService: AuthService,
    private movieService: MovieService,
    public router: Router
  ) {}

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollOffset = window.scrollY || document.documentElement.scrollTop || 0;
    this.isScrolled = scrollOffset > 50;
  }

  ngOnInit() {
    this.checkLoginStatus();
    this.loadGenres(); // ✅ Carrega os gêneros do banco
    this.router.events.subscribe(() => {
      this.checkLoginStatus();
      this.isMenuOpen = false;
      this.isGenresOpen = false;
    });
  }

  // ✅ MÉTODO toggleGenres QUE ESTAVA FALTANDO
  toggleGenres(event: Event) {
    event.stopPropagation();
    this.isMenuOpen = false; // Fecha o menu do perfil se o de gêneros abrir
    this.isGenresOpen = !this.isGenresOpen;
  }

  // ✅ MÉTODO PARA FILTRAR PELO EXPLORAR
  filterByGenre(genre: string) {
    this.searchTerm = genre;
    this.onSearchChange();
    this.isGenresOpen = false;
  }

  // ✅ CARREGA GÊNEROS REAIS DO SEU BANCO
  loadGenres() {
    this.movieService.getMovies().subscribe(movies => {
      const genreSet = new Set<string>();
      movies.forEach(m => {
        m.generos?.forEach((g: any) => {
          const name = typeof g === 'object' ? g.nome : g;
          if (name) genreSet.add(name);
        });
      });
      this.genres = Array.from(genreSet).sort();
    });
  }

  checkLoginStatus() {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.username = localStorage.getItem('username') || 'Usuário';
  }

  toggleMenu(event: Event) {
    event.stopPropagation();
    this.isGenresOpen = false; // Fecha gêneros se o perfil abrir
    this.isMenuOpen = !this.isMenuOpen;
  }

  onSearchChange() {
    this.movieService.changeSearchTerm(this.searchTerm);
    if (this.router.url !== '/') {
      this.router.navigate(['/']).catch(err => console.error(err));
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

  resetSearch() {
    this.searchTerm = '';
    this.movieService.changeSearchTerm('');
    if (this.router.url !== '/') {
      this.router.navigate(['/']);
    }
  }

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    // Fecha ambos se clicar fora
    if (!event.target.closest('.dropdown-container') && !event.target.closest('.genres-container')) {
      this.isMenuOpen = false;
      this.isGenresOpen = false;
    }
  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData;
  }
}
