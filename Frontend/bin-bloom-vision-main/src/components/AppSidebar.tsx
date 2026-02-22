import { NavLink } from "react-router-dom";
import { LayoutDashboard, FileText, Truck, ClipboardList, BarChart3, Settings, Recycle, Bell } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navigation = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Waste Classification", url: "/waste-classification", icon: FileText },
  { title: "Vehicle Management", url: "/vehicle-management", icon: Truck },
  { title: "Collection Requests", url: "/collection-requests", icon: ClipboardList },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Notification Alert", url: "/notification-alert", icon: Bell },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { open } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="bg-sidebar">
        <div className="px-6 py-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
            <Recycle className="w-6 h-6 text-primary-foreground" />
          </div>
          {open && (
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground">EcoWaste</h1>
              <p className="text-xs text-sidebar-foreground/80">Smart Management</p>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      }
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}