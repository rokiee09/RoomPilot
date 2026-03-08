import { PageContainer } from '#/components/layout/page-container';
import { Button } from '#/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card';
import { Input } from '#/components/ui/input';
import { Label } from '#/components/ui/label';
import { Link, useNavigate } from '@tanstack/react-router';
import { IconUser, IconMail, IconPhone } from '@tabler/icons-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useCustomers } from '../hooks';

export default function CustomerCreatePage() {
  const navigate = useNavigate();
  const { createCustomer, isCreating } = useCustomers();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Ad soyad zorunludur.');
      return;
    }
    try {
      await createCustomer({
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      toast.success('Müşteri eklendi.');
      navigate({ to: '/customers' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Müşteri eklenemedi.');
    }
  };

  return (
    <PageContainer>
      <div className="mx-auto max-w-xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Yeni Müşteri</h1>
          <p className="text-muted-foreground">
            Müşteri bilgilerini girin. Rezervasyon oluştururken bu müşteriyi seçebilirsiniz.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <IconUser className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">İletişim Bilgileri</CardTitle>
              </div>
              <CardDescription>Ad, e-posta ve telefon</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Ad Soyad *</Label>
                <div className="relative">
                  <IconUser className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="pl-9"
                    placeholder="Müşteri adı"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <div className="relative">
                  <IconMail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    placeholder="ornek@email.com"
                  />
                </div>
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
                    placeholder="+90 5XX XXX XX XX"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 flex gap-3">
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Ekleniyor...' : 'Müşteri Ekle'}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link to="/customers">İptal</Link>
            </Button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}
