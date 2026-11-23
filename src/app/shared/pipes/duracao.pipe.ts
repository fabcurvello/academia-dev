import { Pipe, PipeTransform } from '@angular/core';
import { duracaoEmSegundos } from '../../core/utils/tempo';

/**
 * Formata durações de forma legível.
 *   '9:01'      -> '9 min'
 *   '1:37:12'   -> '1h 37min'
 *   7380 (seg)  -> '2h 3min'
 */
@Pipe({ name: 'duracao' })
export class DuracaoPipe implements PipeTransform {
  transform(valor: string | number | null | undefined, vazio = '—'): string {
    const segundos = typeof valor === 'number' ? valor : duracaoEmSegundos(valor);
    if (!segundos) return vazio;
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.round((segundos % 3600) / 60);
    if (horas === 0) return `${Math.max(minutos, 1)} min`;
    return minutos ? `${horas}h ${minutos}min` : `${horas}h`;
  }
}
