import { z } from 'zod';

/**
 * Esquema único de validación para el formulario de alertas.
 * Es la única fuente de verdad: la capa de servicios recibe los datos ya
 * tipados y el formulario no duplica reglas manuales.
 */
export const alertFormSchema = z.object({
  projectId: z.string().min(1, 'Selecciona un proyecto.'),
  severity: z.enum(['critical', 'warning', 'info'], {
    errorMap: () => ({ message: 'Selecciona una severidad.' }),
  }),
  title: z
    .string()
    .trim()
    .min(5, 'El título debe tener al menos 5 caracteres.')
    .max(80, 'El título no puede exceder 80 caracteres.'),
  description: z
    .string()
    .trim()
    .min(10, 'Describe el hallazgo con al menos 10 caracteres.')
    .max(280, 'La descripción no puede exceder 280 caracteres.'),
});

export type AlertFormValues = z.infer<typeof alertFormSchema>;

export const alertFormDefaults: AlertFormValues = {
  projectId: '',
  severity: 'warning',
  title: '',
  description: '',
};
