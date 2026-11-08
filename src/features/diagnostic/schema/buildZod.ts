import { z } from 'zod';
import { Question, Answers } from './types';
import { isQuestionVisible } from './visibility';

/**
 * Construye dinámicamente un esquema Zod para las preguntas activas
 */
export function buildZodSchemaForQuestions(
  questions: Question[],
  answers: Answers,
  tierMode: 'core' | 'all'
) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const q of questions) {
    if (!isQuestionVisible(q, answers, tierMode)) {
      continue;
    }

    let fieldValidator: z.ZodTypeAny;

    switch (q.type) {
      case 'boolean':
        if (q.required) {
          fieldValidator = z.boolean().refine((val) => val === true, {
            message: 'Debe aceptar los términos para continuar',
          });
        } else {
          fieldValidator = z.boolean().optional().nullable();
        }
        break;

      case 'text':
        if (q.required) {
          fieldValidator = z
            .string({ message: 'Este campo es obligatorio' })
            .min(1, 'Por favor ingrese una respuesta');
        } else {
          fieldValidator = z.string().optional().nullable();
        }
        break;

      case 'single':
      case 'range':
        if (q.required) {
          fieldValidator = z
            .string({ message: 'Por favor seleccione una opción' })
            .min(1, 'Por favor seleccione una opción');
        } else {
          fieldValidator = z.string().optional().nullable();
        }
        break;

      case 'multi':
        if (q.required) {
          fieldValidator = z
            .array(z.string())
            .min(1, 'Seleccione al menos una opción');
        } else {
          fieldValidator = z.array(z.string()).optional().nullable();
        }
        break;

      case 'scale':
        if (q.required) {
          fieldValidator = z
            .number({ message: 'Por favor califique en la escala del 1 al 5' })
            .min(1, 'Calificación mínima es 1')
            .max(5, 'Calificación máxima es 5');
        } else {
          fieldValidator = z.number().optional().nullable();
        }
        break;

      case 'number':
        if (q.required) {
          fieldValidator = z
            .number({ message: 'Por favor ingrese un número válido' });
        } else {
          fieldValidator = z.number().optional().nullable();
        }
        break;

      default:
        fieldValidator = z.any().optional();
    }

    shape[q.id] = fieldValidator;
  }

  return z.object(shape);
}
