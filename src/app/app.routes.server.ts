import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Estratégia de renderização por rota:
 * - Páginas públicas (início, catálogo, curso): SSR, boas para SEO e primeiro carregamento.
 * - Áreas que dependem do usuário logado (dados no localStorage): renderizadas no navegador.
 */
export const serverRoutes: ServerRoute[] = [
  { path: 'cursos/:slug/aula/:videoId', renderMode: RenderMode.Client },
  { path: 'cursos/:slug/matricula', renderMode: RenderMode.Client },
  { path: 'minha-area', renderMode: RenderMode.Client },
  { path: 'instrutor/**', renderMode: RenderMode.Client },
  { path: 'instrutor', renderMode: RenderMode.Client },
  { path: 'login', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Server },
];
