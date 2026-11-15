interface FieldErrorProps {
  id: string;
  message?: string;
}

/** Mensaje de error de campo asociado mediante aria-describedby. */
export function FieldError({ id, message }: FieldErrorProps) {
  if (!message) return null;
  return (
    <p id={id} className="field-error" role="alert">
      {message}
    </p>
  );
}
