import { zodResolver } from '@hookform/resolvers/zod';
import { Alert as AlertBanner, Button, Input } from 'tektoni-ui';
import { useMemo } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';

import { useCreateAlert } from '../../hooks/use-alerts';
import { useProjects } from '../../hooks/use-projects';
import { alertFormDefaults, alertFormSchema, type AlertFormValues } from '../../schemas/alert';
import { ApiError } from '../../services/api';
import { FieldError } from '../ui/FieldError';
import { Select } from '../ui/Select';

const SEVERITY_OPTIONS = [
  { value: 'critical', label: 'Crítica' },
  { value: 'warning', label: 'Advertencia' },
  { value: 'info', label: 'Informativa' },
];

interface CreateAlertFormProps {
  onCreated: () => void;
  onCancel: () => void;
}

export function CreateAlertForm({ onCreated, onCancel }: CreateAlertFormProps) {
  const projectsQuery = useProjects(1, 100);
  const createAlert = useCreateAlert();

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<AlertFormValues>({
    resolver: zodResolver(alertFormSchema),
    mode: 'onBlur',
    defaultValues: alertFormDefaults,
  });

  const description = useWatch({ control, name: 'description' }) ?? '';

  const projectOptions = useMemo(
    () => (projectsQuery.data?.items ?? []).map((project) => ({ value: project.id, label: project.name })),
    [projectsQuery.data],
  );

  const onSubmit = handleSubmit(async (values) => {
    const project = projectsQuery.data?.items.find((item) => item.id === values.projectId);
    try {
      await createAlert.mutateAsync({ ...values, projectName: project?.name ?? 'Proyecto' });
      reset();
      onCreated();
    } catch (error) {
      if (error instanceof ApiError && error.field === 'title') {
        setError('title', { type: 'server', message: error.message });
        setFocus('title');
        return;
      }
      setError('root', {
        type: 'server',
        message: error instanceof Error ? error.message : 'No se pudo guardar la alerta.',
      });
    }
  });

  const pending = createAlert.isPending || isSubmitting;

  return (
    <form onSubmit={onSubmit} noValidate aria-busy={pending} aria-label="Registrar nueva alerta">
      <div className="form-grid">
        <Controller
          control={control}
          name="projectId"
          render={({ field, fieldState }) => (
            <div className="form-field">
              <Select
                id="alert-project"
                label="Proyecto"
                required
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                options={projectOptions}
                placeholder={projectsQuery.isPending ? 'Cargando proyectos…' : 'Selecciona un proyecto'}
                disabled={projectsQuery.isPending}
                aria-invalid={fieldState.error ? true : undefined}
                aria-describedby={fieldState.error ? 'project-error' : undefined}
              />
              <FieldError id="project-error" message={fieldState.error?.message} />
            </div>
          )}
        />

        <Controller
          control={control}
          name="severity"
          render={({ field, fieldState }) => (
            <div className="form-field">
              <Select
                id="alert-severity"
                label="Severidad"
                required
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                options={SEVERITY_OPTIONS}
                aria-invalid={fieldState.error ? true : undefined}
                aria-describedby={fieldState.error ? 'severity-error' : undefined}
              />
              <FieldError id="severity-error" message={fieldState.error?.message} />
            </div>
          )}
        />

        <Controller
          control={control}
          name="title"
          render={({ field, fieldState }) => (
            <div className="form-field form-field--full">
              <Input
                id="alert-title"
                label="Título"
                required
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                placeholder="Ej. Fisura en muro de contención"
                aria-invalid={fieldState.error ? true : undefined}
                aria-describedby={fieldState.error ? 'title-error' : undefined}
                className={fieldState.error ? 'field--invalid' : undefined}
              />
              <FieldError id="title-error" message={fieldState.error?.message} />
            </div>
          )}
        />

        <div className="form-field form-field--full">
          <label htmlFor="alert-description" className="form-label">
            Descripción
            <span className="form-label__required" aria-hidden="true">
              {' '}
              *
            </span>
            <span className="tk-visually-hidden"> (obligatorio)</span>
          </label>
          <textarea
            id="alert-description"
            rows={4}
            className={errors.description ? 'textarea textarea--invalid' : 'textarea'}
            placeholder="Describe el hallazgo, la ubicación y la acción sugerida."
            aria-invalid={errors.description ? true : undefined}
            aria-describedby={errors.description ? 'description-error' : 'description-help'}
            {...register('description')}
          />
          <div className="form-meta">
            <span id="description-help" className="form-help">
              Mínimo 10 caracteres.
            </span>
            <span className="form-help" aria-hidden="true">
              {description.length}/280
            </span>
          </div>
          <FieldError id="description-error" message={errors.description?.message} />
        </div>
      </div>

      {errors.root?.message ? (
        <div className="form-server-error">
          <AlertBanner tone="danger" title="No se pudo guardar" description={errors.root.message} />
        </div>
      ) : null}

      <div className="form-actions">
        <Button type="button" variant="secondary" fullWidth={false} onClick={onCancel} disabled={pending}>
          Cancelar
        </Button>
        <Button type="submit" fullWidth={false} loading={pending} disabled={pending}>
          Crear alerta
        </Button>
      </div>
    </form>
  );
}
