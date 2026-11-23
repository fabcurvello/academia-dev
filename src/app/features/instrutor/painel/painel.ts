import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CursosFacade } from '../../../core/facades/cursos.facade';
import { RelogioService } from '../../../core/services/relogio.service';
import { duracaoTotalSegundos, todasAsAulas } from '../../../core/utils/tempo';
import { DuracaoPipe } from '../../../shared/pipes/duracao.pipe';
import { TituloAulaPipe } from '../../../shared/pipes/titulo-aula.pipe';

interface LinhaCurso {
  slug: string;
  titulo: string;
  categoria: string;
  aulas: number;
  liberadas: number;
  segundos: number;
  criadoNoApp: boolean;
}

@Component({
  selector: 'app-painel-instrutor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, MatButtonModule, MatIconModule, MatTableModule, MatSortModule, DuracaoPipe, TituloAulaPipe],
  templateUrl: './painel.html',
  styleUrl: './painel.scss',
})
export class PainelInstrutor {
  protected readonly cursos = inject(CursosFacade);
  private readonly relogio = inject(RelogioService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly colunas = ['titulo', 'categoria', 'aulas', 'liberadas', 'segundos', 'acoes'];
  private readonly ordenacao = signal<Sort>({ active: '', direction: '' });

  protected readonly linhas = computed<LinhaCurso[]>(() => {
    const linhas = this.cursos.cursos().map((c) => {
      const liberadas = this.cursos.aulasLiberadas(c);
      return {
        slug: c.slug,
        titulo: c.titulo,
        categoria: c.categoria,
        aulas: todasAsAulas(c).length,
        liberadas: liberadas.length,
        segundos: duracaoTotalSegundos(liberadas),
        criadoNoApp: !!c.criadoNoApp,
      };
    });
    const { active, direction } = this.ordenacao();
    if (!active || !direction) return linhas;
    const fator = direction === 'asc' ? 1 : -1;
    return [...linhas].sort((a, b) => {
      const va = a[active as keyof LinhaCurso];
      const vb = b[active as keyof LinhaCurso];
      return (typeof va === 'number' ? va - (vb as number) : String(va).localeCompare(String(vb))) * fator;
    });
  });

  protected readonly calendario = computed(() => {
    const agora = this.relogio.agora();
    return this.cursos
      .cursos()
      .flatMap((curso) =>
        todasAsAulas(curso)
          .filter((a) => a.estreia && new Date(a.estreia).getTime() > agora)
          .map((aula) => ({ curso, aula, data: new Date(aula.estreia!).getTime() })),
      )
      .sort((a, b) => a.data - b.data)
      .slice(0, 6);
  });

  protected ordenar(sort: Sort): void {
    this.ordenacao.set(sort);
  }

  protected remover(slug: string, titulo: string): void {
    if (!confirm(`Excluir o curso "${titulo}"? Esta ação não pode ser desfeita.`)) return;
    this.cursos.removerCursoCriado(slug);
    this.snackBar.open(`Curso "${titulo}" excluído.`, 'Fechar', { duration: 5000 });
  }
}
