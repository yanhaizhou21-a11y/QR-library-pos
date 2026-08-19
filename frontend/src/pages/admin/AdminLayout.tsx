import { Outlet } from 'react-router-dom';
import DashboardLayout from '@/dashboard-layout';
import { ThemeProvider } from '@/components/library/theme-provider';

export default function AdminLayout() {
  return (
    <ThemeProvider>
      <DashboardLayout>
        <Outlet />
      </DashboardLayout>
    </ThemeProvider>
  );
}
