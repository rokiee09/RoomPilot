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
import { Textarea } from '#/components/ui/textarea';
import { Checkbox } from '#/components/ui/checkbox';
import {
  IconBuilding,
  IconCash,
  IconChefHat,
  IconMapPin,
  IconPhone,
  IconStars,
  IconClock,
} from '@tabler/icons-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { env } from '#/config/env';
import type { EntityCreateInput, EntityStatus, EntityType } from '../types';

const getApiBase = () => env.apiUrl || (typeof window !== 'undefined' ? window.location.origin : '');

const AMENITY_OPTIONS = [
  'WiFi',
  'Havuz',
  'Spa',
  'Otopark',
  'Restoran',
  'Bar',
  'Çocuk kulübü',
  'Klima',
  'Jakuzi',
  'Fitness',
  'Deniz manzara',
  'Oda servisi',
] as const;

const DAY_KEYS = ['0', '1', '2', '3', '4', '5', '6'] as const;
const DAY_NAMES: Record<string, string> = {
  '0': 'Pazar',
  '1': 'Pazartesi',
  '2': 'Salı',
  '3': 'Çarşamba',
  '4': 'Perşembe',
  '5': 'Cuma',
  '6': 'Cumartesi',
};

type Props = {
  defaultValues?: Partial<EntityCreateInput> & { status?: EntityStatus };
  onSubmit: (data: EntityCreateInput) => void;
  isLoading?: boolean;
  submitLabel?: string;
};

export function EntityForm({
  defaultValues,
  onSubmit,
  isLoading,
  submitLabel = 'Kaydet',
}: Props) {
  const [type, setType] = useState<EntityType>(defaultValues?.type ?? 'HOTEL');
  const [name, setName] = useState(defaultValues?.name ?? '');
  const [description, setDescription] = useState(defaultValues?.description ?? '');
  const [city, setCity] = useState(defaultValues?.city ?? '');
  const [status, setStatus] = useState<EntityStatus>(defaultValues?.status ?? 'DRAFT');
  const [siteId, setSiteId] = useState<string | null>((defaultValues as { siteId?: string | null })?.siteId ?? null);

  const { data: sites = [] } = useQuery({
    queryKey: ['sites'],
    queryFn: async () => {
      const res = await fetch(`${getApiBase()}/sites`, { credentials: 'include' });
      if (!res.ok) return [];
      const list = await res.json();
      return list as { id: string; name: string; slug: string }[];
    },
  });
  const [address, setAddress] = useState(defaultValues?.address ?? '');
  const [phone, setPhone] = useState(defaultValues?.phone ?? '');
  const [roomCount, setRoomCount] = useState(defaultValues?.roomCount ?? '');
  const [capacity, setCapacity] = useState(defaultValues?.capacity ?? '');
  const [starRating, setStarRating] = useState(defaultValues?.starRating ?? '');
  const [cuisineType, setCuisineType] = useState(defaultValues?.cuisineType ?? '');
  const [expenseInfo, setExpenseInfo] = useState(defaultValues?.expenseInfo ?? '');
  const [kitchenInfo, setKitchenInfo] = useState(defaultValues?.kitchenInfo ?? '');
  const [amenities, setAmenities] = useState<string[]>(defaultValues?.amenities ?? []);
  const [workingHours, setWorkingHours] = useState<Record<string, { open: string; close: string } | null>>(() => {
    const wh = defaultValues?.workingHours ?? {};
    const out: Record<string, { open: string; close: string } | null> = {};
    DAY_KEYS.forEach((d) => {
      out[d] = wh[d] ?? { open: '09:00', close: '22:00' };
    });
    return out;
  });

  const toggleAmenity = (value: string) => {
    setAmenities((prev) =>
      prev.includes(value) ? prev.filter((a) => a !== value) : [...prev, value]
    );
  };

  const setDayHours = (day: string, closed: boolean, open?: string, close?: string) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: closed ? null : { open: open ?? prev[day]?.open ?? '09:00', close: close ?? prev[day]?.close ?? '22:00' },
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({
      type,
      name,
      description: description || undefined,
      city,
      status,
      siteId: siteId || undefined,
      address: address || undefined,
      phone: phone || undefined,
      roomCount: roomCount === '' ? undefined : Number(roomCount),
      capacity: capacity === '' ? undefined : Number(capacity),
      starRating: starRating === '' ? undefined : Number(starRating),
      cuisineType: cuisineType || undefined,
      expenseInfo: expenseInfo || undefined,
      kitchenInfo: kitchenInfo || undefined,
      amenities: amenities.length ? amenities : undefined,
      workingHours,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Genel Bilgiler */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <IconBuilding className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Genel Bilgiler</CardTitle>
          </div>
          <CardDescription>İşletme türü, adı ve konum</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type">Tür</Label>
              <Select value={type} onValueChange={(v) => setType(v as EntityType)}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Tür seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HOTEL">Otel</SelectItem>
                  <SelectItem value="RESTAURANT">Restoran</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Yayın Durumu</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as EntityStatus)}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Taslak</SelectItem>
                  <SelectItem value="PUBLISHED">Yayında</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">İşletme Adı</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Örn. Grand Otel"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Kısa tanıtım metni"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Şehir</Label>
            <Input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              placeholder="Örn. İstanbul"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="siteId">Ana site / Bölge (otel zinciri)</Label>
            <Select value={siteId ?? 'none'} onValueChange={(v) => setSiteId(v === 'none' ? null : v)}>
              <SelectTrigger id="siteId">
                <SelectValue placeholder="Bölge seçin (opsiyonel)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Yok</SelectItem>
                {sites.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} ({s.slug})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">İstanbul, Antalya, İzmir gibi bölge gruplaması</p>
          </div>
        </CardContent>
      </Card>

      {/* İletişim & Adres */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <IconMapPin className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">İletişim & Adres</CardTitle>
          </div>
          <CardDescription>Adres ve telefon bilgileri</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Adres</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Tam adres"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <div className="relative">
              <IconPhone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-9"
                placeholder="+90 212 000 00 00"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Otel / Restoran Durumu */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <IconBuilding className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Otel / Restoran Durumu</CardTitle>
          </div>
          <CardDescription>
            {type === 'HOTEL' ? 'Oda sayısı ve yıldız' : 'Kapasite ve mutfak türü'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {type === 'HOTEL' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="roomCount">Oda Sayısı</Label>
                  <Input
                    id="roomCount"
                    type="number"
                    min={0}
                    value={roomCount}
                    onChange={(e) => setRoomCount(e.target.value)}
                    placeholder="Örn. 50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="starRating">Yıldız (1-5)</Label>
                  <Select value={starRating} onValueChange={setStarRating}>
                    <SelectTrigger id="starRating">
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n} yıldız
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            {type === 'RESTAURANT' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Kapasite (kişi)</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min={0}
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="Örn. 80"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cuisineType">Mutfak Türü</Label>
                  <Input
                    id="cuisineType"
                    value={cuisineType}
                    onChange={(e) => setCuisineType(e.target.value)}
                    placeholder="Örn. Türk, Akdeniz"
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Gider & Mutfak Bilgileri */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <IconCash className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Gider Bilgileri</CardTitle>
          </div>
          <CardDescription>Aylık giderler, maliyet notları (isteğe bağlı)</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            id="expenseInfo"
            value={expenseInfo}
            onChange={(e) => setExpenseInfo(e.target.value)}
            rows={4}
            placeholder="Elektrik, personel, kira, vb. notlar..."
            className="resize-none"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <IconChefHat className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Mutfak / Operasyon Bilgileri</CardTitle>
          </div>
          <CardDescription>Mutfak kapasitesi, menü notları (isteğe bağlı)</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            id="kitchenInfo"
            value={kitchenInfo}
            onChange={(e) => setKitchenInfo(e.target.value)}
            rows={4}
            placeholder="Mutfak detayları, ekipman, özel notlar..."
            className="resize-none"
          />
        </CardContent>
      </Card>

      {/* Olanaklar */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <IconStars className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Olanaklar</CardTitle>
          </div>
          <CardDescription>İşletmeye ait özellikler (WiFi, havuz, spa vb.)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {AMENITY_OPTIONS.map((opt) => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={amenities.includes(opt)}
                  onCheckedChange={() => toggleAmenity(opt)}
                />
                <span className="text-sm">{opt}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Çalışma saatleri */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <IconClock className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Çalışma Saatleri</CardTitle>
          </div>
          <CardDescription>Haftalık açılış ve kapanış saatleri</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {DAY_KEYS.map((day) => {
            const closed = workingHours[day] === null;
            return (
              <div key={day} className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
                <span className="w-24 text-sm font-medium">{DAY_NAMES[day]}</span>
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={closed}
                    onCheckedChange={(c) => setDayHours(day, !!c)}
                  />
                  <span className="text-sm text-muted-foreground">Kapalı</span>
                </label>
                {!closed && (
                  <>
                    <Input
                      type="time"
                      value={workingHours[day]?.open ?? '09:00'}
                      onChange={(e) => setDayHours(day, false, e.target.value, workingHours[day]?.close)}
                      className="w-28"
                    />
                    <span className="text-muted-foreground">–</span>
                    <Input
                      type="time"
                      value={workingHours[day]?.close ?? '22:00'}
                      onChange={(e) => setDayHours(day, false, workingHours[day]?.open, e.target.value)}
                      className="w-28"
                    />
                  </>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Kaydediliyor...' : submitLabel}
      </Button>
    </form>
  );
}
