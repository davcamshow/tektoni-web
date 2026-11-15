import { Select as BaseSelect, type SelectProps } from 'tektoni-ui';
import type { ComponentType, SelectHTMLAttributes } from 'react';

/**
 * El `Select` de tektoni-ui reenvía props al `<select>` nativo, pero su tipo
 * solo declara las props propias. Ampliamos el tipo para poder pasar
 * atributos ARIA y de formulario (aria-label, aria-describedby, onBlur…)
 * manteniendo el componente original de la librería.
 */
export type WrappedSelectProps = SelectProps &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange' | 'size' | 'children'>;

export const Select = BaseSelect as unknown as ComponentType<WrappedSelectProps>;
