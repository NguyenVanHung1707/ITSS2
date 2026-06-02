import { useLocation, useNavigate } from "react-router-dom";
import { User, Library } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";

const menuItems = [
  {
    id: "profile",
    label: "Quản lý tài khoản",
    icon: User,
    href: "/profile",
  },
  {
    id: "bookshelf",
    label: "Tủ sách cá nhân",
    icon: Library,
    href: "/bookshelf",
  },
];

export function AccountSidebar() {
  const location = useLocation(); 
  const navigate = useNavigate(); 
  const pathname = location.pathname; 
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="w-68 h-full bg-linear-to-b from-white via-slate-50 to-slate-100 bg-card/30 pt-6 pb-4 px-4 flex flex-col gap-2 shadow-sm">
      <div className="flex flex-col items-center mb-6">
        <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-2xl font-bold text-primary mb-2">
          <User className="w-8 h-8" />
        </div>
        <span className="font-semibold text-lg">{user?.fullName || user?.full_name}</span>
      </div>
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start ${isActive ? "bg-gray-100 text-primary" : "text-foreground hover:bg-gray-100 hover:text-foreground"}`}
                onClick={() => navigate(item.href)}
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>
    </div>
  );
}