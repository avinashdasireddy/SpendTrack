/**
 * Triggers subtle haptic vibration on supported touch devices (smartphones/iOS/Android)
 */
export function triggerHaptic(type: 'light' | 'medium' | 'success' | 'warning' = 'light') {
  if (typeof window === 'undefined' || !('navigator' in window)) return;
  if (!navigator.vibrate) return;

  try {
    switch (type) {
      case 'light':
        navigator.vibrate(8);
        break;
      case 'medium':
        navigator.vibrate(15);
        break;
      case 'success':
        navigator.vibrate([10, 30, 15]);
        break;
      case 'warning':
        navigator.vibrate([20, 40, 20]);
        break;
      default:
        navigator.vibrate(10);
    }
  } catch (_) {
    // Graceful fallback for devices/browsers where vibrate is restricted
  }
}
