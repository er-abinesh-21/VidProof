import { NavLink, useLocation } from "react-router-dom";
import { Home, LayoutGrid, User, Video } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "My Reports", href: "/reports", icon: LayoutGrid },
  { name: "Profile", href: "/profile", icon: User },
];

export const SidebarContent = () => {
  const location = useLocation();

  return (
    <div className="flex h-full max-h-screen flex-col gap-2">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <NavLink to="/" className="flex items-center gap-2 font-semibold text-lg">
          <Video className="h-6 w-6 text-primary" />
          <span className="text-foreground">Vid<span className="text-glow font-bold">Proof</span></span>
        </NavLink>
      </div>
      <div className="flex-1">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                  isActive && "bg-muted text-primary"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export const Sidebar = () => {
  return (
    <aside className="hidden border-r bg-muted/40 md:block">
      <SidebarContent />
    </aside>
  );
};