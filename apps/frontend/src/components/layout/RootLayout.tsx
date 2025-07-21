import { Outlet } from "react-router-dom";
import { AuthProvider } from "../../authentication";
import { SnackbarProvider } from "notistack";

export default function RootLayout() {
  return (
    <SnackbarProvider>
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    </SnackbarProvider>
  );
}
