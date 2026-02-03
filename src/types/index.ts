// Common types and re-exports

export * from './database';
export * from './api';

// Navigation types
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  children?: NavItem[];
  badge?: string | number;
}

// Table types
export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
  className?: string;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'date' | 'file';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

// Filter types
export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'multi-select' | 'date-range' | 'search';
  options?: FilterOption[];
}

// Toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

// Modal types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Tab types
export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content?: React.ReactNode;
  disabled?: boolean;
}
