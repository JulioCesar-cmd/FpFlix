import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MovieService } from '../../services/movie.service';
import { Movie } from '../../models/movie.model';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './movie-detail.component.html',
  styleUrls: ['./movie-detail.component.scss'],
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class MovieDetailComponent implements OnInit {
  movie?: Movie;
  relatedMovies: Movie[] = [];
  isFavorito: boolean = false;
  trailerUrl: SafeResourceUrl | null = null;

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) this.loadMovieDetails(id);
    });
  }

  loadMovieDetails(id: number): void {
    this.movie = undefined;
    this.relatedMovies = [];
    this.trailerUrl = null;
    this.movieService.getMovieById(id).subscribe({
      next: (data: Movie) => {
        this.movie = data;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.checkIfIsFavorito(data.id);
        this.loadRelatedMovies(data.id);
        this.loadTrailer(data.tmdb_id);
      },
      error: (err) => console.error(err)
    });
  }

  loadTrailer(tmdbId: number): void {
    this.movieService.getMovieVideos(tmdbId).subscribe(res => {
      const trailer = res.results.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
      if (trailer) {
        const url = `https://www.youtube.com/embed/${trailer.key}?rel=0&modestbranding=1`;
        this.trailerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      }
    });
  }

  votar(tipo: 'LIKE' | 'DISLIKE'): void {
    if (this.movie) {
      this.movieService.avaliarFilme(this.movie.id, tipo).subscribe({
        next: () => { if (this.movie) { this.movie.foi_visto = true; this.movie.tipo_avaliacao = tipo; } }
      });
    }
  }

  loadRelatedMovies(id: number): void {
    this.movieService.getRecomendados(id).subscribe(movies => this.relatedMovies = movies);
  }

  checkIfIsFavorito(id: number): void {
    this.movieService.getMeusFavoritos().subscribe({
      next: (favs) => this.isFavorito = favs.some(m => m.id === id)
    });
  }

  favoritarFilme(): void {
    if (this.movie) {
      this.movieService.toggleFavorito(this.movie.id).subscribe(res => this.isFavorito = res.is_favorito);
    }
  }
}
