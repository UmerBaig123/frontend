 
/**
 * Format a number as currency
 */
export const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  /**
   * Format a number as percentage
   */
  export const formatPercent = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value / 100);
  };
  
  /**
   * Format a number with commas
   */
  export const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('en-US').format(value);
  };
  
  /**
   * Format a date with specific format
   */
  export const formatDate = (date: Date, formatStr: string = 'MMM d, yyyy'): string => {
    // This is just a placeholder - we're using date-fns format in the components directly
    return date.toLocaleDateString();
  };
  
  /**
   * Truncate text to a specific length with ellipsis
   */
  export const truncateText = (text: string, maxLength: number = 50): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };
  