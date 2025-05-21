import { useState, useEffect, useMemo } from '../../utils/react-imports';
import loggingService, { LogEntry, LogLevel } from '../../utils/loggingService';
import { motion } from 'framer-motion';
import HolographicText from '../ui/HolographicText';

// Define log level colors
const LOG_LEVEL_COLORS = {
  [LogLevel.DEBUG]: 'text-gray-400',
  [LogLevel.INFO]: 'text-blue-400',
  [LogLevel.LOG]: 'text-white',
  [LogLevel.WARN]: 'text-yellow-400',
  [LogLevel.ERROR]: 'text-red-400'
};

// Define log level icons
const LOG_LEVEL_ICONS = {
  [LogLevel.DEBUG]: '🔍',
  [LogLevel.INFO]: 'ℹ️',
  [LogLevel.LOG]: '📝',
  [LogLevel.WARN]: '⚠️',
  [LogLevel.ERROR]: '❌'
};

const LogViewer = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<LogLevel | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [showStackTrace, setShowStackTrace] = useState(false);

  // Initialize logging service
  useEffect(() => {
    loggingService.initialize();

    // Cleanup on unmount
    return () => {
      // Don't restore console methods on unmount to keep capturing logs
    };
  }, []);

  // Refresh logs periodically if autoRefresh is enabled
  useEffect(() => {
    const refreshLogs = () => {
      setLogs(loggingService.getLogs());
    };

    // Initial load
    refreshLogs();

    // Set up auto-refresh
    let intervalId: number | undefined;
    if (autoRefresh) {
      intervalId = window.setInterval(refreshLogs, 2000);
    }

    // Cleanup
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoRefresh]);

  // Filter and search logs
  const filteredLogs = useMemo(() => {
    let result = logs;

    // Apply level filter
    if (filter !== 'all') {
      result = result.filter(log => log.level === filter);
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(log =>
        log.message.toLowerCase().includes(term) ||
        (log.stack && log.stack.toLowerCase().includes(term))
      );
    }

    return result;
  }, [logs, filter, searchTerm]);

  // Handle clear logs
  const handleClearLogs = () => {
    loggingService.clearLogs();
    setLogs([]);
  };

  // Handle export logs
  const handleExportLogs = () => {
    const json = loggingService.exportLogs();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `app-logs-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString() + '.' + date.getMilliseconds().toString().padStart(3, '0');
  };

  return (
    <div className="bg-gray-900/80 rounded-lg shadow-lg p-4 backdrop-blur-sm border border-cyan-800/50">
      <div className="flex justify-between items-center mb-4">
        <HolographicText text="System Logs" as="h2" className="text-xl font-bold" />
        <div className="flex space-x-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1 rounded text-sm ${
              autoRefresh ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            {autoRefresh ? '🔄 Auto-refresh On' : '⏸️ Auto-refresh Off'}
          </button>
          <button
            onClick={handleClearLogs}
            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
          >
            🗑️ Clear Logs
          </button>
          <button
            onClick={handleExportLogs}
            className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
          >
            💾 Export
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
          />
        </div>
        <div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as LogLevel | 'all')}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
          >
            <option value="all">All Levels</option>
            <option value={LogLevel.DEBUG}>Debug</option>
            <option value={LogLevel.INFO}>Info</option>
            <option value={LogLevel.LOG}>Log</option>
            <option value={LogLevel.WARN}>Warning</option>
            <option value={LogLevel.ERROR}>Error</option>
          </select>
        </div>
        <div>
          <label className="flex items-center space-x-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white">
            <input
              type="checkbox"
              checked={showStackTrace}
              onChange={() => setShowStackTrace(!showStackTrace)}
            />
            <span>Show Stack Traces</span>
          </label>
        </div>
      </div>

      <div className="bg-black/50 rounded border border-gray-800 h-[500px] overflow-y-auto">
        {filteredLogs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            No logs to display
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {filteredLogs.map((log, index) => (
              <motion.div
                key={`log-${log.timestamp}-${index}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`p-2 hover:bg-gray-800/50 cursor-pointer ${
                  expanded === index ? 'bg-gray-800/50' : ''
                }`}
                onClick={() => setExpanded(expanded === index ? null : index)}
              >
                <div className="flex items-start">
                  <div className="w-6 text-center mr-2">
                    {LOG_LEVEL_ICONS[log.level]}
                  </div>
                  <div className="w-24 text-xs text-gray-400 mr-2">
                    {formatTimestamp(log.timestamp)}
                  </div>
                  <div className={`flex-1 ${LOG_LEVEL_COLORS[log.level]}`}>
                    {log.message}
                  </div>
                </div>

                {expanded === index && (
                  <div className="mt-2 ml-8 text-xs">
                    <div className="bg-gray-900 p-2 rounded border border-gray-700 overflow-x-auto">
                      <pre className="text-gray-300">
                        {log.data?.map((item, i) => (
                          <div key={`log-data-${index}-${i}`} className="mb-1">
                            {typeof item === 'object' && item !== null
                              ? JSON.stringify(item, null, 2)
                              : String(item)}
                          </div>
                        ))}
                      </pre>

                      {showStackTrace && log.stack && (
                        <div className="mt-2 pt-2 border-t border-gray-700">
                          <div className="text-yellow-500 mb-1">Stack Trace:</div>
                          <pre className="text-gray-400 whitespace-pre-wrap">
                            {log.stack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-2 text-xs text-gray-500 flex justify-between">
        <span>Total logs: {logs.length}</span>
        <span>Filtered logs: {filteredLogs.length}</span>
      </div>
    </div>
  );
};

export default LogViewer;
