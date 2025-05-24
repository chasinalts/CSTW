import React, { useState } from 'react';
import Modal from '../ui/Modal';
import HolographicText from '../ui/HolographicText';
import Button from '../ui/Button';

// Placeholder for the actual prompt and guide text
// These will be replaced with the full content from previous tasks.
const PROMPT_TICKERID_NAMEID = `
Hello AI. I need your help to generate two specific strings for my TradingView PineScript: a 'tickerID string' and a 'nameID string'. These strings will be used in a scanner that processes multiple assets.

Here's how we'll do this, step-by-step:

Step 1: Ask for My Asset List
First, please ask me for my list of assets. I will provide them in a flexible format, such as:
- EXCHANGE:SYMBOL (e.g., BINANCE:BTCUSDT, NYSE:AAPL)
- SYMBOL only (e.g., BTCUSDT, AAPL, EURUSD)
- A mix of the above
- Separated by commas, newlines, or spaces.
You should be able to parse these common formats.

Step 2: Ask for My 'nameID' (Label) Formatting Preferences
Once you have my asset list, you will ask me THREE questions about how I want the 'nameID' (which is used for display labels and alert messages) to be formatted. Please ask them one by one.

   Preference Question 1: "Do you want to include the Exchange Name in the labels (e.g., 'BINANCE:BTC' instead of just 'BTC')? (Yes/No, default: No)"
      - Why this is asked: Including the exchange can be useful for clarity if I trade the same symbol on multiple exchanges, but it can make labels longer.
      - Your default if I skip: No.

   Preference Question 2: "Do you want to include the Quote Asset in the labels (e.g., 'BTCUSD' or 'BTCUSDT' instead of just 'BTC')? (Yes/No, default: No)"
      - Why this is asked: For forex or crypto, the quote asset is crucial. For stocks, it's often implied (e.g., USD).
      - Your default if I skip: No.

   Preference Question 3: "How do you want the labels to be cased? (Options: 'Uppercase', 'Lowercase', 'As Entered', default: 'Lowercase')"
      - Why this is asked: This determines the text case for the generated 'nameID' string. 'As Entered' will attempt to keep the casing of the base symbol as I typed it.
      - Your default if I skip: Lowercase.

Step 3: Process and Generate the Strings
Based on my asset list and my answers to your preference questions, you will generate:

   A. tickerID String:
      - This string is for the 'tickerid' parameter in PineScript's request.security() function.
      - Format: Each asset should be in the format EXCHANGE:SYMBOL (e.g., BINANCE:BTCUSDT) or just SYMBOL if no exchange was provided (e.g., EURUSD, AAPL).
      - ALL SYMBOLS AND EXCHANGES IN THE tickerID STRING MUST BE CONVERTED TO UPPERCASE.
      - The individual tickerIDs must be comma-separated WITHOUT ANY SPACES after the commas.
      - Example: "BINANCE:BTCUSDT,NASDAQ:AAPL,EURUSD,KRAKEN:SOLUSDTPERP"

   B. nameID String:
      - This string is for display labels on charts and in alert messages.
      - The assets in this string MUST be in the EXACT SAME ORDER as in the tickerID string.
      - The formatting of each nameID will depend on my answers to your Preference Questions in Step 2.
         - Base Symbol: Always included.
         - Exchange Prefix: Added if I answered "Yes" to Preference Question 1. (e.g., "BINANCE:" + symbol)
         - Quote Asset Suffix: Added if I answered "Yes" to Preference Question 2. (e.g., symbol + "USDT")
         - Suffixes like "PERP": If a common suffix like "PERP" or ".P" was part of my input symbol (e.g., BTCUSDTPERP), it should generally be included in the nameID if the quote asset is also included, or if it's part of the base symbol when no quote is explicitly included. Use your best judgment to make it look like a typical chart label.
         - Casing: Applied as per my answer to Preference Question 3. For "As Entered", try to preserve the casing of the base symbol and quote asset as I provided them; the exchange part can be uppercased as is conventional.
      - The individual nameIDs must be comma-separated WITHOUT ANY SPACES after the commas.
      - Example (assuming defaults: No exchange, No quote, Lowercase): "btcusdt,aapl,eurusd,solusdtperp"
      - Example (Yes exchange, Yes quote, Uppercase for KRAKEN:SOLUSDTPERP): "...KRAKEN:SOLUSDTPERP..."
      - Example (No exchange, Yes quote, As Entered for EurUsd): "...eurusd..." (if I typed EurUsd)

Step 4: Provide an Important Reminder
After generating the strings, please remind me: "For cleaner charts, especially with many assets, consider using minimalist labels. You can achieve this by choosing not to include the exchange or quote asset in the nameID if they are not essential for you to identify the asset on your chart."

Step 5: Present the Strings
Clearly label and present the two generated strings.

Error Handling: If some of my input asset strings are unparseable or very ambiguous, please make your best effort to process the ones you can and include a note about any entries you had trouble with.

Please start with Step 1 now.
`.trim();

const GUIDE_TICKERID_NAMEID = `
## User Guide: Generating TickerID & NameID Strings for TradingView PineScript

This guide explains how to use the AI Assistant Prompt to generate \`tickerID\` and \`nameID\` strings, which are essential for creating multi-asset scanners in TradingView's PineScript.

**1. Purpose of the Prompt:**
The primary goal is to create two comma-separated strings:
*   \`tickerID String\`: Used in the \`request.security()\` function in PineScript to fetch data for different assets. Example: \`BINANCE:BTCUSDT,NASDAQ:AAPL,EURUSD\`
*   \`nameID String\`: Used for display purposes, like chart labels or alert messages, corresponding to the assets in the \`tickerID\` string. Example: \`btcusdt,aapl,eurusd\`
It's crucial that the assets in both strings are in the **exact same order**.

**2. How to Use the Prompt:**
*   Copy the entire "Prompt for your AI" text provided in the modal.
*   Paste it into your preferred AI chat interface (e.g., ChatGPT, Claude, Gemini).
*   The AI will then guide you through the process by asking you questions. Follow the AI's lead.

**3. Providing Your Information to the AI:**

*   **Step 1: Asset List:**
    *   When the AI asks for your list of assets, provide them one per line or separated by commas/spaces.
    *   **Preferred Format:** \`EXCHANGE:SYMBOL\` (e.g., \`BINANCE:BTCUSDT\`, \`NYSE:AAPL\`). This is the most explicit.
    *   **Other Accepted Formats:**
        *   \`SYMBOL\` only (e.g., \`BTCUSDT\`, \`AAPL\`). The AI will process these without an exchange prefix for the \`tickerID\`.
        *   Forex pairs (e.g., \`EURUSD\`, \`GBPUSD\`).
    *   The AI is designed to be flexible with common variations.

*   **Step 2: \`nameID\` (Label) Formatting Preferences:**
    The AI will ask you three questions to customize how the \`nameID\` string (used for labels) will look.

    *   **Preference 1: Include Exchange Name?** (e.g., "BINANCE:BTC" vs "BTC")
        *   **Why:** Useful if you trade the same symbol on different exchanges. Makes labels longer.
        *   **AI Default:** No.
        *   **Example:** If "Yes" and input is \`BINANCE:BTCUSDT\`, a label might be \`BINANCE:BTC\` (if quote is excluded).

    *   **Preference 2: Include Quote Asset?** (e.g., "BTCUSD" or "BTCUSDT" vs "BTC")
        *   **Why:** Essential for crypto/forex. For stocks, the quote (e.g., USD) is often implied and can be omitted for brevity.
        *   **AI Default:** No.
        *   **Example:** If "Yes" and input is \`BINANCE:BTCUSDT\`, a label might be \`BTCUSDT\` (if exchange is excluded).

    *   **Preference 3: Label Casing?** (Uppercase, Lowercase, As Entered)
        *   **Why:** Controls the text case of your labels.
        *   **AI Default:** Lowercase.
        *   **"As Entered" Behavior:** This option tries to keep the casing of the base symbol and quote asset as you typed them. For example, if you input \`EurUsd\`, with "As Entered" and "Include Quote", the \`nameID\` would be \`EurUsd\`. The exchange part, if included, is typically uppercased by convention (e.g., \`NYSE:aApL\` would become \`NYSE:aApL\` if exchange is included and "As Entered" is chosen for casing).

**4. Understanding the AI's Output:**

*   **\`tickerID\` String:**
    *   Always formatted as \`EXCHANGE:SYMBOL\` or just \`SYMBOL\`.
    *   **Crucially, all parts are converted to UPPERCASE.**
    *   Items are comma-separated **without spaces**.

*   **\`nameID\` String:**
    *   Formatted based on your answers to the preference questions.
    *   Assets will be in the **same order** as the \`tickerID\` string.
    *   Items are comma-separated **without spaces**.

*   **Minimalist Reminder:** The AI will remind you that for cleaner charts, especially with many assets, minimalist labels (omitting exchange/quote if not crucial) are often better.

*   **Error Notifications:** If the AI has trouble parsing some of your asset inputs, it will notify you and process the entries it could understand.

**5. Tips and Troubleshooting:**

*   **AI is a Tool:** While powerful, AIs aren't perfect. Review the generated strings. If something is not as expected, you can re-prompt, perhaps with a more specific list or by clarifying one asset at a time if you have a problematic entry.
*   **Clear Input is Key:** The more precise your asset list, the better the results.
*   **No Spaces After Commas:** For both generated strings, ensure there are no spaces after the commas when you copy them into your PineScript code.

**Compatible AIs:** This prompt is designed to work well with advanced conversational AIs like ChatGPT (GPT-3.5 Turbo or GPT-4), Claude (v2 or v3), Gemini, and similar models that can follow multi-step instructions.
`.trim();

const PROMPT_PINESCRIPT_LOGIC_TO_FUNCTION = `
Hello AI. I need your help to create a custom PineScript function (or potentially a set of related functions) from a trading logic description I will provide. This function will be used in a TradingView scanner script.

Here's the process:

Step 1: Inquire about Logic Input & PineScript Version
   - First, please ask me if I will provide the trading logic as a natural language description OR as existing PineScript code.
   - Then, ask me which version of PineScript I am targeting (e.g., v5, v6). Default to v6 if I don't specify.

Step 2: Request Details Based on Input Type
   - If I choose "Natural Language": Ask me to describe the trading logic in as much detail as possible. I should specify indicators, conditions, and the desired output (e.g., a buy signal, a sell signal, a numeric value).
   - If I choose "Existing PineScript Code": Ask me to provide the code. I should also specify which part of the code contains the core logic I want to turn into a function(s) and what the key outputs of that logic are.

Step 3: Process My Input
   - If natural language: Translate my description into programmable logic.
   - If existing code: Extract the core, reusable logic from the provided snippet.

Step 4: Create PineScript Function(s)
   - Based on the processed logic, generate one or more reusable PineScript functions that are compatible with the PineScript version I specified.
   - Function Design Requirements:
      - The function(s) should be suitable for use within TradingView's \`request.security()\` function to query data for multiple symbols.
      - The function(s) MUST return boolean signal(s) (e.g., \`isLongEntry\`, \`isShortEntry\`) AND/OR numeric value(s) (e.g., an oscillator value, a specific price level) that can be plotted or used in further analysis. It can return one or multiple values.
      - The code should be well-commented, explaining the purpose of the function and its parameters.

Step 5: Identify and List Required Function Inputs
   - Analyze the generated function(s) and identify all parameters that should be user-configurable (e.g., indicator lengths, price sources like \`close\`, \`hlc3\`, specific thresholds).
   - List these inputs clearly for me. For common parameters (like EMA length, RSI length), suggest typical default values.

Step 6: Present Results Clearly
   - Provide the complete, generated PineScript function(s).
   - Provide the identified list of required inputs and their suggested defaults.
   - Optionally, you can also offer a brief explanation of the function's logic if it's complex.

Error Handling/Clarification:
   - If my initial description or code is unclear, too complex for a single pass, or ambiguous, please ask me clarifying questions before proceeding with function generation.

Example Scenario (Illustrative):
   - User: "Natural Language"
   - AI: "Okay, PineScript version?"
   - User: "v5"
   - AI: "Please describe your trading logic."
   - User: "I want a buy signal when the 10-period EMA crosses above the 20-period EMA, and a sell signal when the 10-period EMA crosses below the 20-period EMA. I also want to know the value of the 10-period EMA."
   - AI (after processing):
      Function:
      \`\`\`pinescript
      //@version=5
      f_ema_cross_signal(simple int len1, simple int len2, series float src) =>
          ema1 = ta.ema(src, len1)
          ema2 = ta.ema(src, len2)
          isLongEntry = ta.crossunder(ema1, ema2) // Corrected: User said 10 above 20 is buy, so this should be ta.crossover
          // AI: "My apologies, I've corrected the crossover logic based on your description. 'ta.crossover(ema1, ema2)' indicates ema1 crossed above ema2."
          // isLongEntry = ta.crossover(ema1, ema2) // Corrected version
          // isShortEntry = ta.crossunder(ema1, ema2)
          // [AI would then provide the corrected full function]
          [ema1, isLongEntry, isShortEntry] // Example, AI will generate the corrected logic.
      \`\`\`
      Required Inputs:
      - len1 (Length for first EMA, e.g., 10)
      - len2 (Length for second EMA, e.g., 20)
      - src (Source price, e.g., \`close\`)
      Output Values:
      - Value of the 10-period EMA.
      - Boolean buy signal.
      - Boolean sell signal.

Please start with Step 1.
`.trim();

const GUIDE_PINESCRIPT_LOGIC_TO_FUNCTION = `
## User Guide: Generating PineScript Scanner Functions with AI

This guide helps you use the AI Assistant Prompt to convert your trading ideas or existing PineScript snippets into reusable PineScript functions, perfect for multi-asset scanners in TradingView.

**1. Purpose of the Prompt:**
The AI will help you create well-structured PineScript functions that:
*   Encapsulate your specific trading logic.
*   Can return boolean buy/sell signals (\`true\`/\`false\`).
*   Can return numeric values (e.g., indicator readings, price levels) for plotting or further analysis.
*   Are designed to be easily integrated into a scanner using TradingView's \`request.security()\` function.
*   The AI will also identify and list the necessary inputs (parameters) for your function, making it configurable.

**2. How to Use the Prompt:**
*   Copy the entire "Prompt for your AI" text from the modal.
*   Paste it into your AI chat interface (e.g., ChatGPT, Claude).
*   The AI will start by asking you two questions:
    1.  Whether your input logic will be in natural language or existing PineScript code.
    2.  Your target PineScript version (v5 or v6 - it defaults to v6 if you don't specify).

**3. Providing Your Logic Information:**

*   **A. If you choose "Natural Language":**
    *   **Be Specific:** Describe your strategy as clearly and detailed as possible.
        *   **Good Example:** "A buy signal occurs if: the 14-period RSI is below 30, AND the 9-period EMA is above the 21-period SMA. Also, I want the current RSI value."
        *   **Vague Example (Avoid):** "Buy when oversold and trend is up." (This is too open to interpretation).
    *   **Mention Indicators:** Name the indicators involved (e.g., EMA, RSI, MACD, Bollinger Bands).
    *   **Conditions:** Clearly state the conditions for entry/exit signals or for calculating specific values (e.g., "RSI crosses above 70", "close price is greater than the upper Bollinger Band").
    *   **Outputs:** Specify what the function should return (e.g., "a buy signal", "a sell signal", "the MACD histogram value").

*   **B. If you choose "Existing PineScript Code":**
    *   **Provide the Code:** Paste your existing PineScript snippet.
    *   **Specify Core Logic:** Crucially, tell the AI *which part* of your code represents the core logic you want to turn into a function. For example, "Focus on the part where \`longCondition\` and \`shortCondition\` are calculated."
    *   **Identify Key Outputs:** Let the AI know what variables or signals from your snippet are the important results you want the function to return.

**4. Understanding the AI's Output:**

The AI will provide you with:
*   **Generated PineScript Function(s):** This is the code you'll use. It will be commented to explain its parts.
*   **Required Inputs List:** A list of parameters the function needs (e.g., \`length\`, \`source\`, \`threshold\`). The AI will suggest common default values.
*   **Optional Explanation:** A brief description of how the generated function works.

**5. How to Use the Generated Code in Your TradingView Scanner Script:**

*   **A. Placement:** Copy the generated function(s) and paste it usually near the top of your PineScript editor in TradingView, typically before the main part of your script that uses \`indicator()\` or \`strategy()\`.

*   **B. Define Inputs:** Use the "Required Inputs List" provided by the AI to create user-configurable inputs in your script using PineScript's \`input.*()\` functions.
    *   **Example:** If the AI says an input is \`len (Length for EMA, e.g., 14)\`, you'd add to your script:
        \`emaLength = input.int(14, title="EMA Length")\`

*   **C. Call within \`request.security()\`:** To use your new function across multiple symbols in a scanner, you'll typically call it inside \`request.security()\`.
    *   **Example:**
        \`\`\`pinescript
        // Assume AI generated: f_my_signal(simple int rsiLen, series float src) => [rsiValue, isBuySignal]
        // And AI listed inputs: rsiLen (e.g., 14), src (e.g., close)

        // In your main script:
        rsiLengthInput = input.int(14, title="RSI Length")
        priceSourceInput = input.source(close, title="Source")

        // Inside your loop or for a specific symbol:
        [currentRsiValue, isBuy] = request.security(symInfo.tickerid, timeframe.period,
                                     f_my_signal(rsiLengthInput, priceSourceInput))
        // Now 'currentRsiValue' and 'isBuy' hold the results for the symbol 'symInfo.tickerid'
        \`\`\`

**6. Important Considerations & Troubleshooting:**

*   **Review and Test:** AI-generated code is a fantastic starting point but ALWAYS needs careful review and thorough testing on historical data and paper trading before live use.
*   **Start Simple:** If you have very complex logic, try breaking it down and prompting the AI for smaller functional pieces first.
*   **AI Limitations:** Extremely intricate, proprietary, or poorly explained logic might be challenging for the AI.
*   **Iterate:** If the first result isn't perfect, don't hesitate to re-prompt the AI with clarifications or refinements to your description.
*   **PineScript Version:** Ensure the AI generates code for your intended PineScript version (v5 or v6). Issues can arise if there's a mismatch.

**Compatible AIs:** This prompt is designed for advanced conversational AIs like ChatGPT (GPT-3.5 Turbo or GPT-4), Claude (v2 or v3), Gemini, etc., which are good at understanding context and generating code.
`.trim();


interface AiPromptsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AiPromptsModal: React.FC<AiPromptsModalProps> = ({ isOpen, onClose }) => {
  const handleCopy = async (textToCopy: string, type: string) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      alert(type + " copied to clipboard!");
    } catch (err) {
      console.error('Failed to copy text: ', err);
      alert('Failed to copy text.');
    }
  };

  // Basic HTML formatting for guides (replace newlines with <br /> for simple paragraphs)
  const formatGuideText = (text: string) => {
    return text
      .split('\n\n') // Split by double newlines for paragraphs
      .map((paragraph, index) => "<p key=" + index + ">" + paragraph.replace(/\n/g, '<br />') + "</p>")
      .join('');
  };

  // More sophisticated formatting for guides if they contain markdown-like elements
  const formatGuideWithMarkdown = (text: string) => {
    let html = text;
    // Titles (## and ###)
    html = html.replace(/^## (.*$)/gim, '<h3 class="text-xl font-semibold text-cyan-300 mt-4 mb-2">$1</h3>');
    html = html.replace(/^### (.*$)/gim, '<h4 class="text-lg font-semibold text-cyan-400 mt-3 mb-1">$1</h4>');

    // Bold (**text** or __text__)
    html = html.replace(/\*\*(.*?)\*\*|__(.*?)__/gim, '<strong>$1$2</strong>');

    // Italic (*text* or _text_)
    html = html.replace(/\*(.*?)\*|_(.*?)_/gim, '<em>$1$2</em>');

    // Inline code (`code`)
    html = html.replace(/`(.*?)`/gim, '<code class="bg-gray-700 text-yellow-300 px-1 py-0.5 rounded text-sm">$1</code>');

    // Lists (- item or * item) - basic handling
    html = html.replace(/^\s*[-*]\s+(.*$)/gim, '<li class="ml-4">$1</li>');
    html = html.replace(/(\<li.*?\<\/li\>)+/gim, '<ul class="list-disc list-inside mb-2">$1</ul>');

    // Paragraphs (split by double newline, then wrap single newlines in <br>)
    html = html.split('\n\n').map(p => "<p class=\"mb-2\">" + p.replace(/\n/g, '<br />') + "</p>").join('');

    return html;
  };


  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="4xl" hideTitle={true}>
      <div className="p-1 futuristic-container text-gray-200"> {/* Added text-gray-200 for base text color */}
        <HolographicText text="AI Assistant Prompts & User Guides" as="h1" variant="title" className="text-center mb-6 text-3xl" />

        <div className="space-y-8 max-h-[80vh] overflow-y-auto p-4 custom-scrollbar"> {/* Added custom-scrollbar if defined elsewhere */}

          {/* Section 1: TickerID & NameID Generation */}
          <section className="p-4 rounded-lg border border-cyan-600/50 bg-gray-800/30 shadow-lg futuristic-container has-scanline">
            <HolographicText text="Prompt & Guide for TickerID/NameID String Generation" as="h2" variant="subtitle" className="text-2xl mb-4 text-cyan-300" />

            <div className="mb-6">
              <label className="block text-sm font-medium text-cyan-400 mb-1">Prompt for your AI:</label>
              <div className="relative bg-gray-900/80 border border-gray-700 p-3 rounded-md max-h-72 overflow-y-auto custom-scrollbar">
                <pre className="text-xs text-gray-300 whitespace-pre-wrap break-words">{PROMPT_TICKERID_NAMEID}</pre>
                <Button
                  onClick={() => handleCopy(PROMPT_TICKERID_NAMEID, "TickerID/NameID Prompt")}
                  variant="secondary"
                  size="sm"
                  className="absolute top-2 right-2 btn-accent !py-1 !px-2 text-xs" // Use btn-accent, ensure high specificity
                >
                  Copy Prompt
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-cyan-400 mb-1">How to use this prompt (User Guide):</label>
              <div
                className="text-sm text-gray-300 leading-relaxed p-3 border border-gray-700 rounded-md bg-gray-900/50 max-h-72 overflow-y-auto custom-scrollbar"
                dangerouslySetInnerHTML={{ __html: formatGuideWithMarkdown(GUIDE_TICKERID_NAMEID) }}
              />
            </div>
          </section>

          {/* Section 2: PineScript Logic-to-Function Conversion */}
          <section className="p-4 rounded-lg border border-purple-600/50 bg-gray-800/30 shadow-lg futuristic-container has-scanline">
            <HolographicText text="Prompt & Guide for PineScript Logic-to-Function" as="h2" variant="subtitle" className="text-2xl mb-4 text-purple-300" />

            <div className="mb-6">
              <label className="block text-sm font-medium text-purple-400 mb-1">Prompt for your AI:</label>
              <div className="relative bg-gray-900/80 border border-gray-700 p-3 rounded-md max-h-72 overflow-y-auto custom-scrollbar">
                <pre className="text-xs text-gray-300 whitespace-pre-wrap break-words">{PROMPT_PINESCRIPT_LOGIC_TO_FUNCTION}</pre>
                <Button
                  onClick={() => handleCopy(PROMPT_PINESCRIPT_LOGIC_TO_FUNCTION, "PineScript Logic-to-Function Prompt")}
                  variant="secondary"
                  size="sm"
                  className="absolute top-2 right-2 btn-accent !py-1 !px-2 text-xs" // Use btn-accent
                >
                  Copy Prompt
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-400 mb-1">How to use this prompt (User Guide):</label>
              <div
                className="text-sm text-gray-300 leading-relaxed p-3 border border-gray-700 rounded-md bg-gray-900/50 max-h-72 overflow-y-auto custom-scrollbar"
                dangerouslySetInnerHTML={{ __html: formatGuideWithMarkdown(GUIDE_PINESCRIPT_LOGIC_TO_FUNCTION) }}
              />
            </div>
          </section>

        </div>
      </div>
    </Modal>
  );
};

export default AiPromptsModal;
