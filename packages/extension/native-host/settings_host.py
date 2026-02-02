#!/usr/bin/env python3
# Native messaging host for persistent settings storage

import sys
import json
import os
import struct
from pathlib import Path

# Get settings directory based on OS
def get_settings_dir():
    """Get the settings directory path based on the operating system"""
    if sys.platform == 'win32':
        # Windows: %APPDATA%\ProposalsMasteryAI
        base = os.environ.get('APPDATA', os.path.expanduser('~'))
    elif sys.platform == 'darwin':
        # macOS: ~/Library/Application Support/ProposalsMasteryAI
        base = os.path.expanduser('~/Library/Application Support')
    else:
        # Linux: ~/.config/ProposalsMasteryAI
        base = os.path.expanduser('~/.config')
    
    settings_path = os.path.join(base, 'ProposalsMasteryAI')
    os.makedirs(settings_path, exist_ok=True)
    return settings_path

SETTINGS_FILE = os.path.join(get_settings_dir(), 'settings.json')

def send_message(message):
    """Send a message to the extension"""
    encoded = json.dumps(message).encode('utf-8')
    sys.stdout.buffer.write(struct.pack('I', len(encoded)))
    sys.stdout.buffer.write(encoded)
    sys.stdout.buffer.flush()

def read_message():
    """Read a message from the extension"""
    text_length_bytes = sys.stdin.buffer.read(4)
    if len(text_length_bytes) == 0:
        sys.exit(0)
    
    text_length = struct.unpack('I', text_length_bytes)[0]
    text = sys.stdin.buffer.read(text_length).decode('utf-8')
    return json.loads(text)

def save_settings(settings):
    """Save settings to the JSON file"""
    try:
        with open(SETTINGS_FILE, 'w') as f:
            json.dump(settings, f, indent=2)
        return {'success': True}
    except Exception as e:
        return {'success': False, 'error': str(e)}

def load_settings():
    """Load settings from the JSON file"""
    try:
        if os.path.exists(SETTINGS_FILE):
            with open(SETTINGS_FILE, 'r') as f:
                settings = json.load(f)
            return {'success': True, 'settings': settings}
        else:
            return {'success': True, 'settings': None}
    except Exception as e:
        return {'success': False, 'error': str(e)}

def clear_settings():
    """Delete the settings file"""
    try:
        if os.path.exists(SETTINGS_FILE):
            os.remove(SETTINGS_FILE)
        return {'success': True}
    except Exception as e:
        return {'success': False, 'error': str(e)}

def main():
    """Main loop to handle messages from the extension"""
    while True:
        try:
            message = read_message()
            action = message.get('action')
            
            if action == 'save':
                response = save_settings(message.get('settings', {}))
            elif action == 'load':
                response = load_settings()
            elif action == 'clear':
                response = clear_settings()
            elif action == 'getPath':
                response = {'success': True, 'path': SETTINGS_FILE}
            else:
                response = {'success': False, 'error': 'Unknown action'}
            
            send_message(response)
        except Exception as e:
            send_message({'success': False, 'error': str(e)})
            break

if __name__ == '__main__':
    main()
