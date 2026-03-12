import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MovieService } from '../../services/movie.service';
import { Movie } from '../../models/movie.model';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations'; // ✅ Importado

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './movie-detail.component.html',
  styleUrls: ['./movie-detail.component.scss'],
  animations: [ // ✅ Definição da animação interna
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

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService
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
    // ✅ Resetamos para o skeleton aparecer e a animação disparar no retorno
    this.movie = undefined;
    this.relatedMovies = [];

    this.movieService.getMovieById(id).subscribe({
      next: (data: Movie) => {
        this.movie = data;
        // Scroll suave para o topo
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.checkIfIsFavorito(data.id);
        this.loadRelatedMovies(data.id);
      },
      error: (err: any) => console.error('Erro ao buscar detalhes:', err)
    });
  }

  loadRelatedMovies(id: number): void {
    this.movieService.getRecomendados(id).subscribe({
      next: (movies: Movie[]) => {
        this.relatedMovies = movies;
      }
    });
  }

  // ... (votar, favoritar e check continuam iguais)
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

  checkIfIsFavorito(id: number): void {
    this.movieService.getMeusFavoritos().subscribe({
      next: (favs: Movie[]) => {
        this.isFavorito = favs.some(m => m.id === id);
      },
      error: () => this.isFavorito = false
    });
  }

  favoritarFilme(): void {
    if (this.movie) {
      this.movieService.toggleFavorito(this.movie.id).subscribe({
        next: (res: any) => {
          this.isFavorito = res.is_favorito;
        }
      });
    }
  }
}
