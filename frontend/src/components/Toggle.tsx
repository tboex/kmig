interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  ariaLabel?: string;
  disabled?: boolean;
}

export default function Toggle({ checked, onChange, ariaLabel, disabled }: ToggleProps) {
  return (
    <label className="switch" aria-label={ariaLabel}>
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        aria-checked={checked}
        disabled={disabled}
      />
      <span className="slider" />
    </label>
  );
}
