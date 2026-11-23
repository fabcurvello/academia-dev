export type Categoria = 'Python' | 'Java' | 'Banco de Dados';

/** publicado: todas as aulas no ar · em-breve: aulas com estreia programada · em-producao: poucas aulas, novas a caminho */
export type StatusCurso = 'publicado' | 'em-breve' | 'em-producao';

export interface Aula {
  videoId: string;
  titulo: string;
  /** Formato do YouTube: "m:ss" ou "h:mm:ss". `null` enquanto a aula não estreou. */
  duracao: string | null;
  /** Data/hora ISO 8601 da estreia. Ausente quando a aula já foi publicada. */
  estreia?: string;
}

export interface Modulo {
  titulo: string;
  playlistId?: string;
  aulas: Aula[];
}

export interface Curso {
  slug: string;
  titulo: string;
  categoria: Categoria;
  status: StatusCurso;
  descricao: string;
  playlistId?: string;
  modulos: Modulo[];
  /** Cursos criados pelo instrutor dentro do app (rascunhos locais). */
  criadoNoApp?: boolean;
}

export interface Catalogo {
  canal: string;
  extraidoEm: string;
  cursos: Curso[];
}

/** Aula + contexto de onde ela está, útil para navegação e listagens. */
export interface AulaNoCurso extends Aula {
  curso: Curso;
  modulo: Modulo;
  indiceGlobal: number;
}
