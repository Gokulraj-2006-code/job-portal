export const formatDate = (date) => {
  if (!date) return 'N/A';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid date';
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return 'Invalid date';
  }
};

export const formatSalary = (min, max, currency = '₹') => {
  if (!min && !max) return 'Not specified';
  if (min && !max) return `${currency}${min.toLocaleString()}+`;
  if (!min && max) return `Up to ${currency}${max.toLocaleString()}`;
  return `${currency}${min.toLocaleString()} - ${currency}${max.toLocaleString()}`;
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(n => n.length > 0)
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const truncateText = (text, length = 100) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + '...';
};

export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};