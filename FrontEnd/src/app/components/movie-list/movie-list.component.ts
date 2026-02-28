import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieService } from '../../services/movie.service';
import { Movie } from '../../models/movie.model';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';

interface MovieGroup {
  genero: string;
  movies: Movie[];
}

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './movie-list.component.html',
  styleUrl: './movie-list.component.scss'
})
export class MovieListComponent implements OnInit, OnDestroy {
  allMovies: Movie[] = [];
  movieGroups: MovieGroup[] = [];
  heroMovie: Movie | null = null;
  watchedMovies: Movie[] = [];
  searchTerm: string = '';
  private searchSub: Subscription = new Subscription();

  constructor(private movieService: MovieService, private router: Router) {}

  ngOnInit(): void {
    this.loadMovies();
    this.loadWatchedMovies();
    this.searchSub = this.movieService.currentSearchTerm.subscribe(term => {
      this.searchTerm = term;
      this.filterMovies();
    });
  }

  loadMovies(): void {
    this.movieService.getMovies().subscribe({
      next: (movies) => {
        this.allMovies = movies;
        if (movies.length > 0) {
          this.heroMovie = movies[0];
        }
        this.groupMoviesByGenre();
      },
      error: (err) => console.error(err)
    });
  }

  loadWatchedMovies(): void {
    this.movieService.getAssistirNovamente().subscribe({
      next: (data) => this.watchedMovies = data,
      error: (err) => console.error(err)
    });
  }

  filterMovies(): void {
    this.groupMoviesByGenre();
  }

  groupMoviesByGenre(): void {
    const filtered = this.allMovies.filter(m =>
      m.titulo.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    const groups: { [key: string]: Movie[] } = {};
    filtered.forEach(movie => {
      const genreName = movie.genero_detalhes?.nome || 'Outros';
      if (!groups[genreName]) groups[genreName] = [];
      groups[genreName].push(movie);
    });

    this.movieGroups = Object.keys(groups).map(key => ({
      genero: key,
      movies: groups[key]
    })).sort((a, b) => a.genero.localeCompare(b.genero));
  }

  loadMoreByGenre(generoNome: string): void {
    this.movieService.getMoviesByGenre(generoNome).subscribe({
      next: (newMovies) => {
        const group = this.movieGroups.find(g => g.genero === generoNome);
        if (group) {
          const currentIds = new Set(group.movies.map(m => m.id));
          const unique = newMovies.filter(m => !currentIds.has(m.id));
          group.movies.push(...unique);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.searchSub.unsubscribe();
  }

  trackByMovieId(index: number, movie: Movie): number {
    return movie.id;
  }
}
