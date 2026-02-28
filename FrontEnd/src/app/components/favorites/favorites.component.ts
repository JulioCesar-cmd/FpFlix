import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MovieService } from '../../services/movie.service';
import { Movie } from '../../models/movie.model';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss']
})
export class FavoritesComponent implements OnInit {
  favorites: Movie[] = [];

  constructor(private movieService: MovieService) {}

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.movieService.getMeusFavoritos().subscribe({
      next: (movies: Movie[]) => {
        this.favorites = movies;
      },
      error: (err: any) => console.error('Erro ao carregar favoritos:', err)
    });
  }

  removerFavorito(event: Event, movieId: number): void {
    event.stopPropagation();
    this.movieService.toggleFavorito(movieId).subscribe({
      next: () => {
        this.favorites = this.favorites.filter(m => m.id !== movieId);
      },
      error: (err: any) => console.error('Erro ao remover favorito:', err)
    });
  }
}
