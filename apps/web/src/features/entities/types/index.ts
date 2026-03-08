export type EntityType = 'HOTEL' | 'RESTAURANT';
export type EntityStatus = 'DRAFT' | 'PUBLISHED';

export type Entity = {
  id: string;
  type: EntityType;
  name: string;
  description: string | null;
  city: string;
  status: EntityStatus;
  siteId: string | null;
  site?: { id: string; name: string; slug: string } | null;
  address: string | null;
  phone: string | null;
  roomCount: number | null;
  capacity: number | null;
  starRating: number | null;
  cuisineType: string | null;
  expenseInfo: string | null;
  kitchenInfo: string | null;
  amenities: string[];
  workingHours: Record<string, { open: string; close: string } | null> | null;
  createdAt: string;
  updatedAt: string;
};

export type EntityFilters = {
  page?: number;
  perPage?: number;
  search?: string;
  city?: string;
  status?: EntityStatus;
  type?: EntityType;
  siteId?: string;
  sortBy?: 'name' | 'city' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
};

export type EntityCreateInput = {
  type: EntityType;
  name: string;
  description?: string;
  city: string;
  status?: EntityStatus;
  siteId?: string | null;
  address?: string;
  phone?: string;
  roomCount?: number;
  capacity?: number;
  starRating?: number;
  cuisineType?: string;
  expenseInfo?: string;
  kitchenInfo?: string;
  amenities?: string[];
  workingHours?: Record<string, { open: string; close: string } | null>;
};

export type EntityUpdateInput = Partial<EntityCreateInput>;
