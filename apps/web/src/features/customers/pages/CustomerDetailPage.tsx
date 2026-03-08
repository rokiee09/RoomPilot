import { PageContainer } from '#/components/layout/page-container';
import { Badge } from '#/components/ui/badge';
import { Button } from '#/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table';
import { useNavigate, useParams } from '@tanstack/react-router';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import { useCustomer } from '../hooks';

export default function CustomerDetailPage() {
  const { id } = useParams({ from: '/_authenticated/customers/$id' });
  const navigate = useNavigate();
  const { data: customer, isLoading } = useCustomer(id);

  if (isLoading || !customer) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-48 text-muted-foreground">Yükleniyor...</div>
      </PageContainer>
    );
  }

  const reservations = (customer as any).reservations ?? [];

  return (
    <PageContainer>
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/customers' })}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Listeye dön
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Müşteri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Ad:</span> {customer.name}</p>
            <p><span className="text-muted-foreground">E-posta:</span> {customer.email ?? '-'}</p>
            <p><span className="text-muted-foreground">Telefon:</span> {customer.phone ?? '-'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Rezervasyon Geçmişi</CardTitle>
          </CardHeader>
          <CardContent>
            {reservations.length === 0 ? (
              <p className="text-muted-foreground text-sm">Henüz rezervasyon yok.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>İşletme</TableHead>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Kişi</TableHead>
                    <TableHead>Durum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservations.map((r: any) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.entity?.name ?? '-'}</TableCell>
                      <TableCell>{r.dateTime ? format(new Date(r.dateTime), 'dd.MM.yyyy HH:mm') : '-'}</TableCell>
                      <TableCell>{r.partySize}</TableCell>
                      <TableCell><Badge variant="secondary">{r.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
