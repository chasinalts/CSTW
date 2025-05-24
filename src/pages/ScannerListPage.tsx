import React from 'react';
import { useState, useEffect } from '../utils/react-imports';
import { Link } from 'react-router-dom';
import { useSupabase } from '../contexts/SupabaseContext';
import { ScannerService, Scanner } from '../services/scannerService';
import Button from '../components/ui/Button';
import TextArea from '../components/ui/TextArea';

const ScannerListPage: React.FC = () => {
  const { supabase } = useSupabase();
  const [scanners, setScanners] = useState<Scanner[]>([]);
  const [selectedScanner, setSelectedScanner] = useState<Scanner | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCode, setShowCode] = useState(false);

  const scannerService = new ScannerService(supabase);

  useEffect(() => {
    loadScanners();
  }, []);

  const loadScanners = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) return;

      const userScanners = await scannerService.getUserScanners(user.id);
      setScanners(userScanners);
      setError(null);
    } catch (err) {
      setError('Failed to load scanners. Please try again.');
      console.error('Error loading scanners:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (scanner: Scanner) => {
    if (!window.confirm('Are you sure you want to delete this scanner?')) return;

    try {
      await scannerService.deleteScanner(scanner.id);
      setScanners(scanners.filter(s => s.id !== scanner.id));
      if (selectedScanner?.id === scanner.id) {
        setSelectedScanner(null);
      }
      setError(null);
    } catch (err) {
      setError('Failed to delete scanner. Please try again.');
      console.error('Error deleting scanner:', err);
    }
  };

  const handleTogglePublic = async (scanner: Scanner) => {
    try {
      const updatedScanner = await scannerService.togglePublicStatus(scanner.id, !scanner.is_public);
      setScanners(scanners.map(s => s.id === scanner.id ? updatedScanner : s));
      if (selectedScanner?.id === scanner.id) {
        setSelectedScanner(updatedScanner);
      }
      setError(null);
    } catch (err) {
      setError('Failed to update scanner visibility. Please try again.');
      console.error('Error updating scanner:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">My Scanners</h1>
          <Link to="/wizard">
            <Button variant="primary">Create New Scanner</Button>
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        <div className="flex gap-6">
          <div className="w-1/3 bg-white rounded-lg shadow-lg p-6 space-y-4">
            {scanners.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No scanners yet. Create your first scanner using the wizard!
              </p>
            ) : (
              scanners.map(scanner => (
                <div
                  key={scanner.id}
                  className={`p-4 rounded-lg cursor-pointer transition-colors ${
                    selectedScanner?.id === scanner.id
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => {
                    setSelectedScanner(scanner);
                    setShowCode(false);
                  }}
                >
                  <h3 className="font-medium text-gray-900">{scanner.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Created {new Date(scanner.created_at!).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="flex-1 bg-white rounded-lg shadow-lg p-6">
            {selectedScanner ? (
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedScanner.name}
                    </h2>
                    <p className="text-gray-500 mt-1">{selectedScanner.description}</p>
                  </div>
                  <div className="space-x-4">
                    <Button
                      variant="secondary"
                      onClick={() => handleTogglePublic(selectedScanner)}
                    >
                      {selectedScanner.is_public ? 'Make Private' : 'Make Public'}
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(selectedScanner)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Scanner Code</h3>
                  <Button
                    variant="secondary"
                    onClick={() => setShowCode(!showCode)}
                  >
                    {showCode ? 'Hide Code' : 'Show Code'}
                  </Button>
                </div>

                {showCode && (
                  <TextArea
                    value={selectedScanner.code}
                    rows={20}
                    readOnly
                  />
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Select a scanner to view its details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScannerListPage;