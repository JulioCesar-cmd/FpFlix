import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MovieService } from '../../services/movie.service';
import { Movie } from '../../models/movie.model';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

// ✅ IMPORTANTE: Importe o MovieRowComponent
import { MovieRowComponent } from '../movie-row/movie-row.component';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  // ✅ ADICIONADO: MovieRowComponent nos imports
  imports: [CommonModule, RouterModule, MovieRowComponent],
  templateUrl: './movie-detail.component.html',
  styleUrls: ['./movie-detail.component.scss'],
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('700ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class MovieDetailComponent implements OnInit {
  movie?: Movie;
  relatedMovies: Movie[] = [];
  isFavorito: boolean = false;
  trailerUrl: SafeResourceUrl | null = null;
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.loadMovieDetails(id);
      }
    });
  }

  loadMovieDetails(id: number): void {
    this.isLoading = true;
    this.movie = undefined;
    this.relatedMovies = [];
    this.trailerUrl = null;

    this.movieService.getMovieById(id).subscribe({
      next: (data: Movie) => {
        this.movie = data;

        // Scroll imediato para o topo ao trocar de filme
        window.scrollTo({ top: 0, behavior: 'instant' });

        // Chamadas paralelas
        this.checkIfIsFavorito(data.id);
        this.loadRelatedMovies(data.id);

        if (data.tmdb_id) {
          this.loadTrailer(data.tmdb_id);
        }

        // Removemos o setTimeout de 800ms para carregar instantaneamente
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  loadTrailer(tmdbId: number): void {
    this.movieService.getMovieVideos(tmdbId).subscribe({
      next: (res) => {
        const trailer = res.results.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
        if (trailer) {
          const url = `https://www.youtube.com/embed/${trailer.key}?rel=0&modestbranding=1&autoplay=0`;
          this.trailerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        }
      }
    });
  }

  votar(tipo: 'LIKE' | 'DISLIKE'): void {
    if (this.movie) {
      this.movieService.avaliarFilme(this.movie.id, tipo).subscribe({
        next: () => {
          if (this.movie) {
            this.movie.foi_visto = true;
            this.movie.tipo_avaliacao = tipo;
          }
        }
      });
    }
  }

  loadRelatedMovies(id: number): void {
    this.movieService.getRecomendados(id).subscribe(movies => {
      this.relatedMovies = movies;
    });
  }

  checkIfIsFavorito(id: number): void {
    this.movieService.getMeusFavoritos().subscribe({
      next: (favs) => this.isFavorito = favs.some(m => m.id === id)
    });
  }

  favoritarFilme(): void {
    if (this.movie) {
      this.movieService.toggleFavorito(this.movie.id).subscribe(res => {
        this.isFavorito = res.is_favorito;
      });
    }
  }
}
