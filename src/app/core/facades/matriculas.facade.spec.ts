import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { AuthFacade } from './auth.facade';
import { MatriculasFacade } from './matriculas.facade';
import { Curso } from '../models/curso';

const curso: Curso = {
  slug: 'teste',
  titulo: 'Curso teste',
  categoria: 'Java',
  status: 'publicado',
  descricao: '',
  modulos: [
    {
      titulo: 'M1',
      aulas: [
        { videoId: 'aaaaaaaaaaa', titulo: 'A', duracao: '1:00' },
        { videoId: 'bbbbbbbbbbb', titulo: 'B', duracao: '1:00' },
      ],
    },
  ],
};

describe('MatriculasFacade', () => {
  let auth: AuthFacade;
  let matriculas: MatriculasFacade;

  beforeEach(async () => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    auth = TestBed.inject(AuthFacade);
    matriculas = TestBed.inject(MatriculasFacade);
    await firstValueFrom(auth.login('aluno@academia.dev', 'aluno123'));
  });

  it('matricula o aluno e calcula o progresso', () => {
    matriculas.matricular({ slug: 'teste', nome: 'Ana Souza', email: 'aluno@academia.dev', objetivo: 'carreira', ritmo: 'leve' });
    expect(matriculas.estaMatriculado('teste')).toBe(true);

    matriculas.marcarConcluida('teste', 'aaaaaaaaaaa');
    expect(matriculas.progresso(curso)).toEqual({ concluidas: 1, total: 2, percentual: 50 });
    expect(matriculas.proximaAula(curso)).toBe('bbbbbbbbbbb');
  });

  it('esquece as matrículas ao sair e recupera ao entrar de novo', async () => {
    matriculas.matricular({ slug: 'teste', nome: 'Ana Souza', email: 'aluno@academia.dev', objetivo: 'carreira', ritmo: 'leve' });
    auth.logout(false);
    expect(matriculas.quantidade()).toBe(0);

    await firstValueFrom(auth.login('aluno@academia.dev', 'aluno123'));
    expect(matriculas.estaMatriculado('teste')).toBe(true);
  });

  it('recusa senha errada', async () => {
    auth.logout(false);
    await expect(firstValueFrom(auth.login('aluno@academia.dev', 'errada'))).rejects.toThrow('E-mail ou senha incorretos.');
    expect(auth.logado()).toBe(false);
  });
});
