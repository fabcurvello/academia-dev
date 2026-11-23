import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { CursosFacade } from '../../core/facades/cursos.facade';
import { AuthFacade } from '../../core/facades/auth.facade';
import { MatriculasFacade } from '../../core/facades/matriculas.facade';
import { Categoria } from '../../core/models/curso';
import { CardCurso } from '../../shared/components/card-curso/card-curso';
import { ContagemRegressiva } from '../../shared/components/contagem-regressiva/contagem-regressiva';
import { TituloAulaPipe } from '../../shared/pipes/titulo-aula.pipe';

interface Trilha {
  categoria: Categoria;
  texto: string;
}

@Component({
  selector: 'app-inicio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatButtonModule, DatePipe, CardCurso, ContagemRegressiva, TituloAulaPipe],
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss',
})
export class Inicio {
  protected readonly cursos = inject(CursosFacade);
  protected readonly auth = inject(AuthFacade);
  protected readonly matriculas = inject(MatriculasFacade);

  protected readonly estreia = this.cursos.proximaEstreia;
  protected readonly stats = this.cursos.estatisticas;

  protected readonly continuar = computed(() => {
    const ultima = this.matriculas.lista()[0];
    const curso = ultima && this.cursos.porSlug(ultima.slug);
    if (!curso) return null;
    return { curso, videoId: this.matriculas.proximaAula(curso), progresso: this.matriculas.progresso(curso) };
  });

  protected readonly trilhas: Trilha[] = [
    { categoria: 'Python', texto: 'Do primeiro print até funções, coleções e arquivos.' },
    { categoria: 'Java', texto: 'Lógica com mais de 100 exercícios resolvidos e orientação a objetos.' },
    { categoria: 'Banco de Dados', texto: 'Modelagem conceitual, lógica e física, e o MySQL na prática.' },
  ];

  protected contarCursos(categoria: Categoria): number {
    return this.cursos.cursos().filter((c) => c.categoria === categoria && !c.criadoNoApp).length;
  }
}
