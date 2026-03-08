import { Outlet } from '@tanstack/react-router';
import { CompanyContextProvider } from '#/context/company-context';
import { SearchProvider } from '#/context/search-context';
import { AppSidebar } from '#/components/layout/app-sidebar';
import { Header } from '#/components/layout/header';
import { Search } from '#/components/search';
import { ThemeSwitch } from '#/components/theme-switch';
import { SidebarInset, SidebarProvider } from '#/components/ui/sidebar';

interface Props {
  children?: React.ReactNode;
}

export function AuthenticatedLayout({ children }: Props) {
  const content = children ?? <Outlet />;

  return (
    <CompanyContextProvider>
      <SearchProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <Header fixed>
              <Search placeholder="Rezervasyon, müşteri ara..." />
              <div className="ml-auto flex items-center gap-2">
                <ThemeSwitch />
              </div>
            </Header>
            <div className="flex-1 overflow-auto pt-16">
              <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {content}
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </SearchProvider>
    </CompanyContextProvider>
  );
}
