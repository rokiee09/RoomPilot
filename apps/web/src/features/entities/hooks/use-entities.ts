import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { EntityFilters, EntityCreateInput, EntityUpdateInput } from '../types';
import { entitiesListQueryOptions, entityQueryOptions } from '../queries';
import { api } from '#/lib/api';

type ListResult = { data: any[]; meta: { total: number; page: number; perPage: number; pageCount: number } };

export function useEntities(filters?: EntityFilters) {
  const queryClient = useQueryClient();
  const { data, isLoading, isFetching } = useQuery({
    ...entitiesListQueryOptions(filters),
    queryKey: ['entities', filters],
  });

  const result = (data as ListResult) ?? { data: [], meta: { total: 0, page: 1, perPage: 20, pageCount: 0 } };
  const entities = result.data ?? [];
  const meta = result.meta ?? { total: 0, page: 1, perPage: 20, pageCount: 0 };

  const createMutation = useMutation({
    mutationFn: async (body: EntityCreateInput) => {
      const res = await (api as any).entities.post(body);
      if (res.error) throw new Error(res.error?.message ?? 'Failed to create');
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['entities'] }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, body }: { id: string; body: EntityUpdateInput }) => {
      const res = await (api as any).entities({ id }).put(body);
      if (res.error) throw new Error(res.error?.message ?? 'Failed to update');
      return res.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['entities'] });
      queryClient.invalidateQueries({ queryKey: ['entity', id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await (api as any).entities({ id }).delete();
      if (res.error) throw new Error(res.error?.message ?? 'Failed to delete');
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['entities'] }),
  });

  return {
    entities,
    meta,
    isLoading: isLoading || isFetching,
    createEntity: createMutation.mutateAsync,
    updateEntity: updateMutation.mutateAsync,
    deleteEntity: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useEntity(id: string | undefined) {
  return useQuery(entityQueryOptions(id ?? ''));
}
