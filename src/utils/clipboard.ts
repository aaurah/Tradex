/**
 * Bulletproof clipboard utility that works reliably across:
 * - Desktop browsers (Chrome, Firefox, Safari, Edge)
 * - Mobile webviews & iOS Safari
 * - Sandboxed iframes (e.g. AI Studio preview iframe, embedded widgets)
 * - Fallback to document.execCommand('copy') when navigator.clipboard is restricted
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  // 1. Try modern navigator.clipboard if available and allowed
  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('navigator.clipboard.writeText failed (likely iframe/permission restricted), trying fallback...', err);
    }
  }

  // 2. Robust fallback using a hidden textarea + execCommand('copy')
  if (typeof document !== 'undefined') {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      
      // Prevent scrolling to bottom of page in mobile Safari
      textarea.style.position = 'fixed';
      textarea.style.top = '0';
      textarea.style.left = '0';
      textarea.style.width = '2em';
      textarea.style.height = '2em';
      textarea.style.padding = '0';
      textarea.style.border = 'none';
      textarea.style.outline = 'none';
      textarea.style.boxShadow = 'none';
      textarea.style.background = 'transparent';
      textarea.style.opacity = '0';
      textarea.setAttribute('readonly', '');

      document.body.appendChild(textarea);
      
      // For iOS Safari compatibility
      if (navigator.userAgent.match(/ipad|ipod|iphone/i)) {
        const editable = textarea.contentEditable;
        const readOnly = textarea.readOnly;
        
        textarea.contentEditable = 'true';
        textarea.readOnly = false;
        
        const range = document.createRange();
        range.selectNodeContents(textarea);
        
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
        textarea.setSelectionRange(0, 999999);
        
        textarea.contentEditable = editable;
        textarea.readOnly = readOnly;
      } else {
        textarea.select();
      }

      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);

      if (successful) {
        return true;
      }
    } catch (fallbackErr) {
      console.error('document.execCommand fallback copy failed:', fallbackErr);
    }
  }

  return false;
}
