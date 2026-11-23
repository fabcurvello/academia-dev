import { DuracaoPipe } from './duracao.pipe';
import { TituloAulaPipe } from './titulo-aula.pipe';

describe('DuracaoPipe', () => {
  const pipe = new DuracaoPipe();

  it('formata minutos', () => expect(pipe.transform('9:01')).toBe('9 min'));
  it('formata horas e minutos', () => expect(pipe.transform('1:37:12')).toBe('1h 37min'));
  it('aceita segundos', () => expect(pipe.transform(7200)).toBe('2h'));
  it('usa o texto de vazio quando não há duração', () => {
    expect(pipe.transform(null)).toBe('—');
    expect(pipe.transform(null, 'a definir')).toBe('a definir');
  });
});

describe('TituloAulaPipe', () => {
  const pipe = new TituloAulaPipe();

  it('extrai o assunto de um exercício de Java', () => {
    const titulo = 'Java | Soma e multiplicação de 4 números | sequencial | Lista 03.1 Q02';
    expect(pipe.transform(titulo)).toBe('Soma e multiplicação de 4 números');
    expect(pipe.transform(titulo, 'codigo')).toBe('Q02');
  });

  it('entende o formato do curso Python Completo', () => {
    const titulo = 'Python | A função help() | Aula 02.02';
    expect(pipe.transform(titulo)).toBe('A função help()');
    expect(pipe.transform(titulo, 'codigo')).toBe('Aula 02.02');
  });

  it('entende o formato "Python 01 - Instalação"', () => {
    expect(pipe.transform('Python 01 - Instalação')).toBe('Instalação');
    expect(pipe.transform('Python 01 - Instalação', 'codigo')).toBe('01');
  });
});
