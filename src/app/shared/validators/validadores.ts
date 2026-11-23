import { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn } from '@angular/forms';
import { extrairVideoId } from '../../core/utils/tempo';

/** Exige nome e sobrenome. */
export const nomeCompleto: ValidatorFn = (controle: AbstractControl): ValidationErrors | null => {
  const partes = String(controle.value ?? '').trim().split(/\s+/).filter(Boolean);
  return partes.length >= 2 ? null : { nomeCompleto: true };
};

/** Aceita uma URL do YouTube ou um ID de vídeo de 11 caracteres. */
export const videoYoutube: ValidatorFn = (controle: AbstractControl): ValidationErrors | null => {
  const valor = String(controle.value ?? '').trim();
  if (!valor) return null;
  return extrairVideoId(valor) ? null : { videoYoutube: true };
};

/** Duração no formato m:ss ou h:mm:ss. */
export const formatoDuracao: ValidatorFn = (controle: AbstractControl): ValidationErrors | null => {
  const valor = String(controle.value ?? '').trim();
  if (!valor) return null;
  return /^(\d{1,2}:)?[0-5]?\d:[0-5]\d$/.test(valor) ? null : { formatoDuracao: true };
};

/** Validador assíncrono: o slug não pode repetir o de outro curso. */
export function slugUnico(disponivel: (slug: string) => boolean): AsyncValidatorFn {
  return async (controle: AbstractControl) => {
    await new Promise((r) => setTimeout(r, 250)); // simula consulta ao servidor
    return disponivel(String(controle.value ?? '')) ? null : { slugEmUso: true };
  };
}
