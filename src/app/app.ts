import { ChangeDetectionStrategy, Component, afterNextRender, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Cabecalho } from './shared/layout/cabecalho/cabecalho';
import { Rodape } from './shared/layout/rodape/rodape';
import { AuthFacade } from './core/facades/auth.facade';
import { CursosFacade } from './core/facades/cursos.facade';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, Cabecalho, Rodape],
  template: `
    <app-cabecalho />
    <main id="conteudo" tabindex="-1">
      <router-outlet />
    </main>
    <app-rodape />
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    main {
      flex: 1;
      outline: none;
    }
  `,
})
export class App {
  constructor() {
    const auth = inject(AuthFacade);
    const cursos = inject(CursosFacade);
    cursos.carregar();
    // Dados do localStorage só depois da hidratação, para o HTML do servidor
    // e o primeiro render do navegador serem idênticos.
    afterNextRender(() => {
      auth.restaurar();
      cursos.restaurarCriados();
    });
  }
}
