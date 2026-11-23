import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthFacade } from '../../core/facades/auth.facade';
import { CursosFacade } from '../../core/facades/cursos.facade';
import { MatriculasFacade } from '../../core/facades/matriculas.facade';
import { CapaCurso } from '../../shared/components/capa-curso/capa-curso';

const RITMOS = { leve: 'Leve', moderado: 'Moderado', intenso: 'Intenso' } as const;

@Component({
  selector: 'app-minha-area',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, MatButtonModule, MatIconModule, CapaCurso],
  templateUrl: './minha-area.html',
  styleUrl: './minha-area.scss',
})
export class MinhaArea {
  protected readonly auth = inject(AuthFacade);
  private readonly cursos = inject(CursosFacade);
  private readonly matriculas = inject(MatriculasFacade);
  private readonly snackBar = inject(MatSnackBar);
  protected readonly ritmos = RITMOS;

  protected readonly itens = computed(() =>
    this.matriculas.lista().flatMap((matricula) => {
      const curso = this.cursos.porSlug(matricula.slug);
      if (!curso) return [];
      return [
        {
          matricula,
          curso,
          progresso: this.matriculas.progresso(curso),
          proxima: this.matriculas.proximaAula(curso),
          estreia: this.cursos.proximaEstreiaDo(curso),
        },
      ];
    }),
  );

  protected readonly resumo = computed(() => {
    const itens = this.itens();
    const concluidas = itens.reduce((t, i) => t + i.progresso.concluidas, 0);
    const finalizados = itens.filter((i) => i.progresso.total > 0 && i.progresso.percentual === 100).length;
    return { cursos: itens.length, concluidas, finalizados };
  });

  protected cancelar(slug: string, titulo: string): void {
    if (!confirm(`Cancelar a matrícula em ${titulo}? O progresso deste curso será apagado.`)) return;
    this.matriculas.cancelar(slug);
    this.snackBar.open(`Matrícula em ${titulo} cancelada.`, 'Fechar', { duration: 5000 });
  }

  protected dataEstreia(iso: string | undefined): number {
    return iso ? new Date(iso).getTime() : 0;
  }
}
