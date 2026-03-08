import { PageContainer } from '#/components/layout/page-container';
import { useNavigate } from '@tanstack/react-router';
import { useEntities } from '../hooks';
import { EntityForm } from '../components/EntityForm';
import type { EntityCreateInput } from '../types';

export default function EntityCreatePage() {
  const navigate = useNavigate();
  const { createEntity, isCreating } = useEntities({});

  const handleSubmit = async (data: EntityCreateInput) => {
    await createEntity(data);
    navigate({ to: '/entities' });
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Yeni İşletme</h1>
          <p className="text-muted-foreground">Otel veya restoran ekleyin.</p>
        </div>
        <EntityForm onSubmit={handleSubmit} isLoading={isCreating} submitLabel="Oluştur" />
      </div>
    </PageContainer>
  );
}
