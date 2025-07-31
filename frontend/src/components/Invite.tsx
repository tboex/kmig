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
        className={`px-4 py-2 rounded bg-serika-dark--sub-alt-color text-serika-dark--main-color font-bold hover:text-serika-dark--text-color${
            copied ? ' text-serika-dark--text-color' : ' text-serika-dark--sub-color'
            } transition-colors duration-150`}
        onClick={handleCopy}
      >
        {copied ? "Invite Link Copied!" : "Invite a Friend"}
      </button>
    </div>
  );
}
