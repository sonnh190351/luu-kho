import {ActionIcon, Container, Divider, Group, Stack, Text, useMantineColorScheme} from "@mantine/core";
import {
    BG_COLOR_DARK,
    BG_COLOR_LIGHT,
    BORDER_COLOR_DARK,
    BORDER_COLOR_LIGHT,
    NAV_BAR_HEIGHT
} from "../../enums/styling.ts";
import {LocalStorage} from "../../enums/localStorage.ts";
import CustomerWarehousesLayout from "./components/warehouses/warehouses.main.tsx";
import {useState} from "react";
import type {TabGroup} from "../common.types.ts";
import {IconBuildingWarehouse, IconChartArea, IconCommand} from "@tabler/icons-react";
import CustomerRequestsLayout from "./components/requests/requests.main.tsx";
import CustomerDashboardTab from "./components/dashboard/dashboard.main.tsx";

const openMenuWidth = 200;

export default function CustomerLayout() {

    const { colorScheme } = useMantineColorScheme();

    const isDarkMode = colorScheme === "dark";

    const cachedData = localStorage.getItem(LocalStorage.userData);

    const isLoggedIn = Boolean(cachedData);

    const loginData = JSON.parse(cachedData!);

    if(!isLoggedIn) {
        window.location.href = "/login";
        return;
    }

    const customerItems = [
        <CustomerDashboardTab />,
        <CustomerWarehousesLayout />,
        <CustomerRequestsLayout />
    ]

    const customerTabs: TabGroup[] = [
        {
            name: "",
            items: [
                {
                    icon: <IconChartArea />,
                    title: "Dashboard",
                    index: 0,
                },
            ],
        },
        {
            name: "Warehouses",
            items: [
                {
                    icon: <IconBuildingWarehouse />,
                    title: "User Warehouses",
                    index: 1
                }
            ]
        },
        {
            name: "Requests",
            items: [
                {
                    icon: <IconCommand />,
                    title: "Requests",
                    index: 2
                }
            ]
        }
    ]

    const [currentTab, setCurrentTab] = useState<number>(0);

    return (
        <Container
            fluid
            style={{
                paddingTop: NAV_BAR_HEIGHT + 20
            }}>
            <Group p={0} m={0}>
                <Stack
                    justify={"space-between"}
                    style={{
                        paddingTop: NAV_BAR_HEIGHT,
                        position: "fixed",
                        left: 0,
                        top: 0,
                        zIndex: 1,
                        borderRight: `1px solid ${isDarkMode ? BORDER_COLOR_DARK : BORDER_COLOR_LIGHT}`,
                        width: openMenuWidth,
                        height: "100%",
                        backgroundColor: isDarkMode
                            ? BG_COLOR_DARK
                            : BG_COLOR_LIGHT,
                    }}>
                    <Stack p={5} gap={0}>
                        {
                            customerTabs.map((tab: TabGroup, tab_index) => (
                                <Stack gap={0} key={`tab-item-${tab_index}`}>
                                    <Text
                                        mt={"sm"}
                                        pl={10}
                                        style={{
                                            fontWeight: 700,
                                        }}>
                                        {tab.name}
                                    </Text>
                                    {tab.items.map((item, item_index: number) => (
                                        <Group
                                            p={5}
                                            onClick={() =>
                                                setCurrentTab(item.index)
                                            }
                                            key={`admin-tab-${tab_index}-${item_index}`}
                                            mt={5}
                                            style={{
                                                overflow: "hidden",
                                                position: "relative",
                                                cursor: "pointer",
                                                backgroundColor:
                                                    item.index === currentTab
                                                        ? isDarkMode
                                                            ? "rgba(255,255,255, 0.05)"
                                                            : "rgba(37,36,37, 0.05)"
                                                        : "transparent",
                                                borderRadius: "5px",
                                            }}>
                                            <ActionIcon
                                                variant={"outline"}
                                                color={"white.5"}>
                                                {item.icon}
                                            </ActionIcon>
                                            <Text
                                                style={{
                                                    position: "absolute",
                                                    left: 50,
                                                }}>
                                                {item.title}
                                            </Text>
                                        </Group>
                                    ))}
                                    {tab_index < customerTabs.length - 1 && (
                                        <Divider mb={"xs"} mt={"sm"} />
                                    )}
                                </Stack>
                            ))
                        }
                    </Stack>
                </Stack>
                <div
                    style={{
                        width: "100%",
                        height: "100px",
                        zIndex: -1,
                        marginLeft: openMenuWidth,
                    }}>
                    {customerItems[currentTab]}
                </div>
            </Group>
        </Container>
    )
}