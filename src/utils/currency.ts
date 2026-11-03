export const CURRENCY = 'R';

export const formatPrice = (amount: number): string => {
  return `R${amount.toFixed(2)}`;
};
