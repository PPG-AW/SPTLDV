'use client';

import { ReactNode, useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  variant?: 'default' | 'success' | 'achievement' | 'info';
  showCloseButton?: boolean;
}

export function Modal({ 
  isOpen, 
  onClose, 
  children, 
  variant = 'default',
  showCloseButton = true 
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen && !mounted) return null;

  const variants = {
    default: 'bg-white',
    success: 'bg-white',
    achievement: 'bg-white',
    info: 'bg-white',
  };

  const overlayVariants = {
    default: 'bg-black/40',
    success: 'bg-emerald-950/40',
    achievement: 'bg-amber-950/40',
    info: 'bg-blue-950/40',
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    >
      {/* Overlay */}
      <div className={`absolute inset-0 ${overlayVariants[variant]} backdrop-blur-sm`} />

      {/* Modal Content */}
      <div 
        className={`relative max-w-md w-full ${variants[variant]} rounded-3xl shadow-strong animate-scale-in overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        )}
        
        {children}
      </div>
    </div>
  );
}

// Modal Header dengan gradient
interface ModalHeaderProps {
  children: ReactNode;
  variant?: 'success' | 'achievement' | 'info' | 'blue';
}

export function ModalHeader({ children, variant = 'blue' }: ModalHeaderProps) {
  const gradients = {
    success: 'bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600',
    achievement: 'bg-gradient-to-br from-amber-400 via-orange-500 to-pink-500',
    info: 'bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600',
    blue: 'bg-gradient-to-br from-[#3A86EF] via-[#4EA8DE] to-[#7EC8E3]',
  };

  return (
    <div className={`${gradients[variant]} px-8 py-10 text-white relative overflow-hidden`}>
      {/* Decorative circles */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/10" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

// Modal Body
interface ModalBodyProps {
  children: ReactNode;
}

export function ModalBody({ children }: ModalBodyProps) {
  return <div className="px-8 py-6">{children}</div>;
}
