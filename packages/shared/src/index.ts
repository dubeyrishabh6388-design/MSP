export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  PROVIDER = 'PROVIDER',
  ADMIN = 'ADMIN',
  SUPPORT_STAFF = 'SUPPORT_STAFF',
}

export enum BookingStatus {
  DRAFT = 'DRAFT',
  REQUESTED = 'REQUESTED',
  MATCHING = 'MATCHING',
  QUOTATIONS_RECEIVED = 'QUOTATIONS_RECEIVED',
  PROVIDER_SELECTED = 'PROVIDER_SELECTED',
  CONFIRMED = 'CONFIRMED',
  PROVIDER_EN_ROUTE = 'PROVIDER_EN_ROUTE',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETION_SUBMITTED = 'COMPLETION_SUBMITTED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DISPUTED = 'DISPUTED',
  REFUND_PENDING = 'REFUND_PENDING',
  REFUNDED = 'REFUNDED',
}

export enum ServiceWorkflowType {
  FIXED_PRICE = 'FIXED_PRICE',
  INSPECTION_FIRST = 'INSPECTION_FIRST',
  CUSTOM_QUOTATION = 'CUSTOM_QUOTATION',
  RECURRING = 'RECURRING',
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  IN_REVIEW = 'IN_REVIEW',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
}

export enum QuotationStatus {
  SUBMITTED = 'SUBMITTED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  AUTHORIZED = 'AUTHORIZED',
  CAPTURED = 'CAPTURED',
  REFUNDED = 'REFUNDED',
  FAILED = 'FAILED',
}

export enum ComplaintStatus {
  OPEN = 'OPEN',
  INVESTIGATING = 'INVESTIGATING',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum RewardCategory {
  SERVICE_STAR = 'SERVICE_STAR',
  CUSTOMER_FAVOURITE = 'CUSTOMER_FAVOURITE',
  RELIABILITY_CHAMPION = 'RELIABILITY_CHAMPION',
  RISING_STAR = 'RISING_STAR',
  CATEGORY_CHAMPION = 'CATEGORY_CHAMPION',
  LONG_TERM_EXCELLENCE = 'LONG_TERM_EXCELLENCE',
}

export enum ConsentStatus {
  GRANTED = 'GRANTED',
  WITHDRAWN = 'WITHDRAWN',
}

export interface QuotationItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number; // in minor units (paise/cents)
  total: number;
}

export interface CategoryFormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'date';
  required: boolean;
  options?: string[];
  placeholder?: string;
  helperText?: string;
}

export interface SubCategory {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  basePrice?: number | null;
  durationMin?: number | null;
  isActive: boolean;
  sortOrder: number;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  imageUrl?: string | null;
  workflowType: ServiceWorkflowType;
  basePrice?: number | null;
  inspectionFee?: number | null;
  commissionRate: number;
  isActive: boolean;
  sortOrder: number;
  fields?: CategoryFormField[];
  subCategories?: SubCategory[];
}

export const VALID_STATUS_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  [BookingStatus.DRAFT]: [BookingStatus.REQUESTED, BookingStatus.CANCELLED],
  [BookingStatus.REQUESTED]: [BookingStatus.MATCHING, BookingStatus.QUOTATIONS_RECEIVED, BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
  [BookingStatus.MATCHING]: [BookingStatus.QUOTATIONS_RECEIVED, BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
  [BookingStatus.QUOTATIONS_RECEIVED]: [BookingStatus.PROVIDER_SELECTED, BookingStatus.CANCELLED],
  [BookingStatus.PROVIDER_SELECTED]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
  [BookingStatus.CONFIRMED]: [BookingStatus.PROVIDER_EN_ROUTE, BookingStatus.IN_PROGRESS, BookingStatus.CANCELLED, BookingStatus.DISPUTED],
  [BookingStatus.PROVIDER_EN_ROUTE]: [BookingStatus.IN_PROGRESS, BookingStatus.CANCELLED, BookingStatus.DISPUTED],
  [BookingStatus.IN_PROGRESS]: [BookingStatus.COMPLETION_SUBMITTED, BookingStatus.DISPUTED],
  [BookingStatus.COMPLETION_SUBMITTED]: [BookingStatus.COMPLETED, BookingStatus.DISPUTED],
  [BookingStatus.COMPLETED]: [],
  [BookingStatus.CANCELLED]: [],
  [BookingStatus.DISPUTED]: [BookingStatus.REFUND_PENDING, BookingStatus.COMPLETED, BookingStatus.CANCELLED],
  [BookingStatus.REFUND_PENDING]: [BookingStatus.REFUNDED],
  [BookingStatus.REFUNDED]: [],
};
