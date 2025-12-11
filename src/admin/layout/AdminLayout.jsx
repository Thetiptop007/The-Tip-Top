import { SidebarProvider, useSidebar } from "../../contexts/SidebarContext";
import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";
import webNotificationService from "../services/notification.service";
import socketService from "../api/socket";

const LayoutContent = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  useEffect(() => {
    // Initialize web notifications
    const initNotifications = async () => {
      const enabled = await webNotificationService.initialize();
      if (enabled) {
        console.log('✅ Admin web notifications enabled');
      }
    };

    initNotifications();

    // Listen for new orders via socket
    socketService.onNewOrder((order) => {
      console.log('📦 New order alert in admin panel:', order);
    });

    return () => {
      socketService.off('order:new');
    };
  }, []);

  return (
    <div className="min-h-screen xl:flex">
      <div>
        <AppSidebar />
        {isMobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => {}}
          />
        )}
      </div>
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <AppHeader />
        <div className="p-4 mx-auto max-w-screen-2xl md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const AdminLayout = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AdminLayout;
