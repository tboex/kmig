import { useState } from 'react';
import PressableButton from './PressableButton';

export default function Invite({ pulse = false }: { pulse?: boolean }) {
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
      <PressableButton
        onClick={handleCopy}
        className={`px-4 py-2 ${copied ? 'text-theme-text' : 'text-theme-sub'} bg-[var(--color-sub-alt)] border-[var(--color-sub)] ${pulse ? 'pulse-glow' : ''}`}
      >
        {copied ? 'Invite Link Copied!' : 'Invite a Friend'}
      </PressableButton>
    </div>
  );
}
