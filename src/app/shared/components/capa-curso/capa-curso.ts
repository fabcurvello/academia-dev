import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Categoria } from '../../../core/models/curso';

const GLIFOS: Record<Categoria, string> = {
  Python: 'py',
  Java: 'java',
  'Banco de Dados': 'sql',
};

const CLASSES: Record<Categoria, string> = {
  Python: 'python',
  Java: 'java',
  'Banco de Dados': 'bd',
};

/** Capa gerada em CSS: cor da linguagem, pauta de caderno e a "extensão" da linguagem em destaque. */
@Component({
  selector: 'app-capa-curso',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="glifo" aria-hidden="true">{{ glifo() }}</span>`,
  host: {
    '[class]': 'classe()',
    '[class.compacta]': 'compacta()',
    role: 'presentation',
  },
  styles: `
    :host {
      --cor: var(--cor-python);
      position: relative;
      display: block;
      aspect-ratio: 16 / 9;
      overflow: hidden;
      border-radius: var(--raio-m);
      color: #fff;
      background-color: var(--cor);
      background-image:
        linear-gradient(90deg, transparent 22px, rgb(255 255 255 / 0.28) 22px 24px, transparent 24px),
        repeating-linear-gradient(transparent 0 23px, rgb(255 255 255 / 0.14) 23px 24px);
    }
    :host(.java) { --cor: var(--cor-java); }
    :host(.bd) { --cor: var(--cor-bd); }
    .glifo {
      position: absolute;
      left: 40px;
      bottom: -0.12em;
      font-family: var(--fonte-titulo);
      font-weight: 800;
      font-size: clamp(3.5rem, 9vw, 5.5rem);
      letter-spacing: -0.05em;
      line-height: 1;
    }
    .glifo::before {
      content: '.';
      color: var(--marca-texto);
    }
    :host(.compacta) .glifo { font-size: 2.4rem; left: 30px; }
  `,
})
export class CapaCurso {
  readonly categoria = input.required<Categoria>();
  readonly compacta = input(false);
  protected readonly glifo = computed(() => GLIFOS[this.categoria()]);
  protected readonly classe = computed(() => CLASSES[this.categoria()]);
}
