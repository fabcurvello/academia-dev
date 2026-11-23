import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SituacaoCurso } from '../../../core/facades/cursos.facade';

const TEXTOS: Record<SituacaoCurso, string> = {
  disponivel: 'Disponível',
  estreias: 'Novas aulas toda semana',
  'em-breve': 'Em breve',
  'em-producao': 'Em produção',
};

@Component({
  selector: 'app-selo-situacao',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `{{ texto() }}`,
  host: { '[class]': 'situacao()' },
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 3px 10px;
      border-radius: 99px;
      font-size: 0.8rem;
      font-weight: 700;
      line-height: 1.4;
      white-space: nowrap;
      background: #e3f2ea;
      color: var(--sucesso);
    }
    :host::before {
      content: '';
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: currentColor;
    }
    :host(.em-breve),
    :host(.estreias) {
      background: var(--marca-texto);
      color: var(--tinta);
    }
    :host(.em-producao) {
      background: #fbeadb;
      color: var(--alerta);
    }
  `,
})
export class SeloSituacao {
  readonly situacao = input.required<SituacaoCurso>();
  protected readonly texto = computed(() => TEXTOS[this.situacao()]);
}
