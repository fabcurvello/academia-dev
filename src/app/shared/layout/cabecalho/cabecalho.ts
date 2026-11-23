import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { AuthFacade } from '../../../core/facades/auth.facade';
import { MatriculasFacade } from '../../../core/facades/matriculas.facade';

@Component({
  selector: 'app-cabecalho',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, MatButtonModule, MatMenuModule, MatIconModule],
  templateUrl: './cabecalho.html',
  styleUrl: './cabecalho.scss',
})
export class Cabecalho {
  protected readonly auth = inject(AuthFacade);
  protected readonly matriculas = inject(MatriculasFacade);
}
