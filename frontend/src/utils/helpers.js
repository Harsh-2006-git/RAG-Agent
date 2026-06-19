import { format, formatDistanceToNow } from 'date-fns';

export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDate(dateString) {
  if (!dateString) return '';
  return format(new Date(dateString), 'MMM d, yyyy h:mm a');
}

export function formatRelativeTime(dateString) {
  if (!dateString) return '';
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
}
