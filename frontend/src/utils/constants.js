export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Arsalan Portfolio';
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';
export const DEFAULT_LANGUAGE = process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || 'en';

export const SKILL_OPTIONS = ['beginner', 'intermediate', 'expert'];
export const ITEM_TYPES = ['projects', 'services'];
export const ORDER_STATUS = ['sent', 'not sent'];
export const PAYMENT_STATUS = ['paid', 'not paid'];

export const RATING_LABELS = {
  1: 'Very Poor',
  2: 'Poor',
  3: 'Average',
  4: 'Good',
  5: 'Excellent'
};
