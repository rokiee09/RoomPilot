export type EntityType = 'HOTEL' | 'RESTAURANT';
export type EntityStatus = 'DRAFT' | 'PUBLISHED';

export type WorkingHoursDay = { open: string; close: string } | null;
export type WorkingHours = Record<string, WorkingHoursDay>;

export type EntityCreatePayload = {
  type: EntityType;
  name: string;
  description?: string;
  city: string;
  status?: EntityStatus;
  siteId?: string;
  address?: string;
  phone?: string;
  roomCount?: number;
  capacity?: number;
  starRating?: number;
  cuisineType?: string;
  expenseInfo?: string;
  kitchenInfo?: string;
  amenities?: string[];
  workingHours?: WorkingHours;
};

export type EntityUpdatePayload = Partial<{
  type: EntityType;
  name: string;
  description: string;
  city: string;
  status: EntityStatus;
  siteId: string | null;
  address: string;
  phone: string;
  roomCount: number;
  capacity: number;
  starRating: number;
  cuisineType: string;
  expenseInfo: string;
  kitchenInfo: string;
  amenities: string[];
  workingHours: WorkingHours;
}>;
