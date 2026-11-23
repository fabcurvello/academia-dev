import { Routes } from '@angular/router';
import { alteracoesPendentesGuard, authGuard, instrutorGuard, matriculaGuard } from './core/guards/guards';

/** Todas as páginas usam lazy loading com loadComponent. */
export const routes: Routes = [
  {
    path: '',
    title: 'Academia Dev · Aprenda Python, Java e Banco de Dados',
    loadComponent: () => import('./features/inicio/inicio').then((m) => m.Inicio),
  },
  {
    path: 'cursos',
    title: 'Cursos · Academia Dev',
    loadComponent: () => import('./features/catalogo/catalogo').then((m) => m.Catalogo),
  },
  {
    path: 'cursos/:slug',
    loadComponent: () => import('./features/curso/curso').then((m) => m.CursoDetalhe),
  },
  {
    path: 'cursos/:slug/matricula',
    title: 'Matrícula · Academia Dev',
    canActivate: [authGuard],
    loadComponent: () => import('./features/matricula/matricula').then((m) => m.MatriculaForm),
  },
  {
    path: 'cursos/:slug/aula/:videoId',
    canActivate: [matriculaGuard],
    loadComponent: () => import('./features/aula/aula').then((m) => m.AulaPlayer),
  },
  {
    path: 'login',
    title: 'Entrar · Academia Dev',
    loadComponent: () => import('./features/login/login').then((m) => m.Login),
  },
  {
    path: 'minha-area',
    title: 'Meus estudos · Academia Dev',
    canActivate: [authGuard],
    loadComponent: () => import('./features/minha-area/minha-area').then((m) => m.MinhaArea),
  },
  {
    path: 'instrutor',
    canActivate: [instrutorGuard],
    children: [
      {
        path: '',
        title: 'Painel do instrutor · Academia Dev',
        loadComponent: () => import('./features/instrutor/painel/painel').then((m) => m.PainelInstrutor),
      },
      {
        path: 'novo-curso',
        title: 'Novo curso · Academia Dev',
        canDeactivate: [alteracoesPendentesGuard],
        loadComponent: () => import('./features/instrutor/novo-curso/novo-curso').then((m) => m.NovoCurso),
      },
    ],
  },
  {
    path: 'acesso-negado',
    title: 'Acesso negado · Academia Dev',
    loadComponent: () => import('./features/erros/acesso-negado').then((m) => m.AcessoNegado),
  },
  {
    path: '**',
    title: 'Página não encontrada · Academia Dev',
    loadComponent: () => import('./features/erros/nao-encontrada').then((m) => m.NaoEncontrada),
  },
];
