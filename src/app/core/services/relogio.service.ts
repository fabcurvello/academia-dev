import { DestroyRef, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Relógio global baseado em signal.
 * Tudo que depende da data atual (aulas liberadas, contagem regressiva)
 * é um `computed()` em cima de `agora`, então a interface se atualiza sozinha.
 */
@Injectable({ providedIn: 'root' })
export class RelogioService {
  private readonly _agora = signal(Date.now());
  readonly agora = this._agora.asReadonly();

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;
    const id = setInterval(() => this._agora.set(Date.now()), 1000);
    inject(DestroyRef).onDestroy(() => clearInterval(id));
  }
}
