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

  private searchSub: Subscription = new Subscription();
  private autoCycleInterval: any;

  constructor(private movieService: MovieService, private router: Router) {}

  ngOnInit(): void {
    this.loadGroupedMovies();
    this.loadWatchedMovies();
    this.searchSub = this.movieService.currentSearchTerm.subscribe(term => {
      this.searchTerm = term;
      this.performSearch();
    });
  }

  loadGroupedMovies(): void {
    this.movieService.getMoviesGrouped().subscribe({
      next: (data: MovieGroup[]) => {
        if (!data || data.length === 0) return;
        const allMovies = data.reduce((acc, g) => acc.concat(g.filmes || []), [] as Movie[]);
        const uniqueMovies = Array.from(new Map(allMovies.map(m => [m.id, m])).values());

        if (uniqueMovies.length > 0) {
          this.heroMovies = uniqueMovies.slice(0, 10);

          const novidades = [...uniqueMovies].sort((a, b) => {
            const d1 = a.data_lancamento ? new Date(a.data_lancamento).getTime() : 0;
            const d2 = b.data_lancamento ? new Date(b.data_lancamento).getTime() : 0;
            return d2 - d1;
          }).slice(0, 15);

          const bemAvaliados = [...uniqueMovies].sort((a, b) => (b.nota || 0) - (a.nota || 0)).slice(0, 15);

          this.movieGroups = [
            { nome_genero: 'Novidades no Catálogo', filmes: novidades },
            { nome_genero: 'Mais Bem Avaliados', filmes: bemAvaliados },
            ...data
          ];

          this.setHeroMovie(0);
          this.startHeroCycle();
        }
      }
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
    const flatList: Movie[] = [];
    this.movieGroups.forEach(group => {
      group.filmes.forEach(movie => {
        const matchesTitle = this.normalizeText(movie.titulo).includes(term);
        const matchesGenre = movie.generos?.some((g: any) => {
          const nomeG = (typeof g === 'object') ? g.nome : String(g);
          return this.normalizeText(nomeG).includes(term);
        });
        if ((matchesTitle || matchesGenre) && !flatList.find(m => m.id === movie.id)) {
          flatList.push(movie);
        }
      });
    });
    this.allMoviesResults = flatList;
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
