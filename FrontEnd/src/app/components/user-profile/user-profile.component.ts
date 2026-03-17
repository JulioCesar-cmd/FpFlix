import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieService } from '../../services/movie.service';
import { Movie } from '../../models/movie.model';
import { MovieRowComponent } from '../movie-row/movie-row.component';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-user-profile', // Ajustado para bater com a pasta
  standalone: true,
  imports: [CommonModule, MovieRowComponent],
  templateUrl: './user-profile.component.html', // ✅ CORRIGIDO: Agora aponta para o nome certo
  styleUrls: ['./user-profile.component.scss'], // ✅ CORRIGIDO: Agora aponta para o nome certo
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class UserProfileComponent implements OnInit { // ✅ CLASSE RENOMEADA
  userName: string = 'Julio Silva';
  userEmail: string = 'julio.ufam@exemplo.com';
  favoritos: Movie[] = [];
  assistidos: Movie[] = [];
  isLoading: boolean = true;

  constructor(private movieService: MovieService) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    this.isLoading = true;
    this.movieService.getMeusFavoritos().subscribe({
      next: (data) => {
        this.favoritos = data;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  logout(): void {
    console.log('Saindo...');
  }
}
