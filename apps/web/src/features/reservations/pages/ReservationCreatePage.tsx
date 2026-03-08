import { PageContainer } from '#/components/layout/page-container';
import { Button } from '#/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card';
import { Input } from '#/components/ui/input';
import { Label } from '#/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select';
import { useNavigate } from '@tanstack/react-router';
import { IconCalendarEvent, IconUser } from '@tabler/icons-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useEntities } from '#/features/entities';
import { useReservations } from '../hooks';

export default function ReservationCreatePage() {
  const navigate = useNavigate();
  const { entities, isLoading: entitiesLoading } = useEntities({ perPage: 200 });
  const { createReservation, isCreating } = useReservations();

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [entityId, setEntityId] = useState('');
  const [datePart, setDatePart] = useState('');
  const [timePart, setTimePart] = useState('');
  const [partySize, setPartySize] = useState('2');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entityId || !customerName.trim()) {
      toast.error('İşletme ve müşteri adı zorunludur.');
      return;
    }
    const dateTime = datePart && timePart ? `${datePart}T${timePart}:00` : null;
    if (!dateTime) {
      toast.error('Tarih ve saat seçin.');
      return;
    }
    try {
      await createReservation({
        entityId,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        dateTime,
        partySize: Math.max(1, parseInt(partySize, 10) || 1),
      });
      toast.success('Rezervasyon oluşturuldu.');
      navigate({ to: '/reservations' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Rezervasyon oluşturulamadı.');
    }
  };

  return (
    <PageContainer>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Yeni Rezervasyon</h1>
          <p className="text-muted-foreground">
            Müşteri bilgilerini ve rezervasyon detaylarını girin.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Müşteri Bilgileri */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <IconUser className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Müşteri Bilgileri</CardTitle>
              </div>
              <CardDescription>Rezervasyonu yapacak kişinin iletişim bilgileri</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Ad Soyad *</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  placeholder="Müşteri adı"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="customerEmail">E-posta</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="ornek@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Telefon</Label>
                  <Input
                    id="customerPhone"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+90 5XX XXX XX XX"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rezervasyon Detayı */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <IconCalendarEvent className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Rezervasyon Detayı</CardTitle>
              </div>
              <CardDescription>İşletme, tarih ve kişi sayısı</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="entityId">İşletme (Otel / Restoran) *</Label>
                <Select value={entityId} onValueChange={setEntityId} required>
                  <SelectTrigger id="entityId">
                    <SelectValue placeholder="İşletme seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {entitiesLoading ? (
                      <SelectItem value="_" disabled>Yükleniyor...</SelectItem>
                    ) : (
                      (entities ?? []).map((e: { id: string; name: string; type: string; city: string }) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.name} ({e.type === 'HOTEL' ? 'Otel' : 'Restoran'} · {e.city})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="datePart">Tarih *</Label>
                  <Input
                    id="datePart"
                    type="date"
                    value={datePart}
                    onChange={(e) => setDatePart(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timePart">Saat *</Label>
                  <Input
                    id="timePart"
                    type="time"
                    value={timePart}
                    onChange={(e) => setTimePart(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="partySize">Kişi Sayısı</Label>
                <Input
                  id="partySize"
                  type="number"
                  min={1}
                  value={partySize}
                  onChange={(e) => setPartySize(e.target.value)}
                  placeholder="2"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Oluşturuluyor...' : 'Rezervasyon Oluştur'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: '/reservations' })}
            >
              İptal
            </Button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}
