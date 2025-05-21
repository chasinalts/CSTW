// Component that provides controls for adjusting image size, dimensions, and aspect ratio
import React, { useState } from 'react';
import Button from './Button';

interface ImageSizeControlsProps {
  id: string;
  currentSize?: 'small' | 'medium' | 'large' | 'custom';
  currentWidth?: number;
  currentHeight?: number;
  currentAspectRatio?: string;
  onSizeChange: (id: string, size: 'small' | 'medium' | 'large' | 'custom') => void;
  onDimensionsChange: (id: string, width: number, height: number) => void;
  onAspectRatioChange: (id: string, aspectRatio: string) => void;
}

const ImageSizeControls: React.FC<ImageSizeControlsProps> = ({
  id,
  currentSize = 'medium',
  currentWidth = 640,
  currentHeight = 360,
  currentAspectRatio = '16/9',
  onSizeChange,
  onDimensionsChange,
  onAspectRatioChange
}) => {
  const [showCustomControls, setShowCustomControls] = useState(currentSize === 'custom');
  const [width, setWidth] = useState(currentWidth);
  const [height, setHeight] = useState(currentHeight);

  // Common aspect ratios
  const aspectRatios = [
    { label: '16:9 (Widescreen)', value: '16/9' },
    { label: '4:3 (Standard)', value: '4/3' },
    { label: '1:1 (Square)', value: '1/1' },
    { label: '3:2 (Classic)', value: '3/2' },
    { label: '21:9 (Ultrawide)', value: '21/9' }
  ];

  const handleSizeChange = (size: 'small' | 'medium' | 'large' | 'custom') => {
    onSizeChange(id, size);
    setShowCustomControls(size === 'custom');

    // Set default dimensions based on size
    if (size === 'small') {
      setWidth(320);
      setHeight(180);
    } else if (size === 'medium') {
      setWidth(640);
      setHeight(360);
    } else if (size === 'large') {
      setWidth(960);
      setHeight(540);
    }
  };

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWidth = parseInt(e.target.value, 10);
    setWidth(newWidth);
    onDimensionsChange(id, newWidth, height);
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHeight = parseInt(e.target.value, 10);
    setHeight(newHeight);
    onDimensionsChange(id, width, newHeight);
  };

  const handleAspectRatioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newAspectRatio = e.target.value;
    onAspectRatioChange(id, newAspectRatio);

    // Update height based on new aspect ratio
    if (newAspectRatio) {
      const [widthRatio, heightRatio] = newAspectRatio.split('/').map(Number);
      const newHeight = Math.round((width * heightRatio) / widthRatio);
      setHeight(newHeight);
      onDimensionsChange(id, width, newHeight);
    }
  };

  return (
    <div className="mt-4 p-4 bg-gray-800 rounded-lg">
      <h3 className="text-cyan-300 text-lg mb-2">Image Size Controls</h3>

      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          onClick={() => handleSizeChange('small')}
          variant={currentSize === 'small' ? 'primary' : 'secondary'}
          size="sm"
        >
          Small
        </Button>
        <Button
          onClick={() => handleSizeChange('medium')}
          variant={currentSize === 'medium' ? 'primary' : 'secondary'}
          size="sm"
        >
          Medium
        </Button>
        <Button
          onClick={() => handleSizeChange('large')}
          variant={currentSize === 'large' ? 'primary' : 'secondary'}
          size="sm"
        >
          Large
        </Button>
        <Button
          onClick={() => handleSizeChange('custom')}
          variant={currentSize === 'custom' ? 'primary' : 'secondary'}
          size="sm"
        >
          Custom
        </Button>
      </div>

      <div className="mb-4">
        <label className="block text-cyan-300 mb-1">Aspect Ratio</label>
        <select
          className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2"
          value={currentAspectRatio}
          onChange={handleAspectRatioChange}
        >
          {aspectRatios.map(ratio => (
            <option key={ratio.value} value={ratio.value}>
              {ratio.label}
            </option>
          ))}
        </select>
      </div>

      {showCustomControls && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-cyan-300 mb-1">Width (px)</label>
            <input
              type="number"
              className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2"
              value={width}
              onChange={handleWidthChange}
              min={100}
              max={1920}
            />
          </div>
          <div>
            <label className="block text-cyan-300 mb-1">Height (px)</label>
            <input
              type="number"
              className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2"
              value={height}
              onChange={handleHeightChange}
              min={100}
              max={1080}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageSizeControls;
