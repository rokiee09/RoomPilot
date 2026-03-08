import { PageContainer } from '#/components/layout/page-container';
import { useNavigate, useParams } from '@tanstack/react-router';
import { env } from '#/config/env';
import { useQuery } from '@tanstack/react-query';
import {
  CampaignsSection,
  EntityForm,
  EntityFinancialsChart,
  EntityImagesSection,
  EquipmentSection,
  ExpensesSection,
  RoomTypesSection,
  RoomsSection,
  StaffSection,
  StockSection,
} from '../components';
import { useEntity, useEntities } from '../hooks';
import type { EntityUpdateInput } from '../types';

const getApiBase = () => env.apiUrl || (typeof window !== 'undefined' ? window.location.origin : '');

export default function EntityEditPage() {
  const { id } = useParams({ from: '/_authenticated/entities/$id' });
  const navigate = useNavigate();
  const { data: entity, isLoading } = useEntity(id);
  const { updateEntity, isUpdating } = useEntities({});

  const { data: staffList = [] } = useQuery({
    queryKey: ['entity', id, 'staff'],
    queryFn: async () => {
      const res = await fetch(`${getApiBase()}/entities/${id}/staff`, { credentials: 'include' });
      if (!res.ok) return [];
      return res.json() as Promise<Array<{ id: string; name: string; role: string }>>;
    },
    enabled: !!id,
  });

  const handleSubmit = async (data: EntityUpdateInput) => {
    if (!id) return;
    await updateEntity({ id, body: data });
    navigate({ to: '/entities' });
  };

  if (isLoading || !entity) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-48 text-muted-foreground">Yükleniyor...</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">{entity.name}</h1>
            <p className="text-muted-foreground">
              {entity.type === 'HOTEL' ? 'Otel' : 'Restoran'} · {entity.city}
              {entity.site?.name && ` · ${entity.site.name}`}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{staffList.length} çalışan</span>
            <span>·</span>
            <span>{entity.type === 'HOTEL' && entity.roomCount ? `${entity.roomCount} oda` : entity.type === 'RESTAURANT' && entity.capacity ? `${entity.capacity} kapasite` : ''}</span>
          </div>
        </div>

        <EntityFinancialsChart entityId={id!} />

        <EntityForm
          defaultValues={{
            type: entity.type,
            name: entity.name,
            description: entity.description ?? undefined,
            city: entity.city,
            status: entity.status,
            siteId: entity.siteId ?? undefined,
            address: entity.address ?? undefined,
            phone: entity.phone ?? undefined,
            roomCount: entity.roomCount ?? undefined,
            capacity: entity.capacity ?? undefined,
            starRating: entity.starRating ?? undefined,
            cuisineType: entity.cuisineType ?? undefined,
            expenseInfo: entity.expenseInfo ?? undefined,
            kitchenInfo: entity.kitchenInfo ?? undefined,
            amenities: entity.amenities ?? undefined,
            workingHours: entity.workingHours ?? undefined,
          }}
          onSubmit={handleSubmit as (data: any) => void}
          isLoading={isUpdating}
          submitLabel="Güncelle"
        />
        <RoomTypesSection entityId={id!} />
        <RoomsSection entityId={id!} />
        <StaffSection entityId={id!} entityType={entity.type} />
        <CampaignsSection entityId={id!} />
        <ExpensesSection entityId={id!} />
        <EquipmentSection entityId={id!} />
        {entity.type === 'RESTAURANT' && <StockSection entityId={id!} />}
        <EntityImagesSection entityId={id!} />
      </div>
    </PageContainer>
  );
}
