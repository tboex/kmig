import React from 'react';

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
}

export default function FloatingInput({ id, label, className = '', type = 'text', required = true, ...rest }: FloatingInputProps) {
  // We intentionally default required to true so :valid styles work for the floating label.
  return (
    <div className={`floating-input w-full ${className}`}>
      <input id={id} type={type} required={required} {...rest} className="floating-input__input" />
      <label htmlFor={id} className="floating-input__label">{label}</label>
      <span className="floating-input__underline" />
    </div>
  );
}
