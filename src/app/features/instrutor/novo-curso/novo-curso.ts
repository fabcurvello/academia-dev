import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CursosFacade } from '../../../core/facades/cursos.facade';
import { Categoria, Curso } from '../../../core/models/curso';
import { extrairVideoId } from '../../../core/utils/tempo';
import { ComAlteracoesPendentes } from '../../../core/guards/guards';
import { CardCurso } from '../../../shared/components/card-curso/card-curso';
import { formatoDuracao, slugUnico, videoYoutube } from '../../../shared/validators/validadores';

const gerarSlug = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

@Component({
  selector: 'app-novo-curso',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    CardCurso,
  ],
  templateUrl: './novo-curso.html',
  styleUrl: './novo-curso.scss',
})
export class NovoCurso implements ComAlteracoesPendentes {
  private readonly fb = inject(FormBuilder).nonNullable;
  protected readonly cursos = inject(CursosFacade);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly limiteDescricao = 220;

  protected readonly form = this.fb.group({
    titulo: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(70)]],
    slug: this.fb.control('', {
      validators: [Validators.required, Validators.pattern(/^[a-z0-9]+(-[a-z0-9]+)*$/)],
      asyncValidators: [slugUnico((s) => this.cursos.slugDisponivel(s))],
    }),
    categoria: this.fb.control<Categoria>('Python', Validators.required),
    descricao: ['', [Validators.required, Validators.maxLength(this.limiteDescricao)]],
    modulos: this.fb.array([this.novoModulo()]),
  });

  /** O valor do formulário como signal alimenta a prévia ao vivo do card. */
  private readonly valor = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

  protected readonly previa = computed<Curso>(() => {
    const v = this.valor();
    return {
      slug: v.slug || 'previa',
      titulo: v.titulo || 'Título do curso',
      categoria: v.categoria ?? 'Python',
      status: 'em-producao',
      descricao: v.descricao || 'A descrição aparece aqui.',
      modulos: (v.modulos ?? []).map((m) => ({
        titulo: m.titulo ?? '',
        aulas: (m.aulas ?? []).map((a) => ({
          titulo: a.titulo ?? '',
          videoId: extrairVideoId(a.video ?? '') ?? '',
          duracao: a.duracao || null,
        })),
      })),
    };
  });

  protected readonly tamanhoDescricao = computed(() => this.valor().descricao?.length ?? 0);

  get modulos(): FormArray {
    return this.form.controls.modulos;
  }

  aulasDo(modulo: FormGroup): FormArray {
    return modulo.get('aulas') as FormArray;
  }

  constructor() {
    // Sugere o slug a partir do título enquanto o instrutor não editar o slug manualmente
    this.form.controls.titulo.valueChanges.subscribe((titulo) => {
      const slug = this.form.controls.slug;
      if (!slug.dirty) slug.setValue(gerarSlug(titulo));
    });
  }

  private novaAula() {
    return this.fb.group({
      titulo: ['', Validators.required],
      video: ['', [Validators.required, videoYoutube]],
      duracao: ['', formatoDuracao],
    });
  }

  private novoModulo() {
    return this.fb.group({
      titulo: ['', Validators.required],
      aulas: this.fb.array([this.novaAula()]),
    });
  }

  protected adicionarModulo(): void {
    this.modulos.push(this.novoModulo());
  }

  protected removerModulo(indice: number): void {
    this.modulos.removeAt(indice);
    this.form.markAsDirty();
  }

  protected adicionarAula(modulo: FormGroup): void {
    this.aulasDo(modulo).push(this.novaAula());
  }

  protected removerAula(modulo: FormGroup, indice: number): void {
    this.aulasDo(modulo).removeAt(indice);
    this.form.markAsDirty();
  }

  temAlteracoesPendentes(): boolean {
    return this.form.dirty;
  }

  protected salvar(): void {
    if (this.form.invalid || this.form.pending) {
      this.form.markAllAsTouched();
      this.snackBar.open('Revise os campos destacados antes de salvar.', 'Fechar', { duration: 4000 });
      return;
    }
    const curso = this.previa();
    this.cursos.criarCurso(curso);
    this.form.markAsPristine();
    this.snackBar.open(`Curso "${curso.titulo}" criado.`, 'Ver curso', { duration: 6000 })
      .onAction()
      .subscribe(() => this.router.navigate(['/cursos', curso.slug]));
    this.router.navigate(['/instrutor']);
  }
}
