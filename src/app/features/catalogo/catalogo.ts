import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CursosFacade } from '../../core/facades/cursos.facade';
import { Curso } from '../../core/models/curso';
import { duracaoTotalSegundos, todasAsAulas } from '../../core/utils/tempo';
import { CardCurso } from '../../shared/components/card-curso/card-curso';

type Ordem = 'recomendados' | 'mais-aulas' | 'mais-curtos' | 'titulo';

const normalizar = (texto: string) =>
  texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

@Component({
  selector: 'app-catalogo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    CardCurso,
  ],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.scss',
})
export class Catalogo {
  protected readonly facade = inject(CursosFacade);
  private readonly router = inject(Router);

  /** Query params ligados direto em inputs (withComponentInputBinding). */
  readonly categoria = input<string>();
  readonly busca = input<string>();
  readonly ordem = input<Ordem>();

  protected readonly campoBusca = new FormControl('', { nonNullable: true });
  protected readonly ordemAtual = computed<Ordem>(() => this.ordem() ?? 'recomendados');

  protected readonly resultado = computed(() => {
    const termo = normalizar(this.busca() ?? '');
    const categoria = this.categoria();
    const filtrados = this.facade.cursos().filter((curso) => {
      if (categoria && curso.categoria !== categoria) return false;
      if (!termo) return true;
      // a busca também olha o título das aulas: "fibonacci" encontra os cursos de Java
      const textos = [curso.titulo, curso.descricao, ...todasAsAulas(curso).map((a) => a.titulo)];
      return textos.some((t) => normalizar(t).includes(termo));
    });
    return this.ordenar(filtrados, this.ordemAtual());
  });

  protected readonly temFiltro = computed(() => !!(this.categoria() || this.busca()));

  constructor() {
    // Mantém o campo de busca sincronizado com a URL (ex.: botão voltar do navegador)
    effect(() => {
      const valor = this.busca() ?? '';
      if (this.campoBusca.value !== valor) this.campoBusca.setValue(valor, { emitEvent: false });
    });

    this.campoBusca.valueChanges
      .pipe(
        map((v) => v.trim()),
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(),
      )
      .subscribe((busca) => this.atualizarUrl({ busca: busca || null }));
  }

  protected filtrarCategoria(categoria: string | null): void {
    this.atualizarUrl({ categoria: categoria === this.categoria() ? null : categoria });
  }

  protected mudarOrdem(ordem: Ordem): void {
    this.atualizarUrl({ ordem: ordem === 'recomendados' ? null : ordem });
  }

  protected limparFiltros(): void {
    this.campoBusca.setValue('', { emitEvent: false });
    this.router.navigate([], { queryParams: {}, replaceUrl: true });
  }

  private atualizarUrl(params: Record<string, string | null>): void {
    this.router.navigate([], { queryParams: params, queryParamsHandling: 'merge', replaceUrl: true });
  }

  private ordenar(cursos: Curso[], ordem: Ordem): Curso[] {
    const lista = [...cursos];
    const aulas = (c: Curso) => this.facade.aulasLiberadas(c);
    switch (ordem) {
      case 'mais-aulas':
        return lista.sort((a, b) => todasAsAulas(b).length - todasAsAulas(a).length);
      case 'mais-curtos':
        return lista.sort((a, b) => duracaoTotalSegundos(aulas(a)) - duracaoTotalSegundos(aulas(b)));
      case 'titulo':
        return lista.sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR'));
      default:
        return lista;
    }
  }
}
