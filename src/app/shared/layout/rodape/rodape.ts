import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CursosFacade } from '../../../core/facades/cursos.facade';

@Component({
  selector: 'app-rodape',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <footer>
      <div class="conteudo">
        <div>
          <strong class="marca">Academia Dev</strong>
          <p class="texto-suave">
            As aulas são as videoaulas gratuitas do professor Fabricio Curvello no YouTube. Este site organiza
            esse conteúdo em cursos, com matrícula e acompanhamento de progresso.
          </p>
        </div>
        <nav aria-label="Rodapé">
          <a routerLink="/cursos">Todos os cursos</a>
          <a [href]="cursos.canal()" target="_blank" rel="noopener">Canal no YouTube</a>
          <a href="https://github.com/fabcurvello" target="_blank" rel="noopener">GitHub do autor</a>
        </nav>
      </div>
      <p class="credito">Projeto de portfólio feito com Angular {{ versao }}, Angular Material e SSR.</p>
    </footer>
  `,
  styles: `
    footer {
      margin-top: 64px;
      border-top: 1px solid var(--pauta);
      background: var(--folha);
    }
    .conteudo {
      max-width: var(--largura-max);
      margin-inline: auto;
      padding: 40px var(--gutter) 16px;
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 32px;
    }
    .marca {
      font-family: var(--fonte-titulo);
      font-size: 1.15rem;
    }
    .texto-suave {
      margin-top: 8px;
      font-size: 0.95rem;
    }
    nav {
      display: grid;
      gap: 8px;
      align-content: start;
    }
    nav a {
      color: var(--tinta-suave);
      text-underline-offset: 3px;
    }
    nav a:hover {
      color: var(--tinta);
    }
    .credito {
      max-width: var(--largura-max);
      margin: 0 auto;
      padding: 16px var(--gutter) 32px;
      font-size: 0.85rem;
      color: var(--tinta-suave);
    }
    @media (max-width: 720px) {
      .conteudo {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class Rodape {
  protected readonly cursos = inject(CursosFacade);
  protected readonly versao = '22';
}
