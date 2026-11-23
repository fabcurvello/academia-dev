import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Catalogo } from '../models/curso';

/** Camada de acesso a dados: só sabe buscar o catálogo. Regras ficam na facade. */
@Injectable({ providedIn: 'root' })
export class CursosService {
  private readonly http = inject(HttpClient);

  obterCatalogo(): Observable<Catalogo> {
    // Caminho relativo: funciona na raiz (localhost) e em subpasta (GitHub Pages, base href /academia-dev/)
    return this.http.get<Catalogo>('data/cursos.json');
  }
}
