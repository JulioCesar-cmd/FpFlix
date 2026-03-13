import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieService } from '../../services/movie.service';
import { Movie } from '../../models/movie.model';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';

interface MovieGroup {
  nome_genero: string;
  filmes: Movie[];
}

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './movie-list.component.html',
  styleUrl: './movie-list.component.scss',
  animations: [
    trigger('heroFade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('800ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('400ms ease-out', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class MovieListComponent implements OnInit, OnDestroy {
  movieGroups: MovieGroup[] = [];
  heroMovie: Movie | null = null;
  heroMovies: Movie[] = [];
  currentHeroIndex: number = 0;
  watchedMovies: Movie[] = [];
  searchTerm: string = '';
  allMoviesResults: Movie[] = [];
  allMoviesForSearch: Movie[] = [];

  // ✅ Controle de paginação visual
  displayLimits: { [key: string]: number } = {};
  readonly INITIAL_LIMIT = 20;

  private searchSub: Subscription = new Subscription();
  private autoCycleInterval: any;

  constructor(private movieService: MovieService, private router: Router) {}

  ngOnInit(): void {
    // ✅ 1º: Começa a ouvir a busca IMEDIATAMENTE
    // Isso garante que o setTimeout de 100ms do app.component seja capturado
    this.searchSub = this.movieService.currentSearchTerm.subscribe(term => {
      this.searchTerm = term;

      // Se já tivermos filmes, filtra. Se não, o performSearch lidará com isso depois.
      if (this.allMoviesForSearch.length > 0) {
        this.performSearch();
      }
    });

    // ✅ 2º: Carrega os dados do banco
    this.loadGroupedMovies();
    this.loadWatchedMovies();

    // ✅ 3º: Garante que a página sempre comece no topo ao carregar
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  // ✅ Funções para o sistema "Ver Mais"
  getLimit(category: string): number {
    return this.displayLimits[category] || this.INITIAL_LIMIT;
  }

  loadMore(category: string): void {
    const current = this.displayLimits[category] || this.INITIAL_LIMIT;
    this.displayLimits[category] = current + 20;
  }

  loadGroupedMovies(): void {
    this.movieService.getMoviesGrouped().subscribe({
      next: (data: MovieGroup[]) => {
        if (!data || data.length === 0) return;

        // 1. Extrai todos os filmes únicos para a busca
        const allMovies = data.reduce((acc, g) => acc.concat(g.filmes || []), [] as Movie[]);
        const uniqueMovies = Array.from(new Map(allMovies.map(m => [m.id, m])).values());

        // 2. Salva no array global
        this.allMoviesForSearch = [...uniqueMovies];

        // ✅ 3. CORREÇÃO DE SINCRONIA: Se o usuário veio de outra página via "Explorar",
        // o searchTerm já terá valor. Então filtramos aqui assim que os filmes chegam.
        if (this.searchTerm) {
          this.performSearch();
        }

        // 4. Lógica das fileiras e Hero (Restante do seu código)
        if (uniqueMovies.length > 0) {
          const topRated = [...uniqueMovies]
            .sort((a, b) => (b.nota || 0) - (a.nota || 0))
            .slice(0, 40);
          this.heroMovies = topRated.sort(() => 0.5 - Math.random()).slice(0, 10);

          const novidades = [...uniqueMovies].sort((a, b) => {
            const d1 = a.data_lancamento ? new Date(a.data_lancamento).getTime() : 0;
            const d2 = b.data_lancamento ? new Date(b.data_lancamento).getTime() : 0;
            return d2 - d1;
          }).slice(0, 30);

          const bemAvaliados = [...uniqueMovies].sort((a, b) => (b.nota || 0) - (a.nota || 0)).slice(0, 30);

          this.movieGroups = [
            { nome_genero: 'Novidades no Catálogo', filmes: novidades },
            { nome_genero: 'Mais Bem Avaliados', filmes: bemAvaliados },
            ...data
          ];

          this.setHeroMovie(0);
          this.startHeroCycle();
        }
      },
      error: (err) => console.error('Erro ao carregar filmes:', err)
    });
  }

  loadWatchedMovies(): void {
    this.movieService.getAssistirNovamente().subscribe({
      next: (data) => this.watchedMovies = data,
      error: (err) => { if (err.status !== 401) console.error(err); }
    });
  }

  setHeroMovie(index: number): void {
    this.currentHeroIndex = index;
    this.heroMovie = this.heroMovies[this.currentHeroIndex];
  }

  startHeroCycle(): void {
    this.stopHeroCycle();
    this.autoCycleInterval = setInterval(() => {
      const nextIndex = (this.currentHeroIndex + 1) % this.heroMovies.length;
      this.setHeroMovie(nextIndex);
    }, 8000);
  }

  stopHeroCycle(): void {
    if (this.autoCycleInterval) clearInterval(this.autoCycleInterval);
  }

  goToHero(index: number): void {
    this.stopHeroCycle();
    this.setHeroMovie(index);
    this.startHeroCycle();
  }

  performSearch(): void {
    if (!this.searchTerm.trim()) {
      this.allMoviesResults = [];
      return;
    }
    const term = this.normalizeText(this.searchTerm.trim());
    const results = this.allMoviesForSearch.filter(movie => {
      const titleMatch = this.normalizeText(movie.titulo).includes(term);
      const genreMatch = movie.generos?.some((g: any) => {
        const nomeG = (typeof g === 'object') ? g.nome : String(g);
        return this.normalizeText(nomeG).includes(term);
      });
      return titleMatch || genreMatch;
    });

    this.allMoviesResults = results.sort((a, b) =>
      a.titulo.localeCompare(b.titulo, 'pt-BR', { sensitivity: 'base' })
    );
    // Reseta o limite da busca ao pesquisar algo novo
    this.displayLimits['search'] = this.INITIAL_LIMIT;
  }

  private normalizeText(text: string): string {
    return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
  }

  ngOnDestroy(): void {
    this.stopHeroCycle();
    this.searchSub.unsubscribe();
  }

  trackByMovieId(index: number, movie: Movie): number { return movie.id; }
}
