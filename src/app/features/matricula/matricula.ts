import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CursosFacade } from '../../core/facades/cursos.facade';
import { MatriculasFacade } from '../../core/facades/matriculas.facade';
import { AuthFacade } from '../../core/facades/auth.facade';
import { todasAsAulas } from '../../core/utils/tempo';
import { CapaCurso } from '../../shared/components/capa-curso/capa-curso';
import { nomeCompleto } from '../../shared/validators/validadores';

@Component({
  selector: 'app-matricula',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    CapaCurso,
  ],
  templateUrl: './matricula.html',
  styleUrl: './matricula.scss',
})
export class MatriculaForm {
  readonly slug = input.required<string>();

  protected readonly cursos = inject(CursosFacade);
  private readonly matriculas = inject(MatriculasFacade);
  private readonly auth = inject(AuthFacade);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder).nonNullable;

  protected readonly curso = computed(() => this.cursos.porSlug(this.slug()));
  protected readonly totalAulas = computed(() => {
    const c = this.curso();
    return c ? todasAsAulas(c).length : 0;
  });
  protected readonly jaMatriculado = computed(() => this.matriculas.estaMatriculado(this.slug()));
  protected readonly enviando = signal(false);

  protected readonly objetivos = [
    { valor: 'faculdade', texto: 'Acompanhar a faculdade ou curso técnico' },
    { valor: 'carreira', texto: 'Mudar de carreira ou conseguir o primeiro emprego' },
    { valor: 'trabalho', texto: 'Usar no trabalho atual' },
    { valor: 'curiosidade', texto: 'Aprender por curiosidade' },
  ];

  protected readonly form = this.fb.group({
    nome: [this.auth.usuario()?.nome ?? '', [Validators.required, nomeCompleto]],
    email: [this.auth.usuario()?.email ?? '', [Validators.required, Validators.email]],
    objetivo: ['', Validators.required],
    ritmo: this.fb.control<'leve' | 'moderado' | 'intenso'>('moderado'),
    aceite: [false, Validators.requiredTrue],
  });

  protected readonly ritmos = [
    { valor: 'leve', titulo: 'Leve', texto: '1 a 2 aulas por semana' },
    { valor: 'moderado', titulo: 'Moderado', texto: '3 a 5 aulas por semana' },
    { valor: 'intenso', titulo: 'Intenso', texto: 'Uma aula ou mais por dia' },
  ] as const;

  protected confirmar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const curso = this.curso();
    if (!curso) return;

    this.enviando.set(true);
    const { nome, email, objetivo, ritmo } = this.form.getRawValue();
    this.matriculas.matricular({ slug: curso.slug, nome, email, objetivo, ritmo });
    this.form.markAsPristine();
    this.snackBar.open(`Matrícula confirmada em ${curso.titulo}.`, 'Fechar', { duration: 5000 });
    this.router.navigate(['/cursos', curso.slug]);
  }
}
