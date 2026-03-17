import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieCardComponent } from '../movie-card/movie-card.component'; // 👈 Importe o card aqui!

@Component({
  selector: 'app-movie-row',
  standalone: true,
  imports: [CommonModule, MovieCardComponent], // 👈 Adicione o card nos imports
  templateUrl: './movie-row.component.html',
  styleUrls: ['./movie-row.component.scss']
})
export class MovieRowComponent {
  @Input() title: string = '';
  @Input() movies: any[] = [];
  @Input() icon: string = '';
  @Input() showLoadMore: boolean = false;

  @Output() onLoadMore = new EventEmitter<void>();

  triggerLoadMore() {
    this.onLoadMore.emit();
  }
}
