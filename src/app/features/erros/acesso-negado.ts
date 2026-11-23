import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-acesso-negado',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatButtonModule],
  template: `
    <div class="pagina erro">
      <p class="codigo" aria-hidden="true">403</p>
      <h1>Esta área é só para instrutores</h1>
      <p class="texto-suave">Sua conta é de aluno. Para ver o painel, entre com a conta de instrutor de demonstração.</p>
      <div class="acoes">
        <a mat-flat-button routerLink="/minha-area">Ir para meus estudos</a>
        <a mat-button routerLink="/cursos">Ver os cursos</a>
      </div>
    </div>
  `,
  styleUrl: './erros.scss',
})
export class AcessoNegado {}
