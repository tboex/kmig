import { useState } from 'react';

export default function Invite() {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex justify-center mt-4">
      <button
        className={`px-4 py-2 rounded bg-desert-oasis--sub-alt-color text-desert-oasis--main-color font-bold hover:text-desert-oasis--text-color${
            copied ? ' text-desert-oasis--text-color' : ' text-desert-oasis--sub-color'
            } transition-colors duration-150`}
        onClick={handleCopy}
      >
        {copied ? "Invite Link Copied!" : "Invite a Friend"}
      </button>
    </div>
  );
}
