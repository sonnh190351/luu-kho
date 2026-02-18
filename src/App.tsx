import { createTheme, MantineProvider } from "@mantine/core";
import { createBrowserRouter, RouterProvider } from "react-router";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
import "./app.scss";

import "mantine-datatable/styles.layer.css";

import "@fontsource/be-vietnam-pro/200.css";

import { Notifications } from "@mantine/notifications";

import LoginLayout from "./layouts/auth/login/login.layout.tsx";
import ProtectedRoute from "./routes/protected.route.ts";
import NavigationBar from "./components/navigation/navigationBar.tsx";
import AdminLayout from "./layouts/admin/admin.layout.tsx";
import { ModalsProvider } from "@mantine/modals";
import UserDetailsLayout from "./layouts/user_details/user.layout.tsx";
import { InformationModal } from "./components/modals/information.modal.tsx";

export default function App() {
    const router = createBrowserRouter([
        {
            path: "*",
            element: (
                <ProtectedRoute>
                    <NavigationBar />
                    <AdminLayout />
                </ProtectedRoute>
            ),
        },
        {
            path: "/details",
            element: (
                <ProtectedRoute>
                    <NavigationBar />
                    <UserDetailsLayout />
                </ProtectedRoute>
            ),
        },
        {
            path: "/login",
            element: <LoginLayout />,
        },
    ]);

    const theme = createTheme({
        fontFamily: "Be Vietnam Pro",
    });

    return (
        <MantineProvider theme={theme} defaultColorScheme={"dark"}>
            <Notifications />
            <ModalsProvider
                modals={{
                    information: InformationModal,
                }}>
                <RouterProvider router={router} />
            </ModalsProvider>
        </MantineProvider>
    );
}
