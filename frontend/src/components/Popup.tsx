import React from 'react';

type PopupProps = {
  open: boolean;
  message: string;
  type?: 'success' | 'error' | 'info' | 'defeat';
  onClose: () => void;
};

export default function Popup({ open, message, type = 'info', onClose }: PopupProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Blurred background */}
      <div className="absolute inset-0 backdrop-blur-sm"></div>
      {/* Popup content */}
      <div className={`relative p-6 rounded-lg shadow-lg bg-white min-w-[250px] text-center
        ${type === 'success' ? 'border-green-500 text-green-700' : ''}
        ${type === 'error' ? 'border-red-500 text-red-700' : ''}
        ${type === 'info' ? 'border-blue-500 text-blue-700' : ''}
        ${type === 'defeat' ? 'border-gray-500 text-gray-700' : ''}
        border-2`}>
        <div className="mb-4">{message}</div>
        <button
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}
