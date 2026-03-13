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
    this.loadGenres();
    this.router.events.subscribe(() => {
      this.checkLoginStatus();
      // Não fechamos os menus aqui para não conflitar com a navegação manual
    });
  }

  toggleGenres(event: Event) {
    event.stopPropagation();
    this.isMenuOpen = false;
    this.isGenresOpen = !this.isGenresOpen;
  }

  // ✅ MÉTODO CORRIGIDO: Garante sincronia entre busca, navegação e scroll
  filterByGenre(genre: string) {
    this.isGenresOpen = false;
    this.isMenuOpen = false;
    this.searchTerm = genre;

    // 1. Atualiza o serviço
    this.movieService.changeSearchTerm(this.searchTerm);

    if (this.router.url === '/') {
      // ✅ O SEGREDO: setTimeout força o scroll a rodar após a renderização
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 0);
    } else {
      this.router.navigate(['/']).then(() => {
        // Quando vem de fora, o instant é melhor para não parecer travado
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'instant' });
        }, 0);
      });
    }
  }

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
    this.isGenresOpen = false;
    this.isMenuOpen = !this.isMenuOpen;
  }

  onSearchChange() {
    // 1. Envia o termo para o serviço para filtrar os filmes
    this.movieService.changeSearchTerm(this.searchTerm);

    if (this.router.url === '/') {
      // ✅ Se o usuário digitou algo (não está vazio), sobe para o topo
      if (this.searchTerm.trim().length > 0) {
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 0);
      }
    } else {
      // Se não estiver na home, navega para lá
      this.router.navigate(['/']).then(() => {
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'instant' });
        }, 0);
      });
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
    this.isMenuOpen = false;
    this.isGenresOpen = false;

    if (this.router.url === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      this.router.navigate(['/']).then(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
      });
    }
  }

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!event.target.closest('.dropdown-container') && !event.target.closest('.genres-container')) {
      this.isMenuOpen = false;
      this.isGenresOpen = false;
    }
  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData;
  }
}
