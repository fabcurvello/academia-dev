import { ChangeDetectionStrategy, Component, computed, effect, inject, input, untracked } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { YouTubePlayer } from '@angular/youtube-player';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CursosFacade } from '../../core/facades/cursos.facade';
import { MatriculasFacade } from '../../core/facades/matriculas.facade';
import { AulaNoCurso } from '../../core/models/curso';
import { ContagemRegressiva } from '../../shared/components/contagem-regressiva/contagem-regressiva';
import { DuracaoPipe } from '../../shared/pipes/duracao.pipe';
import { TituloAulaPipe } from '../../shared/pipes/titulo-aula.pipe';

const VIDEO_TERMINOU = 0; // YT.PlayerState.ENDED

@Component({
  selector: 'app-aula',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, YouTubePlayer, MatButtonModule, MatIconModule, ContagemRegressiva, DuracaoPipe, TituloAulaPipe],
  templateUrl: './aula.html',
  styleUrl: './aula.scss',
})
export class AulaPlayer {
  readonly slug = input.required<string>();
  readonly videoId = input.required<string>();

  protected readonly cursos = inject(CursosFacade);
  protected readonly matriculas = inject(MatriculasFacade);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly titulo = inject(Title);
  private readonly tituloAula = new TituloAulaPipe();

  protected readonly curso = computed(() => this.cursos.porSlug(this.slug()));

  /** Todas as aulas do curso em sequência, com o módulo de cada uma. */
  private readonly sequencia = computed<AulaNoCurso[]>(() => {
    const curso = this.curso();
    if (!curso) return [];
    let indice = 0;
    return curso.modulos.flatMap((modulo) =>
      modulo.aulas.map((aula) => ({ ...aula, curso, modulo, indiceGlobal: indice++ })),
    );
  });

  protected readonly atual = computed(() => this.sequencia().find((a) => a.videoId === this.videoId()));
  protected readonly liberada = computed(() => {
    const aula = this.atual();
    return !!aula && this.cursos.aulaLiberada(aula);
  });
  protected readonly anterior = computed(() => {
    const i = this.atual()?.indiceGlobal ?? -1;
    return i > 0 ? this.sequencia()[i - 1] : null;
  });
  protected readonly proxima = computed(() => {
    const i = this.atual()?.indiceGlobal ?? -1;
    const prox = i >= 0 ? this.sequencia()[i + 1] : undefined;
    return prox && this.cursos.aulaLiberada(prox) ? prox : null;
  });
  protected readonly concluida = computed(() => this.matriculas.concluida(this.slug(), this.videoId()));
  protected readonly progresso = computed(() => {
    const c = this.curso();
    return c ? this.matriculas.progresso(c) : null;
  });
  protected readonly posicao = computed(() => {
    const aula = this.atual();
    return aula ? `${aula.indiceGlobal + 1} de ${this.sequencia().length}` : '';
  });

  protected readonly playerVars: YT.PlayerVars = { rel: 0, modestbranding: 1 };

  constructor() {
    effect(() => {
      const aula = this.atual();
      if (!aula || !this.liberada()) return;
      this.titulo.setTitle(`${this.tituloAula.transform(aula.titulo)} · Academia Dev`);
      untracked(() => this.matriculas.registrarUltimaAula(this.slug(), aula.videoId));
    });
  }

  protected alternarConcluida(): void {
    this.matriculas.alternarConcluida(this.slug(), this.videoId());
  }

  protected aoMudarEstado(evento: YT.OnStateChangeEvent): void {
    if (evento.data !== VIDEO_TERMINOU) return;
    this.matriculas.marcarConcluida(this.slug(), this.videoId());
    const proxima = this.proxima();
    if (!proxima) {
      this.snackBar.open('Aula concluída. Você chegou à última aula disponível.', 'Fechar', { duration: 6000 });
      return;
    }
    this.snackBar
      .open('Aula concluída.', 'Próxima aula', { duration: 8000 })
      .onAction()
      .subscribe(() => this.router.navigate(['/cursos', this.slug(), 'aula', proxima.videoId]));
  }

  protected estreia(data: string | undefined): number {
    return data ? new Date(data).getTime() : 0;
  }
}
