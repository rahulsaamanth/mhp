
/**
 * Safely gets the count of orders from an order array
 */
export function getOrderCount(orders: unknown): number {
  if (!orders) return 0;
  if (Array.isArray(orders)) return orders.length;
  return 0;
}

/**
 * Safely calculates the total amount spent from an orders array
 */
export function getTotalAmountSpent(orders: unknown): number {
  if (!orders || !Array.isArray(orders)) return 0;
  
  return orders.reduce((sum, order: any) => {
    // Check if order is an object and has totalAmountPaid as a number
    if (order && typeof order === 'object' && typeof order.totalAmountPaid === 'number') {
      return sum + order.totalAmountPaid;
    }
    return sum;
  }, 0);
}

/**
 * Format a number as currency (Rupees)
 */
export function formatCurrency(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}
