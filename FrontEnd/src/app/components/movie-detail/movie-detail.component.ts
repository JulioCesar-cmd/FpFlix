import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MovieService } from '../../services/movie.service';
import { Movie } from '../../models/movie.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './movie-detail.component.html',
  styleUrls: ['./movie-detail.component.scss']
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
    this.movieService.getMovieById(id).subscribe({
      next: (data: Movie) => {
        this.movie = data;
        window.scrollTo(0, 0);
        this.checkIfIsFavorito(data.id);
        const generoParaBusca = data.genero || data.genero_detalhes?.nome;
        if (generoParaBusca) {
          this.loadRelatedMovies(generoParaBusca, id);
        }
      },
      error: (err: any) => console.error('Erro ao buscar detalhes:', err)
    });
  }

  votar(tipo: 'LIKE' | 'DISLIKE'): void {
    if (this.movie) {
      this.movieService.avaliarFilme(this.movie.id, tipo).subscribe({
        next: (res) => {
          if (this.movie) {
            this.movie.foi_visto = true;
            this.movie.tipo_avaliacao = tipo;
          }
        },
        error: (err) => {
          if (err.status === 401) alert('Faça login para avaliar.');
        }
      });
    }
  }

  checkIfIsFavorito(id: number): void {
    this.movieService.getMeusFavoritos().subscribe({
      next: (favs: Movie[]) => {
        this.isFavorito = favs.some(m => m.id === id);
      },
      error: (err: any) => {
        this.isFavorito = false;
      }
    });
  }

  loadRelatedMovies(genero: string, currentId: number): void {
    this.movieService.getMoviesByGenre(genero).subscribe({
      next: (movies: Movie[]) => {
        this.relatedMovies = movies.filter((m: Movie) => m.id !== currentId);
      }
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
