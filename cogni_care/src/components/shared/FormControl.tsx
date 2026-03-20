import { FormControlProps } from "@/features/registration/types/registrationForm";


export function FormControl({
  containerClass,
  labelClass,
  text,
  name,
  placeholder,
  inputClass,
  onChangeHandler,
  required = false,
  onClick,
  type = "text",
  value,
  suffix,
  children,
  id,
  autoComplete,
  error
}: FormControlProps) {
  return (
    <div className={containerClass} onClick={onClick}>
      <label className={labelClass}>{text}</label>
      <div className="relative">
        <input
          id={id}
          type={type}
          name={name}
          value={value}
          placeholder={placeholder}
          required={required}
          className={inputClass}
          onChange={onChangeHandler}
          autoComplete={autoComplete}
        />
        {suffix && suffix}
      </div>
      {children}
      {error && (
        <p className="text-xs font-bold text-destructive ml-1 mt-1 animate-in fade-in duration-300">
          {error}
        </p>
      )}
    </div>
  );
}