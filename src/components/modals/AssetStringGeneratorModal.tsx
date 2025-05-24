import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { motion } from 'framer-motion';

interface AssetStringGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AssetStringGeneratorModal: React.FC<AssetStringGeneratorModalProps> = ({ isOpen, onClose }) => {
  const [tickerSymbol, setTickerSymbol] = useState('');
  const [nameId, setNameId] = useState('');
  const [generatedString, setGeneratedString] = useState('');
  const [copied, setCopied] = useState(false);

  // Generate the asset string based on ticker symbol and name ID
  const generateAssetString = () => {
    if (!tickerSymbol) {
      setGeneratedString('Please enter a ticker symbol');
      return;
    }

    // Format the ticker symbol (uppercase, remove spaces)
    const formattedTicker = tickerSymbol.toUpperCase().trim();
    
    // Format the name ID (lowercase, replace spaces with underscores)
    const formattedNameId = nameId 
      ? nameId.toLowerCase().trim().replace(/\s+/g, '_')
      : formattedTicker.toLowerCase();

    // Generate the asset string
    const assetString = `${formattedTicker}:${formattedNameId}`;
    setGeneratedString(assetString);
  };

  // Copy the generated string to clipboard
  const copyToClipboard = () => {
    if (generatedString) {
      navigator.clipboard.writeText(generatedString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Clear all fields
  const clearFields = () => {
    setTickerSymbol('');
    setNameId('');
    setGeneratedString('');
    setCopied(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Asset String Generator">
      <div className="p-6 space-y-6">
        <div className="mb-6">
          <p className="text-gray-300 mb-4">
            Generate a standardized asset string for use in COMET Scanner templates. 
            This tool helps create consistent identifiers for financial instruments.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="ticker-symbol" className="block text-sm font-medium text-gray-300 mb-1">
              Ticker Symbol (required)
            </label>
            <input
              id="ticker-symbol"
              type="text"
              value={tickerSymbol}
              onChange={(e) => setTickerSymbol(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="e.g., AAPL, BTC-USD"
            />
            <p className="text-xs text-gray-400 mt-1">
              The official symbol for the asset (stocks, crypto, forex, etc.)
            </p>
          </div>

          <div>
            <label htmlFor="name-id" className="block text-sm font-medium text-gray-300 mb-1">
              Name ID (optional)
            </label>
            <input
              id="name-id"
              type="text"
              value={nameId}
              onChange={(e) => setNameId(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="e.g., apple, bitcoin"
            />
            <p className="text-xs text-gray-400 mt-1">
              A human-readable identifier. If left blank, will use lowercase ticker.
            </p>
          </div>

          <div className="flex space-x-3">
            <Button onClick={generateAssetString} className="flex-1">
              Generate
            </Button>
            <Button onClick={clearFields} variant="secondary" className="flex-1">
              Clear
            </Button>
          </div>

          {generatedString && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-gray-800 border border-gray-700 rounded-md"
            >
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Generated Asset String:
              </label>
              <div className="flex items-center">
                <code className="flex-1 block p-3 bg-black rounded text-cyan-400 font-mono">
                  {generatedString}
                </code>
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  className="ml-3 min-w-[80px]"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Use this string in your COMET Scanner template code where an asset identifier is needed.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AssetStringGeneratorModal;
