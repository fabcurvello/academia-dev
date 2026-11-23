import { Directive, ElementRef, HostListener, inject, input } from '@angular/core';

/**
 * Diretiva de atributo: se a imagem falhar ao carregar (ex.: thumbnail de uma estreia
 * que o YouTube ainda não gerou), troca pela imagem reserva ou esconde o elemento.
 *
 * Uso: <img [src]="url" appImagemReserva="/img/reserva.svg" />
 */
@Directive({ selector: 'img[appImagemReserva]' })
export class ImagemReservaDirective {
  readonly appImagemReserva = input<string>('');
  private readonly img = inject<ElementRef<HTMLImageElement>>(ElementRef).nativeElement;
  private trocou = false;

  @HostListener('error')
  aoFalhar(): void {
    const reserva = this.appImagemReserva();
    if (reserva && !this.trocou) {
      this.trocou = true;
      this.img.src = reserva;
    } else {
      this.img.style.visibility = 'hidden';
    }
  }
}
