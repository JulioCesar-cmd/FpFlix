import { Routes } from '@angular/router';
import { MovieListComponent } from './components/movie-list/movie-list.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { MovieDetailComponent } from './components/movie-detail/movie-detail.component';
import {FavoritesComponent} from './components/favorites/favorites.component';

export const routes: Routes = [
  { path: '', component: MovieListComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'movie/:id', component: MovieDetailComponent },
  { path: 'favoritos', component: FavoritesComponent },
  { path: '**', redirectTo: '' }
];





