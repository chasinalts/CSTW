import React, { useState }
from 'react';
import Modal from '../ui/Modal';
import HolographicText from '../ui/HolographicText';
import Button from '../ui/Button';
import { TextArea, CheckboxField } from '../ui/FormField';

// Interfaces for the generator function
interface AssetFormatOptions {
  includeExchange: boolean;
  includeQuote: boolean;
  casing: 'uppercase' | 'lowercase' | 'as_entered'; // Matched to UI state value
}

interface ProcessedAsset {
  original: string;
  exchange?: string;
  base?: string;
  quote?: string;
  suffix?: string;
  tickerId: string;
  nameId: string;
  error?: string;
}

// Core string generation logic
const generateAssetStrings = (
  rawAssetInput: string,
  formatOptions: AssetFormatOptions
): { tickerIdString: string; nameIdString: string; errors: string[] } => {
  const errors: string[] = [];
  const processedAssets: ProcessedAsset[] = [];

  const lines = rawAssetInput
    .split(/[,\n\s]+/) 
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  for (const line of lines) {
    let originalLine = line;
    let exchange: string | undefined;
    let base: string | undefined;
    let quote: string | undefined;
    let suffix: string | undefined;
    let partError: string | undefined;

    // Store original parts for 'as_entered' casing
    let originalExchangePart: string | undefined;
    let originalSymbolPart = originalLine; // Default if no colon

    const parts = originalLine.split(':');
    if (parts.length === 2) {
      originalExchangePart = parts[0].trim();
      originalSymbolPart = parts[1].trim();
      exchange = originalExchangePart.toUpperCase(); // Exchanges for TickerID are typically uppercase
    } else if (parts.length === 1 && parts[0].trim()) {
      originalSymbolPart = parts[0].trim();
      // exchange remains undefined
    } else {
      partError = `Malformed entry: "${originalLine}". Expected "EXCHANGE:SYMBOL" or "SYMBOL".`;
      errors.push(partError);
      processedAssets.push({ original: originalLine, tickerId: originalLine, nameId: originalLine, error: partError });
      continue; 
    }
    
    let symbolForProcessing = originalSymbolPart;

    // Identify common suffixes
    const suffixMatches = symbolForProcessing.match(/(PERP|USDT(?:PERP)?|\.(P|S))$/i);
    if (suffixMatches) {
      suffix = suffixMatches[0]; // Keep original casing for 'as_entered' later
      symbolForProcessing = symbolForProcessing.substring(0, symbolForProcessing.length - suffix.length);
    }

    // Heuristic to split base and quote
    const commonQuotes = ['USDT', 'USD', 'USDC', 'BTC', 'ETH', 'EUR', 'GBP', 'JPY', 'DAI'];
    let quoteFound = false;
    for (const q of commonQuotes) {
      if (symbolForProcessing.toUpperCase().endsWith(q.toUpperCase()) && symbolForProcessing.length > q.length) {
        base = symbolForProcessing.substring(0, symbolForProcessing.length - q.length);
        quote = symbolForProcessing.substring(symbolForProcessing.length - q.length);
        quoteFound = true;
        break;
      }
    }
    if (!quoteFound) {
      base = symbolForProcessing;
    }

    if (!base) {
      partError = `Could not determine base asset for "${originalLine}".`;
      errors.push(partError);
      processedAssets.push({ original: originalLine, tickerId: originalLine, nameId: originalLine, error: partError });
      continue;
    }

    // Construct TickerID (always full, always uppercase, includes suffix if it was part of symbol)
    let currentTickerId = base.toUpperCase();
    if (quote) currentTickerId += quote.toUpperCase();
    if (suffix) currentTickerId += suffix.toUpperCase();
    if (exchange) currentTickerId = `${exchange}:${currentTickerId}`; // exchange already uppercased

    // Construct NameID based on options
    let nameIdBase = base;
    let nameIdQuote = quote;
    let nameIdSuffix = suffix;
    let nameIdExchange = exchange; // This is already uppercased

    if(formatOptions.casing === 'as_entered') {
        nameIdBase = base; // base was derived from originalSymbolPart, maintaining its case
        nameIdQuote = quote; // quote was derived from originalSymbolPart
        nameIdSuffix = suffix; // suffix was derived from originalSymbolPart
        nameIdExchange = originalExchangePart; // Use original exchange part if present
    }

    let currentNameId = nameIdBase;
    if (formatOptions.includeQuote && nameIdQuote) {
      currentNameId += nameIdQuote;
    }
    // Suffix handling for NameID: if suffix exists and quote is included OR if quote is NOT included but suffix was part of base
    if (nameIdSuffix && (formatOptions.includeQuote || (!formatOptions.includeQuote && !nameIdQuote))) {
        currentNameId += nameIdSuffix;
    }


    if (formatOptions.includeExchange && nameIdExchange) {
      currentNameId = `${nameIdExchange}:${currentNameId}`;
    } else if (formatOptions.includeExchange && exchange && !nameIdExchange && formatOptions.casing !== 'as_entered') {
      // if 'as_entered' and originalExchangePart was undefined, we don't add exchange.
      // Otherwise, if includeExchange is true, and no originalExchangePart, use the uppercased one.
      currentNameId = `${exchange}:${currentNameId}`;
    }


    if (formatOptions.casing === 'uppercase') {
      currentNameId = currentNameId.toUpperCase();
    } else if (formatOptions.casing === 'lowercase') {
      currentNameId = currentNameId.toLowerCase();
    }
    // 'as_entered' logic is handled by using nameIdBase, nameIdQuote, nameIdSuffix, nameIdExchange

    processedAssets.push({
      original: originalLine,
      exchange: exchange, // Uppercased version for reference
      base: base, 
      quote: quote,
      suffix: suffix,
      tickerId: currentTickerId,
      nameId: currentNameId,
      error: partError,
    });
  }

  const tickerIdString = processedAssets.map((p) => p.tickerId).join(',');
  const nameIdString = processedAssets.map((p) => p.nameId).join(',');

  return { tickerIdString, nameIdString, errors };
};

// Existing component code starts here
const RadioButton = ({ label, name, value, checked, onChange }: { label: string, name: string, value: string, checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <label className="flex items-center space-x-2 text-sm text-gray-300 hover:text-white cursor-pointer">
    <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="form-radio text-cyan-400 bg-gray-700 border-gray-600 focus:ring-cyan-500" />
    <span>{label}</span>
  </label>
);

const AssetStringGeneratorModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [assetsInput, setAssetsInput] = useState('');
  const [includeExchange, setIncludeExchange] = useState(false);
  const [includeQuote, setIncludeQuote] = useState(false);
  const [labelCasing, setLabelCasing] = useState('lowercase'); // Matches 'lowercase' in AssetFormatOptions
  const [tickerIdOutput, setTickerIdOutput] = useState('');
  const [nameIdOutput, setNameIdOutput] = useState('');
  // Error messages state will be added in a subsequent subtask

  const handleGenerateStrings = () => {
    // Placeholder - actual call to generateAssetStrings will be added in a subsequent subtask
    // For now, just to show UI update with some dummy data based on options
    const opts = { includeExchange, includeQuote, casing: labelCasing as AssetFormatOptions['casing'] };
    // const { tickerIdString, nameIdString, errors: generationErrors } = generateAssetStrings(assetsInput, opts);
    // setTickerIdOutput(tickerIdString);
    // setNameIdOutput(nameIdString);
    // setGenerationErrors(generationErrors); // Need to add this state

    setTickerIdOutput("Generated TickerID String Placeholder - Check Logic");
    setNameIdOutput(`NameID: casing ${labelCasing}, exch ${includeExchange}, quote ${includeQuote}`);
  };

  const handleCopy = async (textToCopy: string) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      alert('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
      alert('Failed to copy text.');
    }
  };
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setAssetsInput(text); 
      };
      reader.readAsText(file);
      event.target.value = ''; // Allow re-uploading the same file
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="2xl" hideTitle={true}>
      <div className="p-2 space-y-6 futuristic-container has-scanline">
        <HolographicText text="TickerID & NameID Generator" as="h2" variant="subtitle" className="text-center mb-6" />

        <section className="space-y-4 p-4 futuristic-container has-scanline rounded-md">
          <label htmlFor="assets-input" className="block text-sm font-medium text-cyan-300 mb-1">
            Enter Assets (EXCHANGE:BASEQUOTE format, e.g., BINANCE:BTCUSDT - one per line or comma-separated):
          </label>
          <TextArea
            id="assets-input"
            value={assetsInput}
            onChange={(e) => setAssetsInput(e.target.value)}
            rows={6}
            className="w-full text-sm bg-gray-800/70 border-gray-600" // Added bg/border for visibility
            placeholder="BINANCE:BTCUSDT\nCOINBASE:ETHUSD,\nKRAKEN:SOLUSD"
          />
          <div className="flex items-center space-x-3">
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              id="asset-file-upload"
              className="hidden"
            />
            <Button
              onClick={() => document.getElementById('asset-file-upload')?.click()}
              variant="secondary"
              size="sm"
            >
              Upload File (.csv, .txt)
            </Button>
          </div>
        </section>

        <section className="space-y-4 p-4 futuristic-container has-scanline rounded-md">
          <HolographicText text="Label Formatting Options" as="h3" variant="list-title" className="mb-2"/> {/* Assuming list-title is a valid variant or a general class */}
          <p className="text-xs text-gray-400 mb-3">Preferences below determine how assets appear in chart labels.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div className="space-y-3">
              <CheckboxField
                label="Include Exchange Name in Labels?"
                checked={includeExchange}
                onChange={(e) => setIncludeExchange(e.target.checked)}
              />
              <CheckboxField
                label="Include Quote Asset in Labels?"
                checked={includeQuote}
                onChange={(e) => setIncludeQuote(e.target.checked)}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-cyan-300 mb-1">Label Casing:</label>
              <RadioButton label="Uppercase" name="labelCasing" value="uppercase" checked={labelCasing === 'uppercase'} onChange={(e) => setLabelCasing(e.target.value)} />
              <RadioButton label="Lowercase" name="labelCasing" value="lowercase" checked={labelCasing === 'lowercase'} onChange={(e) => setLabelCasing(e.target.value)} />
              <RadioButton label="As Entered" name="labelCasing" value="as_entered" checked={labelCasing === 'as_entered'} onChange={(e) => setLabelCasing(e.target.value)} />
            </div>
          </div>
           <p className="text-xs text-cyan-400/80 mt-3 p-2 border border-cyan-400/30 rounded-md bg-cyan-900/20">
            <strong>Tip:</strong> For many assets, use minimalist labels (e.g., hide common exchanges/quotes) for better chart readability.
          </p>
        </section>

        <div className="flex justify-center pt-2">
          <Button onClick={handleGenerateStrings} className="btn-accent px-8 py-3 text-lg">
            Generate Strings
          </Button>
        </div>
        
        {/* Error display section will be added in a subsequent subtask */}

        {(tickerIdOutput || nameIdOutput) && (
          <section className="space-y-4 p-4 futuristic-container has-scanline rounded-md mt-6">
            <div>
              <label htmlFor="tickerid-output" className="block text-sm font-medium text-cyan-300 mb-1">
                TickerID String (for `request.security()`)
              </label>
              <div className="flex items-center space-x-2">
                <TextArea id="tickerid-output" value={tickerIdOutput} readOnly rows={4} className="w-full text-sm flex-grow bg-gray-800/70 border-gray-600" />
                <Button onClick={() => handleCopy(tickerIdOutput)} variant="secondary" size="sm" aria-label="Copy TickerID String">Copy</Button>
              </div>
            </div>
            <div>
              <label htmlFor="nameid-output" className="block text-sm font-medium text-cyan-300 mb-1">
                NameID String (for labels, alerts)
              </label>
              <div className="flex items-center space-x-2">
                <TextArea id="nameid-output" value={nameIdOutput} readOnly rows={4} className="w-full text-sm flex-grow bg-gray-800/70 border-gray-600" />
                <Button onClick={() => handleCopy(nameIdOutput)} variant="secondary" size="sm" aria-label="Copy NameID String">Copy</Button>
              </div>
            </div>
          </section>
        )}
      </div>
    </Modal>
  );
};

export default AssetStringGeneratorModal;
