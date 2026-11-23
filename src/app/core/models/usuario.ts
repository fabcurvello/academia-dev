export type Perfil = 'aluno' | 'instrutor';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: Perfil;
}

export interface Sessao {
  usuario: Usuario;
  token: string;
}

export interface Matricula {
  slug: string;
  nome: string;
  email: string;
  objetivo: string;
  ritmo: 'leve' | 'moderado' | 'intenso';
  matriculadoEm: string;
  /** videoIds das aulas concluídas */
  concluidas: string[];
  /** última aula aberta, para o botão "Continuar" */
  ultimaAula?: string;
}
