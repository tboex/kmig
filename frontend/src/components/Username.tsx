import { useState } from 'react';
import FloatingInput from './FloatingInput';
import PressableButton from './PressableButton';

type UsernameProps = {
  open: boolean;
  usernameInput?: string;
  onSubmit: (name: string) => void;
};

export default function Username({ open, usernameInput = '', onSubmit }: UsernameProps) {
  const [localName, setLocalName] = useState(usernameInput);

  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 backdrop-blur-sm"></div>
      <div className="relative p-6 rounded-lg shadow-lg bg-theme-bg min-w-[250px] text-center border-2">
        <h2 className="text-lg font-bold mb-6 text-theme-text">Enter your username</h2>
        <div className="w-full">
          <FloatingInput
            id="modal-username"
            label="Username"
            value={localName}
            onChange={e => setLocalName(e.target.value)}
          />
        </div>
        <div className="mt-4">
          <PressableButton onClick={() => onSubmit(localName)} disabled={!localName.trim()} className="w-full">
            Submit
          </PressableButton>
        </div>

      </div>
    </div>
  );
}
