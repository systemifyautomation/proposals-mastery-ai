// Persistent storage using native messaging host
const NATIVE_HOST_NAME = 'com.proposalsmastery.settings';

class PersistentStorage {
  constructor() {
    this.nativeHostAvailable = false;
    this.checkNativeHost();
  }

  // Check if native host is available
  async checkNativeHost() {
    try {
      const response = await this.sendNativeMessage({ action: 'load' });
      this.nativeHostAvailable = response.success;
      console.log('[Storage] Native host available:', this.nativeHostAvailable);
      return this.nativeHostAvailable;
    } catch (error) {
      console.log('[Storage] Native host not available, using chrome.storage');
      this.nativeHostAvailable = false;
      return false;
    }
  }

  // Send message to native host
  sendNativeMessage(message) {
    return new Promise((resolve, reject) => {
      try {
        const port = chrome.runtime.connectNative(NATIVE_HOST_NAME);
        
        port.onMessage.addListener((response) => {
          resolve(response);
          port.disconnect();
        });
        
        port.onDisconnect.addListener(() => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          }
        });
        
        port.postMessage(message);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Save settings
  async save(settings) {
    console.log('[Storage] Saving settings:', settings);
    
    // Always save to chrome.storage as backup
    await chrome.storage.local.set(settings);
    
    // Also save to native host if available
    if (this.nativeHostAvailable) {
      try {
        const response = await this.sendNativeMessage({
          action: 'save',
          settings: settings
        });
        
        if (response.success) {
          console.log('[Storage] Settings saved to persistent storage');
        } else {
          console.error('[Storage] Failed to save to native host:', response.error);
        }
      } catch (error) {
        console.error('[Storage] Native host save error:', error);
      }
    }
    
    return { success: true };
  }

  // Load settings
  async load(keys = null) {
    console.log('[Storage] Loading settings');
    
    // Try native host first if available
    if (this.nativeHostAvailable) {
      try {
        const response = await this.sendNativeMessage({ action: 'load' });
        
        if (response.success && response.settings) {
          console.log('[Storage] Settings loaded from persistent storage');
          
          // Also update chrome.storage with the persistent settings
          await chrome.storage.local.set(response.settings);
          
          // Return requested keys or all settings
          if (keys) {
            if (Array.isArray(keys)) {
              const result = {};
              keys.forEach(key => {
                if (response.settings[key] !== undefined) {
                  result[key] = response.settings[key];
                }
              });
              return result;
            } else {
              return { [keys]: response.settings[keys] };
            }
          }
          return response.settings;
        }
      } catch (error) {
        console.error('[Storage] Native host load error:', error);
      }
    }
    
    // Fallback to chrome.storage
    console.log('[Storage] Loading from chrome.storage');
    return await chrome.storage.local.get(keys);
  }

  // Clear all settings
  async clear() {
    console.log('[Storage] Clearing all settings');
    
    // Clear chrome.storage
    await chrome.storage.local.clear();
    
    // Clear native host if available
    if (this.nativeHostAvailable) {
      try {
        const response = await this.sendNativeMessage({ action: 'clear' });
        
        if (response.success) {
          console.log('[Storage] Persistent storage cleared');
        }
      } catch (error) {
        console.error('[Storage] Native host clear error:', error);
      }
    }
    
    return { success: true };
  }

  // Get storage file path (for display purposes)
  async getStoragePath() {
    if (this.nativeHostAvailable) {
      try {
        const response = await this.sendNativeMessage({ action: 'getPath' });
        if (response.success) {
          return response.path;
        }
      } catch (error) {
        console.error('[Storage] Error getting path:', error);
      }
    }
    return 'Chrome storage (cleared on uninstall)';
  }
}

// Create singleton instance
const persistentStorage = new PersistentStorage();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = persistentStorage;
}
