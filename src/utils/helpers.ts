import { Product } from '../types';

export function formatPKR(val: number): string {
  return 'Rs. ' + Math.round(val || 0).toLocaleString('en-PK');
}

export function timeAgo(timestamp: number | string | undefined): string {
  if (!timestamp) return 'Just now';
  const ts = typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp;
  if (Number.isNaN(ts)) return 'Just now';
  const diff = Date.now() - ts;
  const sec = Math.floor(diff / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);

  if (sec < 60) return 'Just now';
  if (min < 60) return `${min}m ago`;
  if (hr < 24) return `${hr}h ago`;
  if (day < 7) return `${day}d ago`;
  return new Date(ts).toLocaleDateString('en-PK', { day: '2-digit', month: 'short' });
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback below
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return true;
  } catch {
    return false;
  }
}

export function filterProductsByTag(products: Product[], filter: string): Product[] {
  if (!filter || filter.toLowerCase() === 'all') return products;
  const f = filter.toLowerCase().trim();
  switch (f) {
    case 'headphone':
      return products.filter(
        (p) => /headphone|earbud|audio|sound/i.test(p.name) || p.category.toLowerCase() === 'audio'
      );
    case 'watch':
      return products.filter(
        (p) => /watch|smartwatch|band/i.test(p.name) || p.category.toLowerCase() === 'wearables'
      );
    case 'shoe':
      return products.filter(
        (p) => /shoe|sneaker|loafer|boot/i.test(p.name) || p.category.toLowerCase() === 'footwear'
      );
    case 'glasses':
      return products.filter(
        (p) => /glass|sunglass|eyewear/i.test(p.name) || p.category.toLowerCase() === 'accessories'
      );
    default:
      return products.filter(
        (p) => p.category.toLowerCase().includes(f) || p.name.toLowerCase().includes(f)
      );
  }
}
