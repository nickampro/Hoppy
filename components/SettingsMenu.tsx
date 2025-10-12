import React, { useState, useEffect } from 'react';
import { GameSettings } from '../types/settings';
import { getLatestVersion, isVersionOutdated } from '../utils/settings';
import { forceUpdate } from '../utils/version';

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onSettingsChange: (settings: GameSettings) => void;
}

export const SettingsMenu: React.FC<SettingsMenuProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange
}) => {
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      checkForUpdates();
    }
  }, [isOpen]);

  const checkForUpdates = async () => {
    setCheckingUpdate(true);
    try {
      const latest = await getLatestVersion();
      if (latest) {
        setLatestVersion(latest.version);
        const outdated = await isVersionOutdated(settings.version);
        setUpdateAvailable(outdated);
      }
    } catch (error) {
      console.warn('Update check failed:', error);
    } finally {
      setCheckingUpdate(false);
    }
  };

  const handleSettingChange = (key: keyof GameSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    onSettingsChange(newSettings);
  };

  const handleForceUpdate = async () => {
    try {
      await forceUpdate();
    } catch (error) {
      console.error('Force update failed:', error);
      // Fallback: reload page
      window.location.reload();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
          <h2 className="text-xl font-bold">⚙️ Settings</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl font-bold w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Version & Updates */}
          <div className="border-b pb-4">
            <h3 className="font-bold text-lg mb-3">🔄 Version & Updates</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Current Version:</span>
                <span className="font-mono">{settings.version}</span>
              </div>
              
              {latestVersion && (
                <div className="flex justify-between">
                  <span>Latest Version:</span>
                  <span className="font-mono">{latestVersion}</span>
                </div>
              )}
              
              {updateAvailable && (
                <div className="bg-yellow-100 border border-yellow-400 rounded p-2 mt-2">
                  <p className="text-yellow-800 text-sm mb-2">
                    🔔 A new version is available!
                  </p>
                  <button
                    onClick={handleForceUpdate}
                    className="bg-green-500 text-white px-3 py-1 rounded text-sm font-bold hover:bg-green-600"
                  >
                    Update Now
                  </button>
                </div>
              )}
              
              <button
                onClick={checkForUpdates}
                disabled={checkingUpdate}
                className="w-full bg-blue-500 text-white py-2 rounded font-bold hover:bg-blue-600 disabled:bg-gray-400"
              >
                {checkingUpdate ? '🔄 Checking...' : '🔍 Check for Updates'}
              </button>
            </div>
          </div>

          {/* Difficulty Settings */}
          <div className="border-b pb-4">
            <h3 className="font-bold text-lg mb-3">🎮 Difficulty</h3>
            
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="difficulty"
                  value="easy"
                  checked={settings.difficulty === 'easy'}
                  onChange={(e) => handleSettingChange('difficulty', e.target.value)}
                  className="form-radio"
                />
                <div>
                  <span className="font-medium">🟢 Easy</span>
                  <p className="text-xs text-gray-600">Double jump allowed (tap twice to jump in mid-air)</p>
                </div>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="difficulty"
                  value="normal"
                  checked={settings.difficulty === 'normal'}
                  onChange={(e) => handleSettingChange('difficulty', e.target.value)}
                  className="form-radio"
                />
                <div>
                  <span className="font-medium">🟡 Normal</span>
                  <p className="text-xs text-gray-600">Standard physics (single jump only)</p>
                </div>
              </label>
            </div>
          </div>

          {/* Audio Settings */}
          <div className="border-b pb-4">
            <h3 className="font-bold text-lg mb-3">🔊 Audio</h3>
            
            <label className="flex items-center justify-between">
              <span>Sound Effects</span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
                  className="sr-only"
                />
                <div
                  onClick={() => handleSettingChange('soundEnabled', !settings.soundEnabled)}
                  className={`w-12 h-6 rounded-full cursor-pointer transition-colors ${
                    settings.soundEnabled ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                      settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                    } mt-0.5`}
                  />
                </div>
              </div>
            </label>
            
            <p className="text-xs text-gray-600 mt-1">
              {settings.soundEnabled ? 'Sound effects enabled' : 'Sound effects disabled'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 p-4 rounded-b-lg text-center">
          <button
            onClick={onClose}
            className="bg-blue-500 text-white px-8 py-3 rounded font-bold hover:bg-blue-600 text-lg"
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
};