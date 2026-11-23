import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RelogioService } from '../../../core/services/relogio.service';

/** Contagem regressiva até uma data (timestamp). Atualiza a cada segundo via RelogioService. */
@Component({
  selector: 'app-contagem-regressiva',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="contagem" role="timer" [attr.aria-label]="rotulo()">
      @for (parte of partes(); track parte.unidade) {
        <div class="parte">
          <span class="numero">{{ parte.valor }}</span>
          <span class="unidade">{{ parte.unidade }}</span>
        </div>
      }
    </div>
  `,
  styles: `
    .contagem {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
    }
    .parte {
      background: var(--folha);
      border: 1px solid var(--pauta);
      border-radius: var(--raio-m);
      padding: 10px 4px 8px;
      text-align: center;
    }
    .numero {
      display: block;
      font-family: var(--fonte-titulo);
      font-weight: 800;
      font-size: clamp(1.6rem, 3.4vw, 2.3rem);
      line-height: 1;
      font-variant-numeric: tabular-nums;
    }
    .unidade {
      font-size: 0.8rem;
      color: var(--tinta-suave);
    }
  `,
})
export class ContagemRegressiva {
  readonly alvo = input.required<number>();
  private readonly relogio = inject(RelogioService);

  private readonly restante = computed(() => Math.max(0, this.alvo() - this.relogio.agora()));

  protected readonly partes = computed(() => {
    const total = Math.floor(this.restante() / 1000);
    const dias = Math.floor(total / 86400);
    const horas = Math.floor((total % 86400) / 3600);
    const minutos = Math.floor((total % 3600) / 60);
    const segundos = total % 60;
    const doisDigitos = (n: number) => String(n).padStart(2, '0');
    return [
      { valor: String(dias), unidade: dias === 1 ? 'dia' : 'dias' },
      { valor: doisDigitos(horas), unidade: 'horas' },
      { valor: doisDigitos(minutos), unidade: 'min' },
      { valor: doisDigitos(segundos), unidade: 'seg' },
    ];
  });

  protected readonly rotulo = computed(() => {
    const [d, h, m] = this.partes();
    return `Faltam ${d.valor} ${d.unidade}, ${h.valor} horas e ${m.valor} minutos`;
  });
}
