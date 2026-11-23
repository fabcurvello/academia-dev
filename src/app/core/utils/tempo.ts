import { Aula, Curso } from '../models/curso';

/** Converte "m:ss" ou "h:mm:ss" em segundos. Retorna 0 para valores vazios ou inválidos. */
export function duracaoEmSegundos(duracao: string | null | undefined): number {
  if (!duracao) return 0;
  const partes = duracao.split(':').map(Number);
  if (partes.some((p) => Number.isNaN(p))) return 0;
  return partes.reduce((total, parte) => total * 60 + parte, 0);
}

/** Uma aula está liberada quando não tem estreia ou quando a estreia já passou. */
export function aulaLiberada(aula: Aula, agora: number): boolean {
  return !aula.estreia || new Date(aula.estreia).getTime() <= agora;
}

export function todasAsAulas(curso: Curso): Aula[] {
  return curso.modulos.flatMap((m) => m.aulas);
}

export function aulasLiberadas(curso: Curso, agora: number): Aula[] {
  return todasAsAulas(curso).filter((a) => aulaLiberada(a, agora));
}

export function duracaoTotalSegundos(aulas: Aula[]): number {
  return aulas.reduce((total, a) => total + duracaoEmSegundos(a.duracao), 0);
}

/** Extrai o ID de um vídeo a partir de uma URL do YouTube (ou aceita o próprio ID). */
export function extrairVideoId(valor: string): string | null {
  const texto = valor.trim();
  if (/^[\w-]{11}$/.test(texto)) return texto;
  const padroes = [/[?&]v=([\w-]{11})/, /youtu\.be\/([\w-]{11})/, /\/(?:embed|shorts|live)\/([\w-]{11})/];
  for (const padrao of padroes) {
    const achado = texto.match(padrao);
    if (achado) return achado[1];
  }
  return null;
}
