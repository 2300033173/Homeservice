// Performance optimization utilities

// Cache management
export const CacheManager = {
  set: (key, data, ttl = 300000) => { // 5 minutes default
    try {
      const item = {
        data,
        timestamp: Date.now(),
        ttl
      };
      localStorage.setItem(key, JSON.stringify(item));
    } catch (e) {
      // Clear old cache if storage is full
      CacheManager.clearExpired();
      try {
        const newItem = {
          data,
          timestamp: Date.now(),
          ttl
        };
        localStorage.setItem(key, JSON.stringify(newItem));
      } catch (e2) {
        console.warn('Cache storage failed:', e2);
      }
    }
  },

  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      
      const parsed = JSON.parse(item);
      if (Date.now() - parsed.timestamp > parsed.ttl) {
        localStorage.removeItem(key);
        return null;
      }
      
      return parsed.data;
    } catch (e) {
      localStorage.removeItem(key);
      return null;
    }
  },

  clearExpired: () => {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      try {
        const item = localStorage.getItem(key);
        if (item) {
          const parsed = JSON.parse(item);
          if (parsed.timestamp && Date.now() - parsed.timestamp > parsed.ttl) {
            localStorage.removeItem(key);
          }
        }
      } catch (e) {
        localStorage.removeItem(key);
      }
    });
  },

  clear: (prefix = '') => {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(prefix)) {
        localStorage.removeItem(key);
      }
    });
  }
};

// Debounce utility
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle utility
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Lazy loading utility
export const lazyLoad = (target, callback, options = {}) => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        callback(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, ...options });

  if (target) {
    observer.observe(target);
  }

  return observer;
};

// Preload resources
export const preloadResource = (url, type = 'fetch') => {
  if (type === 'image') {
    const img = new Image();
    img.src = url;
  } else if (type === 'fetch') {
    fetch(url, { method: 'HEAD' }).catch(() => {});
  }
};

// Bundle size optimization
export const compressData = (data) => {
  try {
    return JSON.stringify(data);
  } catch (e) {
    return data;
  }
};

// Memory cleanup
export const cleanup = () => {
  // Clear expired cache
  CacheManager.clearExpired();
  
  // Force garbage collection if available
  if (window.gc) {
    window.gc();
  }
};

// Performance monitoring
export const performanceMonitor = {
  mark: (name) => {
    if (performance.mark) {
      performance.mark(name);
    }
  },
  
  measure: (name, startMark, endMark) => {
    if (performance.measure) {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name)[0];
      return measure ? measure.duration : 0;
    }
    return 0;
  },
  
  clearMarks: () => {
    if (performance.clearMarks) {
      performance.clearMarks();
    }
  }
};