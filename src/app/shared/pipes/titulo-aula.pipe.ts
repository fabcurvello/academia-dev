import { Pipe, PipeTransform } from '@angular/core';

const LINGUAGENS = /^(python|java|sql)$/i;
const CODIGO = /(Q\d+|Aula \d+\.\d+|Carro \d+)$/;

/**
 * Os títulos do YouTube carregam muito contexto ("Java | Soma de 4 números | sequencial | Lista 03.1 Q02").
 * Dentro do curso esse contexto já está visível, então o pipe extrai só o assunto da aula.
 *   modo 'assunto' -> 'Soma de 4 números'
 *   modo 'codigo'  -> 'Q02'
 */
@Pipe({ name: 'tituloAula' })
export class TituloAulaPipe implements PipeTransform {
  transform(titulo: string, modo: 'assunto' | 'codigo' = 'assunto'): string {
    const partes = titulo.split('|').map((p) => p.trim()).filter(Boolean);

    if (modo === 'codigo') {
      const ultima = partes.at(-1) ?? '';
      return ultima.match(CODIGO)?.[1] ?? titulo.match(/^Python (\d+)/)?.[1] ?? '';
    }

    if (partes.length === 1) {
      // Formato "Python 01 - Instalação"
      return titulo.replace(/^Python \d+\s*[-–]\s*/, '').trim();
    }
    const semLinguagem = LINGUAGENS.test(partes[0]) ? partes.slice(1) : partes;
    return semLinguagem[0] ?? titulo;
  }
}
