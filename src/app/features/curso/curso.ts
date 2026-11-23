import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { CursosFacade } from '../../core/facades/cursos.facade';
import { MatriculasFacade } from '../../core/facades/matriculas.facade';
import { AuthFacade } from '../../core/facades/auth.facade';
import { Modulo } from '../../core/models/curso';
import { duracaoTotalSegundos, todasAsAulas } from '../../core/utils/tempo';
import { CapaCurso } from '../../shared/components/capa-curso/capa-curso';
import { SeloSituacao } from '../../shared/components/selo-situacao/selo-situacao';
import { ContagemRegressiva } from '../../shared/components/contagem-regressiva/contagem-regressiva';
import { DuracaoPipe } from '../../shared/pipes/duracao.pipe';
import { TituloAulaPipe } from '../../shared/pipes/titulo-aula.pipe';

@Component({
  selector: 'app-curso',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    DatePipe,
    MatButtonModule,
    MatExpansionModule,
    MatIconModule,
    CapaCurso,
    SeloSituacao,
    ContagemRegressiva,
    DuracaoPipe,
    TituloAulaPipe,
  ],
  templateUrl: './curso.html',
  styleUrl: './curso.scss',
})
export class CursoDetalhe {
  /** Parâmetro de rota :slug */
  readonly slug = input.required<string>();

  protected readonly cursos = inject(CursosFacade);
  protected readonly matriculas = inject(MatriculasFacade);
  protected readonly auth = inject(AuthFacade);
  private readonly titulo = inject(Title);
  private readonly meta = inject(Meta);

  protected readonly curso = computed(() => this.cursos.porSlug(this.slug()));
  protected readonly situacao = computed(() => {
    const c = this.curso();
    return c ? this.cursos.situacao(c) : 'disponivel';
  });
  protected readonly totalAulas = computed(() => {
    const c = this.curso();
    return c ? todasAsAulas(c).length : 0;
  });
  protected readonly liberadas = computed(() => {
    const c = this.curso();
    return c ? this.cursos.aulasLiberadas(c) : [];
  });
  protected readonly duracao = computed(() => duracaoTotalSegundos(this.liberadas()));
  protected readonly proximaEstreia = computed(() => {
    const c = this.curso();
    return c ? this.cursos.proximaEstreiaDo(c) : null;
  });
  protected readonly matriculado = computed(() => this.matriculas.estaMatriculado(this.slug()));
  protected readonly progresso = computed(() => {
    const c = this.curso();
    return c ? this.matriculas.progresso(c) : null;
  });
  protected readonly proximaAula = computed(() => {
    const c = this.curso();
    return c ? this.matriculas.proximaAula(c) : null;
  });

  constructor() {
    // Título e descrição da aba/SEO. Rodam também no servidor (SSR).
    effect(() => {
      const c = this.curso();
      if (!c) return;
      this.titulo.setTitle(`${c.titulo} · Academia Dev`);
      this.meta.updateTag({ name: 'description', content: c.descricao });
      this.meta.updateTag({ property: 'og:title', content: c.titulo });
    });
  }

  protected aulasLiberadasNoModulo(modulo: Modulo): number {
    return modulo.aulas.filter((a) => this.cursos.aulaLiberada(a)).length;
  }

  protected duracaoModulo(modulo: Modulo): number {
    return duracaoTotalSegundos(modulo.aulas);
  }

  protected estreiaEm(data: string | undefined): number {
    return data ? new Date(data).getTime() : 0;
  }
}
