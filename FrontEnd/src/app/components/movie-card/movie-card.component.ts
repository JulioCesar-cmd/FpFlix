import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para pipes e diretivas básicas
import { RouterModule } from '@angular/router'; // 👈 ESSENCIAL para o routerLink funcionar

@Component({
  selector: 'app-movie-card',
  standalone: true, // Garante que ele é independente
  imports: [CommonModule, RouterModule], // 👈 Adicione o RouterModule aqui
  templateUrl: './movie-card.component.html',
  styleUrls: ['./movie-card.component.scss']
})
export class MovieCardComponent {
  @Input() movie: any;
}
