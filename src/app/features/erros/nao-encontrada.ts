import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-nao-encontrada',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatButtonModule],
  template: `
    <div class="pagina erro">
      <p class="codigo" aria-hidden="true">404</p>
      <h1>Página não encontrada</h1>
      <p class="texto-suave">O endereço pode estar errado ou ter mudado. Os cursos continuam no mesmo lugar.</p>
      <div class="acoes">
        <a mat-flat-button routerLink="/cursos">Ver os cursos</a>
        <a mat-button routerLink="/">Página inicial</a>
      </div>
    </div>
  `,
  styleUrl: './erros.scss',
})
export class NaoEncontrada {}
