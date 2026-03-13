import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MovieService } from '../../services/movie.service';
import { Movie } from '../../models/movie.model';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent implements OnInit {
  username: string = '';
  userEmail: string = 'julio.lima@ufam.edu.br'; // Exemplo para o protótipo
  dateJoined: string = '2025-11-16';

  // Listas
  allWatchedMovies: Movie[] = [];
  recommendations: Movie[] = [];

  // Stats
  topGenre: string = 'Carregando...';
  totalWatched: number = 0;
  userLevel: string = 'Iniciante';

  constructor(private movieService: MovieService) {}

  ngOnInit(): void {
    this.username = localStorage.getItem('username') || 'Usuário';
    this.loadDashboardData();
  }

  loadDashboardData() {
    // No protótipo, usamos os favoritos como base para filmes interagidos (Likes/Favs)
    this.movieService.getMeusFavoritos().subscribe({
      next: (favs) => {
        this.allWatchedMovies = favs;
        this.totalWatched = this.allWatchedMovies.length;

        this.calculateTopGenre();
        this.updateUserLevel();
        this.loadRecommendations();
      },
      error: () => {
        this.topGenre = 'Nenhum';
      }
    });
  }

  calculateTopGenre() {
    if (this.allWatchedMovies.length === 0) {
      this.topGenre = 'Nenhum';
      return;
    }

    const counts: { [key: string]: number } = {};
    this.allWatchedMovies.forEach(m => {
      m.generos?.forEach((g: any) => {
        const name = typeof g === 'object' ? g.nome : g;
        counts[name] = (counts[name] || 0) + 1;
      });
    });

    // Pega o gênero que mais se repete
    this.topGenre = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
  }

  updateUserLevel() {
    if (this.totalWatched > 15) this.userLevel = 'Cineasta Lendário';
    else if (this.totalWatched > 5) this.userLevel = 'Maratonista';
    else this.userLevel = 'Iniciante';
  }

  loadRecommendations() {
    this.movieService.getMovies().subscribe(allMovies => {
      // Filtra filmes que possuem o gênero favorito do usuário
      this.recommendations = allMovies.filter(m =>
        m.generos?.some((g: any) => (typeof g === 'object' ? g.nome : g) === this.topGenre)
      ).slice(0, 4); // Exibe os 4 primeiros
    });
  }
}
