import { Injectable } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import { Sessao, Usuario } from '../models/usuario';

interface ContaDemo extends Usuario {
  senha: string;
}

/** Contas de demonstração (login simulado, sem backend). */
export const CONTAS_DEMO: readonly ContaDemo[] = [
  { id: 1, nome: 'Ana Souza', email: 'aluno@academia.dev', senha: 'aluno123', perfil: 'aluno' },
  { id: 2, nome: 'Fabricio Curvello', email: 'instrutor@academia.dev', senha: 'instrutor123', perfil: 'instrutor' },
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  /** Simula um POST /login que devolve um JWT. */
  login(email: string, senha: string): Observable<Sessao> {
    const conta = CONTAS_DEMO.find((c) => c.email === email.trim().toLowerCase() && c.senha === senha);
    if (!conta) {
      return throwError(() => new Error('E-mail ou senha incorretos.')).pipe(delay(500));
    }
    const { senha: _, ...usuario } = conta;
    return of({ usuario, token: this.gerarTokenFake(usuario) }).pipe(delay(500));
  }

  private gerarTokenFake(usuario: Usuario): string {
    const base64 = (obj: object) => btoa(JSON.stringify(obj)).replace(/=+$/, '');
    const cabecalho = base64({ alg: 'HS256', typ: 'JWT' });
    const corpo = base64({ sub: usuario.id, perfil: usuario.perfil, exp: Date.now() + 8 * 3600_000 });
    return `${cabecalho}.${corpo}.assinatura-simulada`;
  }
}
