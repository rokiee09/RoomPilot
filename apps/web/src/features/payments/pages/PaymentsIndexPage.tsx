import { DataTable } from '#/components/data-table';
import { PageContainer } from '#/components/layout/page-container';
import { Button } from '#/components/ui/button';
import { Card, CardContent } from '#/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog';
import { Input } from '#/components/ui/input';
import { Label } from '#/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select';
import { env } from '#/config/env';
import { useQuery } from '@tanstack/react-query';
import { useReservations } from '#/features/reservations';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { paymentsColumns } from '../columns/payment.columns';
import { usePayments } from '../hooks/use-payments';
import type { Payment, PaymentStatus } from '../types';

const STATUS_OPTIONS: { value: PaymentStatus; label: string }[] = [
  { value: 'PENDING', label: 'Beklemede' },
  { value: 'COMPLETED', label: 'Tamamlandı' },
  { value: 'FAILED', label: 'Başarısız' },
  { value: 'REFUNDED', label: 'İade' },
];

const METHOD_OPTIONS = [
  { value: 'CREDIT_CARD', label: 'Kredi Kartı' },
  { value: 'CASH', label: 'Nakit' },
  { value: 'BANK_TRANSFER', label: 'Havale' },
  { value: 'STRIPE', label: 'Stripe' },
];

export default function PaymentsIndexPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [openCreate, setOpenCreate] = useState(false);
  const [createReservationId, setCreateReservationId] = useState('');
  const [createAmount, setCreateAmount] = useState('');
  const [createMethod, setCreateMethod] = useState('CASH');
  const [createStatus, setCreateStatus] = useState('PENDING');

  const { payments, meta, isLoading, createPayment, isCreating } = usePayments({
    page,
    perPage: 10,
    status: status as PaymentStatus | undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const { reservations: reservationList } = useReservations({
    perPage: 200,
    sortBy: 'dateTime',
    sortOrder: 'desc',
  });

  const handleCreate = async () => {
    const amount = parseFloat(createAmount);
    if (!createReservationId || !Number.isFinite(amount) || amount <= 0) {
      toast.error('Rezervasyon seçin ve geçerli tutar girin.');
      return;
    }
    try {
      await createPayment({
        reservationId: createReservationId,
        amount,
        currency: 'TRY',
        status: createStatus,
        paymentMethod: createMethod,
      });
      toast.success('Ödeme eklendi.');
      setOpenCreate(false);
      setCreateReservationId('');
      setCreateAmount('');
      setCreateMethod('CASH');
      setCreateStatus('PENDING');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Ödeme eklenemedi.');
    }
  };

  const columnsWithActions = useMemo(
    () => paymentsColumns,
    [],
  );

  return (
    <PageContainer>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Ödemeler</h1>
            <p className="text-muted-foreground">
              Rezervasyonlara ait ödemeleri listeleyin ve yeni ödeme ekleyin.
            </p>
          </div>
          <Button onClick={() => setOpenCreate(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Ödeme
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={status ?? 'all'} onValueChange={(v) => setStatus(v === 'all' ? undefined : v)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              {STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className="p-0">
            <DataTable
              columns={columnsWithActions}
              data={payments as Payment[]}
              isLoading={isLoading}
              manualPagination
              pageCount={meta.pageCount}
              pagination={{ pageIndex: page - 1, pageSize: 10 }}
              onPaginationChange={(updater) => {
                const next =
                  typeof updater === 'function' ? updater({ pageIndex: page - 1, pageSize: 10 }) : { pageIndex: 0, pageSize: 10 };
                setPage(next.pageIndex + 1);
              }}
            />
          </CardContent>
        </Card>
      </div>

      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Ödeme</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Rezervasyon</Label>
              <Select value={createReservationId} onValueChange={setCreateReservationId}>
                <SelectTrigger>
                  <SelectValue placeholder="Rezervasyon seçin" />
                </SelectTrigger>
                <SelectContent>
                  {(Array.isArray(reservationList) ? reservationList : []).map((r: any) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.customerName} · {r.entity?.name} · {r.dateTime ? new Date(r.dateTime).toLocaleDateString('tr-TR') : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Tutar (₺)</Label>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={createAmount}
                onChange={(e) => setCreateAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="grid gap-2">
              <Label>Ödeme yöntemi</Label>
              <Select value={createMethod} onValueChange={setCreateMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {METHOD_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Durum</Label>
              <Select value={createStatus} onValueChange={setCreateStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating ? 'Ekleniyor...' : 'Ödeme Ekle'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
