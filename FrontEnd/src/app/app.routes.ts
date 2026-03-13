import { Routes } from '@angular/router';
import { inject } from '@angular/core'; // Necessário para o Guard funcional
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service'; // Importe seu serviço de auth

// Importação dos Componentes
import { MovieListComponent } from './components/movie-list/movie-list.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { MovieDetailComponent } from './components/movie-detail/movie-detail.component';
import { FavoritesComponent } from './components/favorites/favorites.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';

/**
 * ✅ GUARD FUNCIONAL
 * Verifica se o usuário está logado antes de liberar a rota.
 */
const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};

export const routes: Routes = [
  {
    path: '',
    component: MovieListComponent
  },
  {
    path: 'perfil',
    component: UserProfileComponent,
    canActivate: [authGuard] // ✅ Agora usando a função definida acima
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'movie/:id',
    component: MovieDetailComponent
  },
  {
    path: 'favoritos',
    component: FavoritesComponent,
    canActivate: [authGuard] // Aproveitei para proteger seus favoritos também!
  },
  {
    path: '**',
    redirectTo: ''
  }
];
