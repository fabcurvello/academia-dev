import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Curso } from '../../../core/models/curso';
import { CursosFacade } from '../../../core/facades/cursos.facade';
import { MatriculasFacade } from '../../../core/facades/matriculas.facade';
import { duracaoTotalSegundos, todasAsAulas } from '../../../core/utils/tempo';
import { DuracaoPipe } from '../../pipes/duracao.pipe';
import { CapaCurso } from '../capa-curso/capa-curso';
import { SeloSituacao } from '../selo-situacao/selo-situacao';

@Component({
  selector: 'app-card-curso',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CapaCurso, SeloSituacao, DuracaoPipe],
  templateUrl: './card-curso.html',
  styleUrl: './card-curso.scss',
})
export class CardCurso {
  readonly curso = input.required<Curso>();

  private readonly cursos = inject(CursosFacade);
  private readonly matriculas = inject(MatriculasFacade);

  protected readonly situacao = computed(() => this.cursos.situacao(this.curso()));
  protected readonly totalAulas = computed(() => todasAsAulas(this.curso()).length);
  protected readonly liberadas = computed(() => this.cursos.aulasLiberadas(this.curso()));
  protected readonly duracao = computed(() => duracaoTotalSegundos(this.liberadas()));
  protected readonly matriculado = computed(() => this.matriculas.estaMatriculado(this.curso().slug));
  protected readonly progresso = computed(() => this.matriculas.progresso(this.curso()));
}
