import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Movie } from '../models/movie.model';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private apiUrl = 'http://127.0.0.1:8000/api/filmes';
  private tmdbKey = 'bb482b8769db20b6bad3c5187c230c2a';
  private searchSource = new BehaviorSubject<string>('');
  currentSearchTerm = this.searchSource.asObservable();

  constructor(private http: HttpClient) { }

  changeSearchTerm(term: string) {
    this.searchSource.next(term);
  }

  // ✅ Busca trailers diretamente no TMDB (On-Demand)
  getMovieVideos(tmdbId: number): Observable<any> {
    return this.http.get(`https://api.themoviedb.org/3/movie/${tmdbId}/videos?api_key=${this.tmdbKey}&language=pt-BR`);
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
