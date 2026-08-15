/**
 * FormField.jsx
 * -----------------------------------------
 * Composes label + Input + error message, per approved Design System
 * form pattern (A.14): inline validation errors render below the field
 * with a small red message, static label always above.
 */

import Input from '../atoms/Input';
import { classNames } from '../../../utils';

export default function FormField({
  label,
  name,
  error,
  register,
  registerOptions,
  type = 'text',
  placeholder,
  className = '',
  as: Component = Input,
  ...rest
}) {
  return (
    <div className={classNames('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <Component
        id={name}
        type={type}
        placeholder={placeholder}
        error={!!error}
        {...(register ? register(name, registerOptions) : {})}
        {...rest}
      />
      {error && <span className="text-xs text-danger">{error.message}</span>}
    </div>
  );
}