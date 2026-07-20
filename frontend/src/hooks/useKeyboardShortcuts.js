import { useEffect } from 'react';

export const useKeyboardShortcuts = (actions) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isCmdOrCtrl = isMac ? event.metaKey : event.ctrlKey;

      // Command Palette Toggle: Ctrl+K or Cmd+K
      if (isCmdOrCtrl && event.key === 'k') {
        event.preventDefault();
        if (actions.toggleCommandPalette) {
          actions.toggleCommandPalette();
        }
      }

      // Hide balance shortcut: Alt+H or Option+H
      if (event.altKey && event.key.toLowerCase() === 'h') {
        event.preventDefault();
        if (actions.togglePrivacyMode) {
          actions.togglePrivacyMode();
        }
      }

      // Navigate to pages quickly: Alt+D (Dashboard), Alt+G (Goals), Alt+C (AI Coach)
      if (event.altKey && event.key.toLowerCase() === 'd') {
        event.preventDefault();
        if (actions.goToDashboard) actions.goToDashboard();
      }
      if (event.altKey && event.key.toLowerCase() === 'g') {
        event.preventDefault();
        if (actions.goToGoals) actions.goToGoals();
      }
      if (event.altKey && event.key.toLowerCase() === 'c') {
        event.preventDefault();
        if (actions.goToAICoach) actions.goToAICoach();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [actions]);
};
