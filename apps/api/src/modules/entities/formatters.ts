import type { Entity } from '@onlyjs/db/client';

type EntityWithSite = Entity & { site?: { id: string; name: string; slug: string } | null };

export abstract class EntityFormatter {
  static response(entity: EntityWithSite) {
    return {
      id: entity.id,
      type: entity.type,
      name: entity.name,
      description: entity.description,
      city: entity.city,
      status: entity.status,
      siteId: entity.siteId ?? null,
      site: entity.site ?? null,
      address: entity.address ?? null,
      phone: entity.phone ?? null,
      roomCount: entity.roomCount ?? null,
      capacity: entity.capacity ?? null,
      starRating: entity.starRating ?? null,
      cuisineType: entity.cuisineType ?? null,
      expenseInfo: entity.expenseInfo ?? null,
      kitchenInfo: entity.kitchenInfo ?? null,
      amenities: (entity as { amenities?: string[] }).amenities ?? [],
      workingHours: (entity as { workingHours?: unknown }).workingHours ?? null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
