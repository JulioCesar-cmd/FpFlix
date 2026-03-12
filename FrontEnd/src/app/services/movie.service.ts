import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Movie } from '../models/movie.model';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private apiUrl = 'http://127.0.0.1:8000/api/filmes';
  private searchSource = new BehaviorSubject<string>('');
  currentSearchTerm = this.searchSource.asObservable();

  constructor(private http: HttpClient) { }

  changeSearchTerm(term: string) {
    this.searchSource.next(term);
  }

  getMovies(): Observable<Movie[]> {
    return this.http.get<Movie[]>(`${this.apiUrl}/`);
  }

  getMoviesGrouped(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/lista_por_genero/`);
  }

  getMovieById(id: number): Observable<Movie> {
    return this.http.get<Movie>(`${this.apiUrl}/${id}/`);
  }

  // ✅ NOVO MÉTODO: Chama a Action 'recomendados' do Django
  getRecomendados(id: number): Observable<Movie[]> {
    return this.http.get<Movie[]>(`${this.apiUrl}/${id}/recomendados/`);
  }

  toggleFavorito(movieId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${movieId}/favoritar/`, {});
  }

  getMeusFavoritos(): Observable<Movie[]> {
    return this.http.get<Movie[]>(`${this.apiUrl}/meus_favoritos/`);
  }

  avaliarFilme(movieId: number, tipo: 'LIKE' | 'DISLIKE'): Observable<any> {
    return this.http.post(`${this.apiUrl}/${movieId}/avaliar/`, { tipo });
  }

  getAssistirNovamente(): Observable<Movie[]> {
    return this.http.get<Movie[]>(`${this.apiUrl}/assistir_novamente/`);
  }
}
