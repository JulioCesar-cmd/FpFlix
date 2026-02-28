import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router'; // Adicionado RouterModule

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], // Adicionado aqui para o link de login funcionar
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  userData = { username: '', email: '', password: '' };
  erroMsg = '';

  constructor(private authService: AuthService, private router: Router) {}

  onRegister() {
    this.erroMsg = ''; // Limpa mensagens anteriores ao tentar novo cadastro

    this.authService.register(this.userData).subscribe({
      next: () => {
        alert('Cadastro realizado com sucesso! Bem-vindo à FPF Flix.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Erro retornado pelo Django:', err);

        if (err.error) {
          // Captura erros específicos de validação do Serializer do Django
          const e = err.error;
          if (e.username) {
            this.erroMsg = e.username[0];
          } else if (e.email) {
            this.erroMsg = e.email[0];
          } else if (e.password) {
            this.erroMsg = `Senha: ${e.password[0]}`;
          } else if (e.non_field_errors) {
            this.erroMsg = e.non_field_errors[0];
          } else {
            this.erroMsg = 'Erro nos dados. Verifique e tente novamente.';
          }
        } else {
          this.erroMsg = 'Conexão perdida. Verifique se o servidor está ligado.';
        }
      }
    });
  }
}
