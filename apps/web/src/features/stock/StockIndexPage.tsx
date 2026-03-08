import { PageContainer } from '#/components/layout/page-container';
import { Button } from '#/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card';
import { useEntities } from '#/features/entities';
import { useNavigate } from '@tanstack/react-router';
import { IconPackage, IconArrowRight } from '@tabler/icons-react';

export default function StockIndexPage() {
  const navigate = useNavigate();
  const { entities, isLoading } = useEntities({
    perPage: 200,
    type: 'RESTAURANT',
  });

  const restaurants = entities.filter((e) => e.type === 'RESTAURANT');

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Stok / Envanter Takibi</h1>
          <p className="text-muted-foreground">
            Restoran işletmelerinizin malzeme ve ürün stoklarını yönetin. Her restoran için stok kalemlerini ekleyip
            güncelleyebilirsiniz.
          </p>
        </div>
        {isLoading ? (
          <p className="text-muted-foreground">Yükleniyor...</p>
        ) : restaurants.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-muted-foreground text-center">
                Henüz restoran türünde işletme yok. Stok takibi için önce{' '}
                <Button variant="link" className="p-0 h-auto" onClick={() => navigate({ to: '/entities/create' })}>
                  bir restoran ekleyin
                </Button>
                .
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((entity) => (
              <Card
                key={entity.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => navigate({ to: '/entities/$id', params: { id: entity.id }, hash: 'stock-section' })}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-2">
                    <IconPackage className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-base">{entity.name}</CardTitle>
                  </div>
                  <Button variant="ghost" size="icon">
                    <IconArrowRight className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <CardDescription>{entity.city}</CardDescription>
                  <p className="text-sm text-muted-foreground mt-1">
                    Stok yönetimine gitmek için tıklayın
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
