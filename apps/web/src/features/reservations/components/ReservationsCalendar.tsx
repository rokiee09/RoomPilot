import { Button } from '#/components/ui/button';
import { Card, CardContent } from '#/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from 'date-fns';
import { tr } from 'date-fns/locale';
import type { Reservation } from '../types';

const WEEKDAYS = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

/** Oda durumu etiketleri (takvim ve modal için) */
export const ROOM_STATUS_LABELS: Record<string, string> = {
  AVAILABLE_CLEAN: 'Temiz',
  AVAILABLE_DIRTY: 'Kirli',
  RESERVED: 'Rezerve',
  OCCUPIED: 'Dolu',
  STAYOVER: 'Devam',
  OUT_OF_SERVICE: 'Bakımda',
};

/** Rezervasyon durumu etiketleri */
const RESERVATION_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Beklemede',
  APPROVED: 'Onaylandı',
  REJECTED: 'Reddedildi',
  CANCELLED: 'İptal',
  COMPLETED: 'Tamamlandı',
};

type Props = {
  reservations: Reservation[];
  isLoading?: boolean;
  onDayClick?: (date: Date) => void;
  viewMonth?: Date;
  onMonthChange?: (date: Date) => void;
  /** İşletmeye ait oda durumu özeti (durum -> adet). Varsa gün kutusunda ve modalda gösterilir. */
  roomStatusSummary?: Record<string, number>;
};

export function ReservationsCalendar({
  reservations,
  isLoading,
  onDayClick,
  viewMonth: controlledMonth,
  onMonthChange,
  roomStatusSummary,
}: Props) {
  const [internalMonth, setInternalMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const viewMonth = controlledMonth ?? internalMonth;
  const setViewMonth = (d: Date | ((prev: Date) => Date)) => {
    const next = typeof d === 'function' ? d(viewMonth) : d;
    if (onMonthChange) onMonthChange(next);
    else setInternalMonth(next);
  };

  const { days, startPadding } = useMemo(() => {
    const start = startOfMonth(viewMonth);
    const end = endOfMonth(viewMonth);
    const daysInMonth = eachDayOfInterval({ start, end });
    const startPad = start.getDay();
    return { days: daysInMonth, startPadding: startPad };
  }, [viewMonth]);

  const reservationsByDay = useMemo(() => {
    const map: Record<string, Reservation[]> = {};
    reservations.forEach((r) => {
      const key = format(new Date(r.dateTime), 'yyyy-MM-dd');
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    return map;
  }, [reservations]);

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    onDayClick?.(day);
  };

  const dayModalReservations = selectedDate
    ? reservationsByDay[format(selectedDate, 'yyyy-MM-dd')] ?? []
    : [];
  const dayModalReservationByStatus = useMemo(() => {
    const m: Record<string, number> = {};
    dayModalReservations.forEach((r) => {
      m[r.status] = (m[r.status] ?? 0) + 1;
    });
    return m;
  }, [dayModalReservations]);

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMonth((m) => subMonths(m, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="font-semibold capitalize">
              {format(viewMonth, 'MMMM yyyy', { locale: tr })}
            </h3>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMonth((m) => addMonths(m, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-7 gap-1 min-h-[200px] place-items-center text-muted-foreground text-sm">
              Yükleniyor...
            </div>
          ) : (
            <>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {WEEKDAYS.map((d) => (
                  <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: startPadding }).map((_, i) => (
                  <div key={`pad-${i}`} className="aspect-square" />
                ))}
                {days.map((day) => {
                  const key = format(day, 'yyyy-MM-dd');
                  const dayReservations = reservationsByDay[key] ?? [];
                  const count = dayReservations.length;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleDayClick(day)}
                      className={`aspect-square rounded-md border text-sm flex flex-col items-center justify-center gap-0.5 transition-colors ${
                        count > 0
                          ? 'bg-primary/10 border-primary/30 hover:bg-primary/20'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <span>{format(day, 'd')}</span>
                      {count > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {count} rez.
                        </span>
                      )}
                      {roomStatusSummary && Object.keys(roomStatusSummary).length > 0 && (
                        <span className="text-[10px] text-muted-foreground/80" title="Oda durumu özeti (tıklayın)">
                          {Object.entries(roomStatusSummary)
                            .filter(([, n]) => n > 0)
                            .slice(0, 2)
                            .map(([status, n]) => `${ROOM_STATUS_LABELS[status] ?? status}: ${n}`)
                            .join(' · ')}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedDate} onOpenChange={(open) => !open && setSelectedDate(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedDate
                ? format(selectedDate, 'd MMMM yyyy', { locale: tr })
                : ''}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Rezervasyon durumu</h4>
              {dayModalReservations.length === 0 ? (
                <p className="text-sm text-muted-foreground">Bu güne ait rezervasyon yok.</p>
              ) : (
                <ul className="space-y-1.5 text-sm">
                  {Object.entries(dayModalReservationByStatus).map(([status, n]) => (
                    <li key={status} className="flex justify-between">
                      <span>{RESERVATION_STATUS_LABELS[status] ?? status}</span>
                      <span className="font-medium">{n}</span>
                    </li>
                  ))}
                </ul>
              )}
              {dayModalReservations.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground border-t pt-2">
                  {dayModalReservations.slice(0, 5).map((r) => (
                    <li key={r.id}>
                      {r.customerName} – {format(new Date(r.dateTime), 'HH:mm')} ({r.partySize} kişi)
                    </li>
                  ))}
                  {dayModalReservations.length > 5 && (
                    <li>+{dayModalReservations.length - 5} rezervasyon daha</li>
                  )}
                </ul>
              )}
            </div>
            {roomStatusSummary && Object.keys(roomStatusSummary).length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Oda durumu</h4>
                <ul className="space-y-1 text-sm">
                  {Object.entries(roomStatusSummary)
                    .filter(([, n]) => n > 0)
                    .map(([status, n]) => (
                      <li key={status} className="flex justify-between">
                        <span>{ROOM_STATUS_LABELS[status] ?? status}</span>
                        <span className="font-medium">{n}</span>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
