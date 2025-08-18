import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

const ConfirmationModal = ({
  isOpen, onClose, onConfirm,
  title = 'Are you sure?',
  message = "You won't be able to revert this!",
  confirmText = 'Yes, confirm',
  cancelText = 'Cancel',
  icon: Icon = AlertTriangle,
  isDestructive = true,
  isConfirming = false,
}) => {
  if (!isOpen) return null;

  const confirmButtonClass = isDestructive
    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 disabled:bg-red-400'
    : 'bg-primary hover:bg-primary-dark focus:ring-primary disabled:bg-primary/70';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 text-center">
          <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${isDestructive ? 'bg-red-100 dark:bg-red-900/30' : 'bg-primary-light/10'}`}>
            <Icon className={`h-6 w-6 ${isDestructive ? 'text-red-600 dark:text-red-400' : 'text-primary-light'}`} />
          </div>
          <h3 className="mt-5 text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
          <div className="mt-2"><p className="text-sm text-gray-500 dark:text-zinc-400">{message}</p></div>
        </div>
        <div className="flex justify-center gap-4 bg-gray-50 dark:bg-zinc-800/50 px-4 py-4 sm:px-6 rounded-b-2xl">
          <button type="button" className="w-full justify-center rounded-md bg-white dark:bg-zinc-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-600 disabled:opacity-50" onClick={onClose} disabled={isConfirming}>
            {cancelText}
          </button>
          <button type="button" className={`w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors ${confirmButtonClass} focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-zinc-900`} onClick={onConfirm} disabled={isConfirming}>
            {isConfirming ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;