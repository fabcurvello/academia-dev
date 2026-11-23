import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Acesso seguro ao localStorage.
 * No servidor (SSR) não existe localStorage, então leituras devolvem o valor padrão
 * e gravações são ignoradas.
 */
@Injectable({ providedIn: 'root' })
export class ArmazenamentoService {
  private readonly noNavegador = isPlatformBrowser(inject(PLATFORM_ID));

  ler<T>(chave: string, padrao: T): T {
    if (!this.noNavegador) return padrao;
    try {
      const valor = localStorage.getItem(chave);
      return valor ? (JSON.parse(valor) as T) : padrao;
    } catch {
      return padrao;
    }
  }

  gravar<T>(chave: string, valor: T): void {
    if (!this.noNavegador) return;
    try {
      localStorage.setItem(chave, JSON.stringify(valor));
    } catch {
      // armazenamento cheio ou bloqueado: o app continua funcionando só em memória
    }
  }

  remover(chave: string): void {
    if (!this.noNavegador) return;
    try {
      localStorage.removeItem(chave);
    } catch {
      /* ignorado */
    }
  }
}
