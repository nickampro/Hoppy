import React, { useState, useEffect } from 'react';
import { GameSettings } from '../types/settings';
import { getLatestVersion, isVersionOutdated } from '../utils/settings';
import { forceUpdate, APP_VERSION } from '../utils/version';

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
  const [updateMessage, setUpdateMessage] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      checkForUpdates();
    }
  }, [isOpen]);

  const checkForUpdates = async () => {
    setCheckingUpdate(true);
    setUpdateMessage('Checking for updates...');
    try {
      const latest = await getLatestVersion();
      if (latest) {
        setLatestVersion(latest.version);
        const outdated = await isVersionOutdated(APP_VERSION);
        setUpdateAvailable(outdated);
        if (outdated) {
          setUpdateMessage(`Update available: ${latest.version}`);
        } else {
          setUpdateMessage('You have the latest version!');
        }
      } else {
        setUpdateMessage('Unable to check for updates');
      }
    } catch (error) {
      console.warn('Update check failed:', error);
      setUpdateMessage('Update check failed');
    } finally {
      setCheckingUpdate(false);
      // Clear message after 3 seconds
      setTimeout(() => setUpdateMessage(''), 3000);
    }
  };

  const handleSettingChange = (key: keyof GameSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    onSettingsChange(newSettings);
  };

  const handleForceUpdate = async () => {
    setUpdateMessage('Updating...');
    try {
      await forceUpdate();
      setUpdateMessage('Update complete! Reloading...');
      // Give user time to see the message
      setTimeout(() => {
        // Force a hard reload to bypass all caches
        window.location.href = window.location.href + '?t=' + Date.now();
      }, 1000);
    } catch (error) {
      console.error('Force update failed:', error);
      setUpdateMessage('Update failed, reloading page...');
      // Fallback: hard reload
      setTimeout(() => {
        window.location.href = window.location.href + '?t=' + Date.now();
      }, 1000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-2">
      <div className="bg-white rounded-lg max-w-sm w-full max-h-[95vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="bg-blue-600 text-white p-3 rounded-t-lg flex justify-between items-center">
          <h2 className="text-lg font-bold">⚙️ Settings</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl font-bold w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        <div className="p-3 space-y-4">
          {/* Version & Updates */}
          <div className="border-b pb-3">
            <h3 className="font-bold text-base mb-2">🔄 Version & Updates</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Current Version:</span>
                <span className="font-mono">{APP_VERSION}</span>
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
                    className="bg-green-500 text-white px-3 py-1 rounded text-sm font-bold hover:bg-green-600 active:bg-green-700 touch-manipulation"
                  >
                    Update Now
                  </button>
                </div>
              )}
              
              <button
                onClick={checkForUpdates}
                disabled={checkingUpdate}
                className="w-full bg-blue-500 text-white py-2 rounded font-bold hover:bg-blue-600 disabled:bg-gray-400 active:bg-blue-700 touch-manipulation"
              >
                {checkingUpdate ? '🔄 Checking...' : '🔍 Check for Updates'}
              </button>
              
              {updateMessage && (
                <div className={`text-center p-2 rounded text-sm ${
                  updateMessage.includes('failed') || updateMessage.includes('Unable') 
                    ? 'bg-red-100 text-red-800' 
                    : updateMessage.includes('latest version') 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {updateMessage}
                </div>
              )}
            </div>
          </div>

          {/* Difficulty Settings */}
          <div className="border-b pb-4">
            <h3 className="font-bold text-lg mb-3">🎮 Difficulty</h3>
            
            <div className="space-y-3">
              <div 
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  settings.difficulty === 'easy' 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 bg-gray-50 hover:border-green-300'
                }`}
                onClick={() => handleSettingChange('difficulty', 'easy')}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="difficulty"
                    value="easy"
                    checked={settings.difficulty === 'easy'}
                    onChange={() => {}} // Handled by div click
                    className="form-radio text-green-500"
                  />
                  <div>
                    <span className="font-medium text-lg">🟢 Easy</span>
                    <p className="text-sm text-gray-600">Double jump allowed (tap twice to jump in mid-air)</p>
                    <p className="text-xs text-red-600 font-medium">⚠️ Leaderboard disabled in Easy mode</p>
                  </div>
                </div>
              </div>
              
              <div 
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  settings.difficulty === 'normal' 
                    ? 'border-yellow-500 bg-yellow-50' 
                    : 'border-gray-200 bg-gray-50 hover:border-yellow-300'
                }`}
                onClick={() => handleSettingChange('difficulty', 'normal')}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="difficulty"
                    value="normal"
                    checked={settings.difficulty === 'normal'}
                    onChange={() => {}} // Handled by div click
                    className="form-radio text-yellow-500"
                  />
                  <div>
                    <span className="font-medium text-lg">🟡 Normal</span>
                    <p className="text-sm text-gray-600">Standard physics (single jump only)</p>
                    <p className="text-xs text-green-600 font-medium">🏆 Leaderboard enabled</p>
                  </div>
                </div>
              </div>
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
            className="bg-blue-500 text-white px-8 py-3 rounded font-bold hover:bg-blue-600 active:bg-blue-700 text-lg touch-manipulation"
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
};