export const STORE_ROLES = ["owner", "employee"] as const;
export type StoreRole = (typeof STORE_ROLES)[number];

export const STOCK_MOVEMENT_TYPES = ["purchase", "adjustment", "sale", "return"] as const;
export type StockMovementType = (typeof STOCK_MOVEMENT_TYPES)[number];

export const ORDER_REQUEST_STATUSES = ["pending", "contacted", "confirmed", "cancelled"] as const;
export type OrderRequestStatus = (typeof ORDER_REQUEST_STATUSES)[number];

export const DEFAULT_LOW_STOCK_THRESHOLD = 5;
