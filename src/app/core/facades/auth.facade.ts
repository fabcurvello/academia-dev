import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ArmazenamentoService } from '../services/armazenamento.service';
import { Sessao, Usuario } from '../models/usuario';

const CHAVE_SESSAO = 'academia-dev:sessao';

/**
 * Facade de autenticação: os componentes conversam só com ela.
 * Estado em signals; persistência no localStorage (apenas no navegador).
 */
@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private readonly authService = inject(AuthService);
  private readonly armazenamento = inject(ArmazenamentoService);
  private readonly router = inject(Router);

  private readonly _sessao = signal<Sessao | null>(null);
  private restaurada = false;

  readonly usuario = computed(() => this._sessao()?.usuario ?? null);
  readonly token = computed(() => this._sessao()?.token ?? null);
  readonly logado = computed(() => this._sessao() !== null);
  readonly ehInstrutor = computed(() => this.usuario()?.perfil === 'instrutor');
  readonly primeiroNome = computed(() => this.usuario()?.nome.split(' ')[0] ?? '');

  /**
   * Lê a sessão salva. É chamada depois da hidratação (para o HTML do servidor e do
   * navegador serem iguais) e também pelos guards, que rodam antes disso.
   */
  restaurar(): void {
    if (this.restaurada) return;
    this.restaurada = true;
    const salva = this.armazenamento.ler<Sessao | null>(CHAVE_SESSAO, null);
    if (salva) this._sessao.set(salva);
  }

  login(email: string, senha: string): Observable<Usuario> {
    return this.authService.login(email, senha).pipe(
      tap((sessao) => {
        this._sessao.set(sessao);
        this.armazenamento.gravar(CHAVE_SESSAO, sessao);
      }),
      map((sessao) => sessao.usuario),
    );
  }

  logout(redirecionar = true): void {
    this._sessao.set(null);
    this.armazenamento.remover(CHAVE_SESSAO);
    if (redirecionar) this.router.navigateByUrl('/');
  }
}
