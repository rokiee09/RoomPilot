import { NavGroup } from '#/components/layout/nav-group';
import { NavUser } from '#/components/layout/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '#/components/ui/sidebar';
import { systemAdminSidebarData } from './data/system-admin-sidebar-data';

export function SystemAdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" variant="floating" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2">
          <img src="/images/roompilot-logo.png" alt="RoomPilot" className="h-8 w-auto flex-shrink-0" />
          <span className="font-semibold text-lg truncate">RoomPilot</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {systemAdminSidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}