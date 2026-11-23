import { Injectable, computed, inject, signal } from '@angular/core';
import { CursosService } from '../services/cursos.service';
import { RelogioService } from '../services/relogio.service';
import { ArmazenamentoService } from '../services/armazenamento.service';
import { Aula, Categoria, Catalogo, Curso, Modulo } from '../models/curso';
import { aulaLiberada, aulasLiberadas, duracaoTotalSegundos, todasAsAulas } from '../utils/tempo';

const CHAVE_RASCUNHOS = 'academia-dev:cursos-criados';

export interface ProximaEstreia {
  curso: Curso;
  modulo: Modulo;
  aula: Aula;
  data: number;
}

export type SituacaoCurso = 'disponivel' | 'estreias' | 'em-breve' | 'em-producao';

@Injectable({ providedIn: 'root' })
export class CursosFacade {
  private readonly service = inject(CursosService);
  private readonly relogio = inject(RelogioService);
  private readonly armazenamento = inject(ArmazenamentoService);

  private readonly _catalogo = signal<Catalogo | null>(null);
  private readonly _criados = signal<Curso[]>([]);
  private criadosRestaurados = false;

  readonly carregando = signal(false);
  readonly erro = signal<string | null>(null);

  readonly categorias: readonly Categoria[] = ['Python', 'Java', 'Banco de Dados'];

  readonly cursos = computed(() => [...(this._catalogo()?.cursos ?? []), ...this._criados()]);
  readonly cursosCriados = this._criados.asReadonly();
  readonly canal = computed(() => this._catalogo()?.canal ?? 'https://www.youtube.com/@fabriciocurvello');
  readonly carregado = computed(() => this._catalogo() !== null);

  /** Números reais do catálogo, recalculados conforme as estreias acontecem. */
  readonly estatisticas = computed(() => {
    const agora = this.relogio.agora();
    const oficiais = this._catalogo()?.cursos ?? [];
    const liberadas = oficiais.flatMap((c) => aulasLiberadas(c, agora));
    const programadas = oficiais.flatMap(todasAsAulas).length - liberadas.length;
    return {
      cursos: oficiais.length,
      aulas: liberadas.length,
      horas: Math.round(duracaoTotalSegundos(liberadas) / 3600),
      programadas,
    };
  });

  readonly proximaEstreia = computed<ProximaEstreia | null>(() => {
    const agora = this.relogio.agora();
    let proxima: ProximaEstreia | null = null;
    for (const curso of this.cursos()) {
      for (const modulo of curso.modulos) {
        for (const aula of modulo.aulas) {
          if (!aula.estreia) continue;
          const data = new Date(aula.estreia).getTime();
          if (data > agora && (!proxima || data < proxima.data)) proxima = { curso, modulo, aula, data };
        }
      }
    }
    return proxima;
  });

  carregar(): void {
    if (this._catalogo() || this.carregando()) return;
    this.carregando.set(true);
    this.erro.set(null);
    this.service.obterCatalogo().subscribe({
      next: (catalogo) => {
        this._catalogo.set(catalogo);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar os cursos. Verifique sua conexão e tente de novo.');
        this.carregando.set(false);
      },
    });
  }

  /** Cursos criados pelo instrutor ficam no navegador; lidos só depois da hidratação. */
  restaurarCriados(): void {
    if (this.criadosRestaurados) return;
    this.criadosRestaurados = true;
    this._criados.set(this.armazenamento.ler<Curso[]>(CHAVE_RASCUNHOS, []));
  }

  porSlug(slug: string): Curso | undefined {
    return this.cursos().find((c) => c.slug === slug);
  }

  slugDisponivel(slug: string): boolean {
    return !this.cursos().some((c) => c.slug === slug);
  }

  /** Situação do curso para a interface, considerando o horário atual. */
  situacao(curso: Curso): SituacaoCurso {
    if (curso.status === 'em-producao') return 'em-producao';
    const agora = this.relogio.agora();
    const total = todasAsAulas(curso).length;
    const liberadas = aulasLiberadas(curso, agora).length;
    if (liberadas === total) return 'disponivel';
    return liberadas === 0 ? 'em-breve' : 'estreias';
  }

  aulaLiberada(aula: Aula): boolean {
    return aulaLiberada(aula, this.relogio.agora());
  }

  aulasLiberadas(curso: Curso): Aula[] {
    return aulasLiberadas(curso, this.relogio.agora());
  }

  proximaEstreiaDo(curso: Curso): Aula | null {
    const agora = this.relogio.agora();
    return todasAsAulas(curso).find((a) => !aulaLiberada(a, agora)) ?? null;
  }

  criarCurso(curso: Curso): void {
    this.restaurarCriados();
    this._criados.update((lista) => [...lista, { ...curso, criadoNoApp: true }]);
    this.armazenamento.gravar(CHAVE_RASCUNHOS, this._criados());
  }

  removerCursoCriado(slug: string): void {
    this._criados.update((lista) => lista.filter((c) => c.slug !== slug));
    this.armazenamento.gravar(CHAVE_RASCUNHOS, this._criados());
  }
}
