import { useState, useEffect } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

export interface DeviceInfo {
  type: string;
  name: string;
  os: string;
  browser: string;
  fingerprint?: string;
  isNewDevice?: boolean;
}

export const useDeviceInfo = (): DeviceInfo | null => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);

  useEffect(() => {
    const detectDeviceInfo = async () => {
      const userAgent = navigator.userAgent;
      const platform = navigator.platform;
      let deviceType = 'desktop';
      let deviceName = 'Computer';
      let os = 'Unknown';
      let browser = 'Unknown';
      let fingerprint = undefined;
      let isNewDevice = false;

      // Get device fingerprint
      try {
        // Initialize the FingerprintJS agent
        const fpPromise = FingerprintJS.load();
        
        // Get the visitor identifier
        const fp = await fpPromise;
        const result = await fp.get();
        
        // The unique fingerprint
        fingerprint = result.visitorId;
        console.log('Device fingerprint:', fingerprint);
        
        // Check if this is a new device by comparing with stored fingerprint
        const storedFingerprint = localStorage.getItem('device_fingerprint');
        if (storedFingerprint !== fingerprint) {
          console.log('New device detected!');
          isNewDevice = true;
          // Store the new fingerprint
          localStorage.setItem('device_fingerprint', fingerprint);
          // You could also send this information to your backend for security monitoring
        }
      } catch (error) {
        console.error('Error getting fingerprint:', error);
      }

      // Detect device type
      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
        deviceType = 'mobile';
        deviceName = 'Mobile Device';
      } else if (/iPad|Macintosh|MacIntel/i.test(platform) && navigator.maxTouchPoints > 1) {
        deviceType = 'tablet';
        deviceName = 'Tablet';
      } else if (/MacIntel|MacPPC|Mac68K|Macintosh/i.test(platform)) {
        deviceType = 'laptop';
        deviceName = 'MacBook';
      } else if (/Win32|Win64|Windows|WinCE/i.test(platform)) {
        deviceType = 'laptop';
        deviceName = 'Windows PC';
      } else if (/Linux/i.test(platform)) {
        deviceType = 'laptop';
        deviceName = 'Linux PC';
      }

      // Detect OS
      if (/Windows NT 10.0/i.test(userAgent)) os = 'Windows 10';
      else if (/Windows NT 6.3/i.test(userAgent)) os = 'Windows 8.1';
      else if (/Windows NT 6.2/i.test(userAgent)) os = 'Windows 8';
      else if (/Windows NT 6.1/i.test(userAgent)) os = 'Windows 7';
      else if (/Mac OS X/i.test(userAgent)) {
        const matches = userAgent.match(/Mac OS X ([0-9_]+)/i);
        if (matches && matches[1]) {
          os = 'macOS ' + matches[1].replace(/_/g, '.');
        } else {
          os = 'macOS';
        }
      }
      else if (/Android/i.test(userAgent)) {
        const matches = userAgent.match(/Android ([0-9.]+)/i);
        if (matches && matches[1]) {
          os = 'Android ' + matches[1];
        } else {
          os = 'Android';
        }
      }
      else if (/iOS|iPhone|iPad|iPod/i.test(userAgent)) {
        const matches = userAgent.match(/OS ([0-9_]+)/i);
        if (matches && matches[1]) {
          os = 'iOS ' + matches[1].replace(/_/g, '.');
        } else {
          os = 'iOS';
        }
      }
      else if (/Linux/i.test(userAgent)) os = 'Linux';

      // Detect browser
      if (/Chrome/i.test(userAgent) && !/Chromium|Edge|Edg|OPR|Opera/i.test(userAgent)) {
        browser = 'Chrome';
      } else if (/Firefox/i.test(userAgent)) {
        browser = 'Firefox';
      } else if (/Safari/i.test(userAgent) && !/Chrome|Chromium|Edge|Edg|OPR|Opera/i.test(userAgent)) {
        browser = 'Safari';
      } else if (/Edge|Edg/i.test(userAgent)) {
        browser = 'Edge';
      } else if (/Opera|OPR/i.test(userAgent)) {
        browser = 'Opera';
      }

      setDeviceInfo({
        type: deviceType,
        name: deviceName,
        os,
        browser,
        fingerprint,
        isNewDevice
      });
    };

    detectDeviceInfo();
  }, []);

  return deviceInfo;
};

export default useDeviceInfo; 