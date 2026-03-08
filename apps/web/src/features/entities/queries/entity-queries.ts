import { api } from '#/lib/api';
import { queryOptions } from '@tanstack/react-query';
import type { Entity, EntityFilters } from '../types';

type PaginatedResponse = { data: Entity[]; meta: { total: number; page: number; perPage: number; pageCount: number } };

export const entitiesListQueryOptions = (filters?: EntityFilters) =>
  queryOptions({
    queryKey: ['entities', filters],
    queryFn: async () => {
      const response = await (api as any).entities.get({ query: filters || {} });
      if (response.error) throw new Error('Failed to fetch entities');
      return (response.data as PaginatedResponse) ?? { data: [], meta: { total: 0, page: 1, perPage: 20, pageCount: 0 } };
    },
  });

export const entityQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ['entity', id],
    queryFn: async () => {
      const response = await (api as any).entities({ id }).get();
      if (response.error) throw new Error('Failed to fetch entity');
      return response.data as Entity;
    },
    enabled: !!id,
  });
