import { inject } from '@angular/core';
import { CanActivateFn, CanDeactivateFn, Router } from '@angular/router';
import { AuthFacade } from '../facades/auth.facade';
import { MatriculasFacade } from '../facades/matriculas.facade';

/** Exige login. Guarda a URL de destino para voltar depois de entrar. */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthFacade);
  auth.restaurar();
  return auth.logado() || inject(Router).createUrlTree(['/login'], { queryParams: { retorno: state.url } });
};

/** Exige o perfil de instrutor. */
export const instrutorGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthFacade);
  const router = inject(Router);
  auth.restaurar();
  if (!auth.logado()) return router.createUrlTree(['/login'], { queryParams: { retorno: state.url } });
  return auth.ehInstrutor() || router.createUrlTree(['/acesso-negado']);
};

/** Só deixa abrir uma aula de um curso em que o aluno está matriculado. */
export const matriculaGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthFacade);
  const router = inject(Router);
  auth.restaurar();
  const slug = route.paramMap.get('slug') ?? '';
  if (!auth.logado()) return router.createUrlTree(['/login'], { queryParams: { retorno: state.url } });
  return inject(MatriculasFacade).estaMatriculado(slug) || router.createUrlTree(['/cursos', slug]);
};

export interface ComAlteracoesPendentes {
  temAlteracoesPendentes(): boolean;
}

/** Pergunta antes de sair de um formulário com alterações não salvas. */
export const alteracoesPendentesGuard: CanDeactivateFn<ComAlteracoesPendentes> = (componente) =>
  !componente.temAlteracoesPendentes() ||
  confirm('Você tem alterações não salvas. Sair mesmo assim e descartar o que foi preenchido?');
