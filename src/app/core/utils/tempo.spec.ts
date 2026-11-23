import { Curso } from '../models/curso';
import { aulaLiberada, aulasLiberadas, duracaoEmSegundos, duracaoTotalSegundos, extrairVideoId } from './tempo';

describe('utilitários de tempo', () => {
  it('converte durações do YouTube em segundos', () => {
    expect(duracaoEmSegundos('9:01')).toBe(541);
    expect(duracaoEmSegundos('1:37:12')).toBe(5832);
    expect(duracaoEmSegundos(null)).toBe(0);
    expect(duracaoEmSegundos('abc')).toBe(0);
  });

  it('libera aulas sem estreia ou com estreia no passado', () => {
    const agora = Date.parse('2026-12-08T12:00:00-03:00');
    expect(aulaLiberada({ videoId: 'a', titulo: '', duracao: '1:00' }, agora)).toBe(true);
    expect(aulaLiberada({ videoId: 'b', titulo: '', duracao: null, estreia: '2026-12-07T19:00:00-03:00' }, agora)).toBe(true);
    expect(aulaLiberada({ videoId: 'c', titulo: '', duracao: null, estreia: '2026-12-09T19:00:00-03:00' }, agora)).toBe(false);
  });

  it('soma só as aulas liberadas de um curso', () => {
    const curso: Curso = {
      slug: 'x',
      titulo: 'X',
      categoria: 'Python',
      status: 'em-breve',
      descricao: '',
      modulos: [
        {
          titulo: 'M',
          aulas: [
            { videoId: 'a', titulo: '', duracao: '5:00' },
            { videoId: 'b', titulo: '', duracao: '5:00', estreia: '2099-01-01T00:00:00Z' },
          ],
        },
      ],
    };
    const liberadas = aulasLiberadas(curso, Date.now());
    expect(liberadas.map((a) => a.videoId)).toEqual(['a']);
    expect(duracaoTotalSegundos(liberadas)).toBe(300);
  });

  it('extrai o ID de vários formatos de link do YouTube', () => {
    expect(extrairVideoId('https://www.youtube.com/watch?v=0xZPa-bI5mA&t=10')).toBe('0xZPa-bI5mA');
    expect(extrairVideoId('https://youtu.be/0xZPa-bI5mA')).toBe('0xZPa-bI5mA');
    expect(extrairVideoId('0xZPa-bI5mA')).toBe('0xZPa-bI5mA');
    expect(extrairVideoId('https://exemplo.com')).toBeNull();
  });
});
