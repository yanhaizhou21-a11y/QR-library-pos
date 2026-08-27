import { Outlet } from 'react-router-dom';
import { ThemeProvider } from '@/components/library/theme-provider';

export default function UserLayout() {
  return (
    <ThemeProvider>
      <Outlet />
    </ThemeProvider>
  );
}