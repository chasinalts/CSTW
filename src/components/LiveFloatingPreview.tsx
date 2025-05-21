import React, { useState } from 'react';
import { Rnd } from 'react-rnd';

interface LiveFloatingPreviewProps {
  children: React.ReactNode;
  title?: string;
  defaultWidth?: number;
  defaultHeight?: number;
  onClose?: () => void;
}

const LiveFloatingPreview: React.FC<LiveFloatingPreviewProps> = ({
  children,
  title = 'Live Preview',
  defaultWidth = 420,
  defaultHeight = 480,
  onClose,
}) => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  return (
    <Rnd
      default={{ x: 120, y: 80, width: defaultWidth, height: defaultHeight }}
      minWidth={280}
      minHeight={200}
      bounds="window"
      dragHandleClassName="floating-preview-title"
      className="z-50 fixed shadow-2xl rounded-xl border border-cyan-400 bg-white dark:bg-gray-900 transition-colors"
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-cyan-300 bg-gradient-to-r from-cyan-500/20 to-cyan-800/10 rounded-t-xl cursor-move floating-preview-title">
        <span className="font-semibold text-cyan-700 dark:text-cyan-200 select-none">{title}</span>
        <button
          onClick={handleClose}
          className="text-cyan-600 hover:text-red-500 text-lg font-bold px-2 rounded"
          title="Close preview"
        >
          ×
        </button>
      </div>
      <div className="overflow-auto p-3 h-full bg-white dark:bg-gray-900 rounded-b-xl">
        {children}
      </div>
    </Rnd>
  );
};

export default LiveFloatingPreview;
