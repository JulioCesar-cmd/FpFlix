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
        animate('1000ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('1000ms ease-out', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class MovieListComponent implements OnInit, OnDestroy {
  movieGroups: MovieGroup[] = [];
  heroMovie: Movie | null = null;
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

    this.startHeroCycle();
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, "");
  }

  loadGroupedMovies(): void {
    this.movieService.getMoviesGrouped().subscribe({
      next: (data: MovieGroup[]) => {
        if (!data || data.length === 0) return;

        // Extrai todos os filmes de forma segura
        const allMovies = data.reduce((acc, g) => acc.concat(g.filmes || []), [] as Movie[]);

        // Remove duplicatas por ID
        const uniqueMovies = Array.from(new Map(allMovies.map(m => [m.id, m])).values());

        if (uniqueMovies.length > 0) {
          // 1. ✅ NOVIDADES: Ordenado por data de lançamento (mais recente primeiro)
          const novidades = [...uniqueMovies].sort((a, b) => {
            const dateA = a.data_lancamento ? new Date(a.data_lancamento).getTime() : 0;
            const dateB = b.data_lancamento ? new Date(b.data_lancamento).getTime() : 0;
            return dateB - dateA; // Ordem decrescente
          }).slice(0, 15);

          // 2. ✅ BEM AVALIADOS: Ordenado por nota (maior primeiro)
          const bemAvaliados = [...uniqueMovies].sort((a, b) => (b.nota || 0) - (a.nota || 0)).slice(0, 15);

          // Atualiza a lista de grupos para exibição
          this.movieGroups = [
            { nome_genero: 'Novidades no Catálogo', filmes: novidades },
            { nome_genero: 'Mais Bem Avaliados', filmes: bemAvaliados },
            ...data
          ];
        } else {
          this.movieGroups = data;
        }

        this.setRandomHero();
        if (this.searchTerm) this.performSearch();
      },
      error: (err) => console.error('Erro ao carregar fileiras:', err)
    });
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
          if (!g) return false;
          const nome = (typeof g === 'object') ? g.nome : String(g);
          return this.normalizeText(nome).includes(term);
        });

        if (matchesTitle || matchesGenre) {
          if (!flatList.find(m => m.id === movie.id)) {
            flatList.push(movie);
          }
        }
      });
    });
    this.allMoviesResults = flatList;
  }

  setRandomHero(): void {
    if (this.movieGroups.length > 0) {
      const randomGroup = this.movieGroups[Math.floor(Math.random() * this.movieGroups.length)];
      if (randomGroup.filmes && randomGroup.filmes.length > 0) {
        const randomMovie = randomGroup.filmes[Math.floor(Math.random() * randomGroup.filmes.length)];
        if (this.heroMovie?.id === randomMovie.id) {
          this.setRandomHero();
          return;
        }
        this.heroMovie = null;
        setTimeout(() => { this.heroMovie = randomMovie; }, 50);
      }
    }
  }

  startHeroCycle(): void {
    this.autoCycleInterval = setInterval(() => { this.setRandomHero(); }, 8000);
  }

  loadWatchedMovies(): void {
    this.movieService.getAssistirNovamente().subscribe({
      next: (data) => this.watchedMovies = data,
      error: (err) => { if (err.status !== 401) console.error(err); }
    });
  }

  ngOnDestroy(): void {
    if (this.autoCycleInterval) clearInterval(this.autoCycleInterval);
    this.searchSub.unsubscribe();
  }

  trackByMovieId(index: number, movie: Movie): number { return movie.id; }
}
