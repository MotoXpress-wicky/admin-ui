import {useId,type InputHTMLAttributes, type Ref} from 'react'

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement>{
    label:string;
    error?:string;
    ref?:Ref<HTMLInputElement>

}

export const InputField = ({
  label,
  error,
  id,
  ref,
  ...rest
}: InputFieldProps) => {
  const generatedId = useId();
  const inputId = id ?? rest.name ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className="input-field">
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        ref={ref}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        {...rest}
      />
      {error && (
        <span id={errorId} role="alert" className="input-error">
          {error}
        </span>
      )}
    </div>
  );
};