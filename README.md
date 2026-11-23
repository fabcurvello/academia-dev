# Academia Dev

Plataforma de cursos feita em **Angular 22** que organiza as videoaulas gratuitas do canal
[Fabricio Curvello no YouTube](https://www.youtube.com/@fabriciocurvello) em cursos com matrícula, player integrado e
acompanhamento de progresso.

É um projeto de portfólio: ele mostra, em um app completo e com cuidado de UX/UI, os conteúdos que trabalho nas
aulas de Angular (base: [meu-primeiro-app](https://github.com/fabcurvello/meu-primeiro-app)) e vai além em alguns pontos.

## O que dá para fazer

- **Explorar o catálogo** de cursos de Python, Java e Banco de Dados, com busca (que procura também no nome de cada
  aula), filtro por linguagem e ordenação. Os filtros ficam na URL e dá para compartilhar o link.
- **Ver o curso**: módulos em acordeão, duração real de cada aula, calendário de estreias e contagem regressiva para a
  próxima aula.
- **Matricular-se** com um formulário validado (Reactive Forms).
- **Assistir às aulas** no player do YouTube. A aula é marcada como concluída automaticamente quando o vídeo termina, e
  o app oferece ir para a próxima.
- **Acompanhar o progresso** em "Meus estudos", com o botão "Continuar" levando para a próxima aula pendente.
- **Painel do instrutor**: números do catálogo, tabela ordenável de cursos, próximas estreias e criação de cursos novos
  com módulos e aulas dinâmicos.

### Contas de demonstração

O login é simulado (não há backend). Na tela de login há atalhos para as duas contas:

| Perfil    | E-mail                  | Senha          |
|-----------|-------------------------|----------------|
| Aluno     | aluno@academia.dev      | aluno123       |
| Instrutor | instrutor@academia.dev  | instrutor123   |

Matrículas, progresso e cursos criados ficam salvos no `localStorage` do navegador.

## Conteúdos de Angular aplicados

| Assunto | Onde ver |
|---|---|
| Componentes standalone, `input()` / `input.required()`, controle de fluxo (`@if`, `@for`, `@switch`, `@let`) | `src/app/shared/components`, todas as páginas |
| **Signals**: `signal`, `computed`, `effect`, `linkedSignal`, `toSignal` | `core/facades`, `core/services/relogio.service.ts` |
| Padrão **Facade** separando componentes de services | `core/facades/*.facade.ts` |
| Roteamento com **lazy loading** (`loadComponent`), rotas filhas e `withComponentInputBinding` (params e query params como inputs) | `app.routes.ts`, `features/catalogo`, `features/curso` |
| **Guards funcionais**: `authGuard`, `instrutorGuard`, `matriculaGuard` e `CanDeactivate` para formulário com alterações | `core/guards/guards.ts` |
| **HttpClient** + **interceptors funcionais** (token Bearer e tratamento centralizado de 401/403/404/500) | `core/interceptors/http.interceptors.ts` |
| **Reactive Forms**: `FormBuilder` tipado, `FormArray` aninhado, validadores próprios, validador **assíncrono** | `features/matricula`, `features/instrutor/novo-curso`, `shared/validators` |
| **Pipes** próprios (`duracao`, `tituloAula`) e nativos (`date` em pt-BR) | `shared/pipes` |
| **Diretiva** de atributo (`appImagemReserva`) | `shared/directives` |
| **SSR** com hidratação e `withEventReplay`, modo de renderização por rota (`RenderMode.Server` / `Client`) | `app.config.ts`, `app.routes.server.ts` |
| Código seguro para SSR (`isPlatformBrowser`, `afterNextRender`) | `core/services/armazenamento.service.ts`, `app.ts` |
| SEO: título e meta tags por curso (`Title`, `Meta`) | `features/curso/curso.ts` |
| **Angular Material 3** com tema próprio (`mat.theme`, `theme-overrides`) | `src/styles.scss` |
| `@angular/youtube-player` | `features/aula` |
| Testes unitários com **Vitest** | arquivos `*.spec.ts` |

## Estrutura

```
src/app
├── core/          # regras e estado da aplicação
│   ├── facades/       auth, cursos, matrículas
│   ├── guards/
│   ├── interceptors/
│   ├── models/
│   ├── services/      acesso a dados, localStorage, relógio
│   └── utils/
├── features/      # uma pasta por página (lazy loading)
└── shared/        # componentes, pipes, diretiva, validadores e layout
public/data/cursos.json   # catálogo extraído das playlists do canal
```

## Os dados

O arquivo `public/data/cursos.json` contém os cursos montados a partir das playlists públicas do canal, com o ID, o
título e a duração de cada vídeo. As aulas do curso **Python Completo em Aulas Curtas** têm data de estreia: o app
mostra o curso como "Em breve" e libera cada aula sozinho quando a data chega, sem precisar de nova publicação.

## Rodando o projeto

Requisitos: Node.js 22 ou mais recente.

```bash
npm install
```

```bash
npm start
```

Abra http://localhost:4200.

Outros comandos:

```bash
npm test
```

```bash
npm run build
```

```bash
npm run serve:ssr:academia-dev
```

O último comando sobe o servidor Express com SSR a partir do build de produção (porta 4000).

## Créditos

Videoaulas: Fabricio Curvello. Fontes: Bricolage Grotesque e Atkinson Hyperlegible Next (Google Fonts).
