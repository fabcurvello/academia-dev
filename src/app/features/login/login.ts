import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthFacade } from '../../core/facades/auth.facade';
import { CONTAS_DEMO } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  /** ?retorno=/url para voltar depois do login */
  readonly retorno = input<string>();

  private readonly auth = inject(AuthFacade);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder).nonNullable;

  protected readonly contas = CONTAS_DEMO;
  protected readonly entrando = signal(false);
  protected readonly erro = signal<string | null>(null);
  protected readonly senhaVisivel = signal(false);

  protected readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected usarConta(email: string, senha: string): void {
    this.form.setValue({ email, senha });
    this.entrar();
  }

  protected entrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.entrando.set(true);
    this.erro.set(null);
    const { email, senha } = this.form.getRawValue();
    this.auth.login(email, senha).subscribe({
      next: (usuario) => {
        const destino = this.retorno() ?? (usuario.perfil === 'instrutor' ? '/instrutor' : '/minha-area');
        this.router.navigateByUrl(destino);
      },
      error: (e: Error) => {
        this.erro.set(e.message);
        this.entrando.set(false);
      },
    });
  }
}
