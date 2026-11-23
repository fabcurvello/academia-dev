import { PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';
import { AuthFacade } from '../facades/auth.facade';

/** Anexa o token (Bearer) às requisições feitas para a própria aplicação. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthFacade).token();
  if (!token || /^https?:\/\//.test(req.url)) return next(req);
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};

const MENSAGENS: Record<number, string> = {
  0: 'Sem conexão com o servidor. Verifique sua internet.',
  401: 'Sua sessão expirou. Entre de novo para continuar.',
  403: 'Você não tem permissão para acessar este conteúdo.',
  404: 'O conteúdo solicitado não foi encontrado.',
  500: 'O servidor encontrou um erro. Tente de novo em instantes.',
};

/** Tratamento centralizado de erros HTTP: mensagem amigável + logout em 401. */
export const erroInterceptor: HttpInterceptorFn = (req, next) => {
  const noNavegador = isPlatformBrowser(inject(PLATFORM_ID));
  const snackBar = inject(MatSnackBar);
  const auth = inject(AuthFacade);

  return next(req).pipe(
    catchError((erro: HttpErrorResponse) => {
      if (erro.status === 401) auth.logout();
      if (noNavegador) {
        const mensagem = MENSAGENS[erro.status] ?? MENSAGENS[erro.status >= 500 ? 500 : 0];
        snackBar.open(mensagem, 'Fechar', { duration: 6000 });
      }
      return throwError(() => erro);
    }),
  );
};
