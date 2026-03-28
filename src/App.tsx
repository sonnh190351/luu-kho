import { createTheme, MantineProvider } from "@mantine/core";
import { createBrowserRouter, RouterProvider } from "react-router";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
import '@mantine/charts/styles.css';
import "./app.scss";

import "mantine-datatable/styles.layer.css";

import "@fontsource/google-sans/400.css";
import "@fontsource/google-sans-code/400.css";

import { Notifications } from "@mantine/notifications";

import LoginLayout from "./layouts/auth/login/login.layout.tsx";
import ProtectedRoute from "./routes/protected.route.ts";
import NavigationBar from "./components/navigation/navigationBar.tsx";
import AdminLayout from "./layouts/admin/admin.layout.tsx";
import { ModalsProvider } from "@mantine/modals";
import { InformationModal } from "./components/modals/information.modal.tsx";
import StaffLayout from "./layouts/staff/staff.layout.tsx";
import ManagerLayout from "./layouts/manager/manager.layout.tsx";
import {USER_ROLES} from "./enums/roles.ts";

export default function App() {
    const router = createBrowserRouter([
        {
            path: "/admin",
            element: (
                <ProtectedRoute role={USER_ROLES.super_admin}>
                    <NavigationBar />
                    <AdminLayout />
                </ProtectedRoute>
            ),
        },
        {
            path: "/staff",
            element: (
                <ProtectedRoute role={USER_ROLES.staff}>
                    <NavigationBar />
                    <StaffLayout />
                </ProtectedRoute>
            ),
        },
        {
            path: "/manager",
            element: (
                <ProtectedRoute role={USER_ROLES.manager}>
                    <NavigationBar />
                    <ManagerLayout />
                </ProtectedRoute>
            ),
        },
        {
            path: "*",
            element: <LoginLayout />,
        },
    ]);

    const theme = createTheme({
        fontFamily: "Google Sans",
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
