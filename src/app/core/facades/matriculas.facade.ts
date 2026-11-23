import { Injectable, computed, inject, linkedSignal } from '@angular/core';
import { AuthFacade } from './auth.facade';
import { CursosFacade } from './cursos.facade';
import { ArmazenamentoService } from '../services/armazenamento.service';
import { Matricula } from '../models/usuario';
import { Curso } from '../models/curso';

type MapaMatriculas = Record<string, Matricula>;

export interface Progresso {
  concluidas: number;
  total: number;
  percentual: number;
}

/**
 * Matrículas e progresso do aluno logado.
 * `linkedSignal` recarrega os dados automaticamente quando o usuário muda
 * (login/logout), mas ainda permite atualizações locais.
 */
@Injectable({ providedIn: 'root' })
export class MatriculasFacade {
  private readonly auth = inject(AuthFacade);
  private readonly cursos = inject(CursosFacade);
  private readonly armazenamento = inject(ArmazenamentoService);

  private readonly _matriculas = linkedSignal<MapaMatriculas>(() => {
    const usuario = this.auth.usuario();
    return usuario ? this.armazenamento.ler<MapaMatriculas>(this.chave(usuario.email), {}) : {};
  });

  readonly lista = computed(() =>
    Object.values(this._matriculas()).sort((a, b) => b.matriculadoEm.localeCompare(a.matriculadoEm)),
  );
  readonly quantidade = computed(() => this.lista().length);

  estaMatriculado(slug: string): boolean {
    return slug in this._matriculas();
  }

  matricula(slug: string): Matricula | undefined {
    return this._matriculas()[slug];
  }

  matricular(dados: Pick<Matricula, 'slug' | 'nome' | 'email' | 'objetivo' | 'ritmo'>): void {
    this.atualizar((mapa) => ({
      ...mapa,
      [dados.slug]: { ...dados, matriculadoEm: new Date().toISOString(), concluidas: [] },
    }));
  }

  cancelar(slug: string): void {
    this.atualizar(({ [slug]: _, ...resto }) => resto);
  }

  alternarConcluida(slug: string, videoId: string): void {
    this.alterarMatricula(slug, (m) => ({
      ...m,
      concluidas: m.concluidas.includes(videoId)
        ? m.concluidas.filter((id) => id !== videoId)
        : [...m.concluidas, videoId],
    }));
  }

  marcarConcluida(slug: string, videoId: string): void {
    this.alterarMatricula(slug, (m) =>
      m.concluidas.includes(videoId) ? m : { ...m, concluidas: [...m.concluidas, videoId] },
    );
  }

  registrarUltimaAula(slug: string, videoId: string): void {
    this.alterarMatricula(slug, (m) => (m.ultimaAula === videoId ? m : { ...m, ultimaAula: videoId }));
  }

  concluida(slug: string, videoId: string): boolean {
    return this._matriculas()[slug]?.concluidas.includes(videoId) ?? false;
  }

  /** Progresso considera só as aulas já liberadas: estreias futuras não contam contra o aluno. */
  progresso(curso: Curso): Progresso {
    const liberadas = this.cursos.aulasLiberadas(curso);
    const feitas = new Set(this._matriculas()[curso.slug]?.concluidas ?? []);
    const concluidas = liberadas.filter((a) => feitas.has(a.videoId)).length;
    const total = liberadas.length;
    return { concluidas, total, percentual: total ? Math.round((concluidas / total) * 100) : 0 };
  }

  /** Próxima aula a assistir: a última aberta, ou a primeira liberada e não concluída. */
  proximaAula(curso: Curso): string | null {
    const matricula = this._matriculas()[curso.slug];
    const liberadas = this.cursos.aulasLiberadas(curso);
    if (matricula?.ultimaAula && !matricula.concluidas.includes(matricula.ultimaAula)) {
      return matricula.ultimaAula;
    }
    const pendente = liberadas.find((a) => !matricula?.concluidas.includes(a.videoId));
    return pendente?.videoId ?? liberadas[0]?.videoId ?? null;
  }

  private alterarMatricula(slug: string, fn: (m: Matricula) => Matricula): void {
    this.atualizar((mapa) => (mapa[slug] ? { ...mapa, [slug]: fn(mapa[slug]) } : mapa));
  }

  private atualizar(fn: (mapa: MapaMatriculas) => MapaMatriculas): void {
    const usuario = this.auth.usuario();
    if (!usuario) return;
    this._matriculas.update(fn);
    this.armazenamento.gravar(this.chave(usuario.email), this._matriculas());
  }

  private chave(email: string): string {
    return `academia-dev:matriculas:${email}`;
  }
}
