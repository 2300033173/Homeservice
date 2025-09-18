// Cache busting script
(function() {
  // Clear all caches on page load
  if ('caches' in window) {
    caches.keys().then(function(names) {
      names.forEach(function(name) {
        caches.delete(name);
      });
    });
  }
  
  // Clear localStorage cache keys
  const cacheKeys = Object.keys(localStorage).filter(key => key.startsWith('cache_'));
  cacheKeys.forEach(key => localStorage.removeItem(key));
  
  // Force reload if needed
  if (performance.navigation.type === 1) {
    // Page was refreshed
    console.log('Page refreshed - cache cleared');
  }
})();