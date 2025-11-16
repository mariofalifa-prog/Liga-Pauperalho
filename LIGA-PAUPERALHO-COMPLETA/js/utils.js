// Utility Functions for Liga Pauperalho
class Utils {
  // Generate UUID v4
  static generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Simple password hashing (for demo purposes)
  static hashPassword(password) {
    let hash = 0;
    if (password.length === 0) return hash.toString();
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString();
  }

  // Validate email format
  static validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // Validate password strength
  static validatePassword(password) {
    if (!password) return { valid: false, message: 'Senha é obrigatória' };
    if (password.length < 8) return { valid: false, message: 'Senha deve ter pelo menos 8 caracteres' };
    if (!/[A-Z]/.test(password)) return { valid: false, message: 'Senha deve ter pelo menos uma letra maiúscula' };
    if (!/[a-z]/.test(password)) return { valid: false, message: 'Senha deve ter pelo menos uma letra minúscula' };
    if (!/[0-9]/.test(password)) return { valid: false, message: 'Senha deve ter pelo menos um número' };
    return { valid: true };
  }

  // Format date to Portuguese
  static formatDate(date) {
    const options = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(date).toLocaleString('pt-BR', options);
  }

  // Format date only (no time)
  static formatDateOnly(date) {
    const options = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    };
    return new Date(date).toLocaleString('pt-BR', options);
  }

  // Format date time (alias for formatDate)
  static formatDateTime(date) {
    return this.formatDate(date);
  }

  // Get month name in Portuguese
  static getMonthName(month) {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[month] || 'Mês';
  }

  // Get current date at start of day
  static getStartOfDay(date = new Date()) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  // Get current date at end of day
  static getEndOfDay(date = new Date()) {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  // Get first day of month
  static getFirstDayOfMonth(date = new Date()) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  // Get last day of month
  static getLastDayOfMonth(date = new Date()) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  }

  // Check if date is in range
  static isDateInRange(date, startDate, endDate) {
    const checkDate = new Date(date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return checkDate >= start && checkDate <= end;
  }

  // Deep clone object
  static deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => this.deepClone(item));
    if (typeof obj === 'object') {
      const cloned = {};
      Object.keys(obj).forEach(key => {
        cloned[key] = this.deepClone(obj[key]);
      });
      return cloned;
    }
  }

  // Debounce function
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Throttle function
  static throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Escape HTML to prevent XSS
  static escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Sanitize user input
  static sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    return input.trim().replace(/[<>]/g, '');
  }

  // Format file size
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Calculate percentage
  static calculatePercentage(value, total, decimals = 1) {
    if (total === 0) return 0;
    return ((value / total) * 100).toFixed(decimals);
  }

  // Generate random color
  static generateRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  // Get color for deck archetype (consistent colors)
  static getDeckColor(archetype) {
    const colorMap = {
      'Mono Blue Terror': '#1e88e5',
      'Mono Red Burn': '#e53935',
      'Mono Black Control': '#43a047',
      'Mono Green Stompy': '#7cb342',
      'Mono White Weenie': '#fb8c00',
      'Boros Monarch': '#fdd835',
      'Izzet Faeries': '#8e24aa',
      'Dimir Control': '#3949ab',
      'Golgari Midrange': '#689f38',
      'Azorius Affinity': '#039be5',
      'Rakdos Goblins': '#d32f2f',
      'Simic Merfolk': '#00897b',
      'Orzhov Midrange': '#f57c00',
      'Jeskai Spells': '#fb8c00',
      'Sultai Reanimator': '#2e7d32',
      '4-Color Control': '#455a64',
      '5-Color Good Stuff': '#6a1b9a'
    };
    return colorMap[archetype] || '#757575';
  }

  // Download data as file
  static downloadFile(data, filename, type = 'application/json') {
    const blob = new Blob([data], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  // Parse CSV string to JSON
  static parseCSV(csv) {
    const lines = csv.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const result = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;

      const values = lines[i].split(',').map(v => v.trim());
      const obj = {};

      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });

      result.push(obj);
    }

    return result;
  }

  // Convert JSON to CSV
  static convertToCSV(data) {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');

    const csvRows = data.map(row => {
      return headers.map(header => {
        const value = row[header] || '';
        return `"${value.toString().replace(/"/g, '""')}"`;
      }).join(',');
    });

    return [csvHeaders, ...csvRows].join('\n');
  }

  // Check if mobile device
  static isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  // Get viewport width
  static getViewportWidth() {
    return Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
  }

  // Get viewport height
  static getViewportHeight() {
    return Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
  }

  // Copy to clipboard
  static async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
      } catch (err) {
        document.body.removeChild(textArea);
        return false;
      }
    }
  }

  // Local storage helpers
  static setLocalStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  }

  static getLocalStorage(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  }

  static removeLocalStorage(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  }

  static clearLocalStorage() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }

  // Get localStorage usage
  static getLocalStorageUsage() {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return {
      used: total,
      usedFormatted: this.formatFileSize(total),
      available: 5 * 1024 * 1024 - total, // 5MB typical limit
      availableFormatted: this.formatFileSize(5 * 1024 * 1024 - total)
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Utils;
}