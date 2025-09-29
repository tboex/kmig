import FloatingInput from './FloatingInput';

type UsernameProps = {
  open: boolean;
  usernameInput: string;
  setUsernameInput: (value: string) => void;
  onSubmit: () => void;
};

export default function Username({ open, usernameInput, setUsernameInput, onSubmit }: UsernameProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 backdrop-blur-sm"></div>
      <div className="relative p-6 rounded-lg shadow-lg bg-white min-w-[250px] text-center border-2">
        <h2 className="text-lg font-bold mb-2">Enter your username</h2>
        <div className="w-full">
          <FloatingInput
            id="modal-username"
            label="Username"
            value={usernameInput}
            onChange={e => setUsernameInput(e.target.value)}
          />
        </div>
        <button
          className="mt-4 px-4 py-2 rounded bg-blue-500 text-white"
          onClick={onSubmit}
        >
          Submit
        </button>
      </div>
    </div>
  );
}
