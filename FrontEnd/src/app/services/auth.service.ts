import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Mantendo a base da sua API
  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) { }

  // Fazer Login - Atualizado para bater na rota /api/login/ do seu Django
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login/`, credentials).pipe(
      tap((res: any) => {
        // O SimpleJWT retorna 'access' e 'refresh'
        if (res.access) {
          localStorage.setItem('access_token', res.access);
          localStorage.setItem('refresh_token', res.refresh);
          console.log('Login realizado e token salvo!');
        }
      })
    );
  }

  // Fazer Cadastro - Batendo na rota /api/register/
  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register/`, userData);
  }

  // Verificar se está logado (checa se o token existe)
  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }

  // Retornar o token para usar nos Headers das outras requisições
  getToken() {
    return localStorage.getItem('access_token');
  }

  // Sair - Limpa tudo e desloga o usuário
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    // Ou use localStorage.clear() se quiser limpar tudo mesmo
  }
}
