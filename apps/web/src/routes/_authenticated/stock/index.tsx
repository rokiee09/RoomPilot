import { StockIndexPage } from '#/features/stock';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/stock/')({
  component: StockIndexPage,
});
