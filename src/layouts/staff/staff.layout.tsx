import {ActionIcon, Container, Divider, Group, Stack, Text, useMantineColorScheme} from "@mantine/core";
import {
    APP_COLOR,
    BG_COLOR_DARK,
    BG_COLOR_LIGHT,
    BORDER_COLOR_DARK,
    BORDER_COLOR_LIGHT,
    NAV_BAR_HEIGHT
} from "../../enums/styling.ts";
import {LocalStorage} from "../../enums/localStorage.ts";
import StaffWarehousesLayout from "./components/warehouses/warehouses.main.tsx";
import {useState} from "react";
import type {TabGroup} from "../common.types.ts";
import {IconBuildingWarehouse, IconCommand, IconLogs, IconMenuOrder, IconTemplate} from "@tabler/icons-react";
import StaffOrdersLayout from "./components/orders/orders.tab.tsx";
import LogsTab from "../../components/shared/logs/logs.tab.tsx";
import ItemsTab from "../../components/shared/items/items.tab.tsx";
import RequestsLayout from "./components/requests/requests.main.tsx";

const openMenuWidth = 200;

export default function StaffLayout() {

    const { colorScheme } = useMantineColorScheme();

    const isDarkMode = colorScheme === "dark";

    const cachedData = localStorage.getItem(LocalStorage.userData);

    const isLoggedIn = Boolean(cachedData);

    if(!isLoggedIn) {
        window.location.href = "/login";
        return;
    }

    const staffItems = [
        <ItemsTab />,
        <StaffWarehousesLayout />,
        <LogsTab />,
        <RequestsLayout />,
        <StaffOrdersLayout />
    ]

    const staffTabs: TabGroup[] = [
        {
            name: "Warehouses",
            items: [
                {
                    icon: <IconTemplate />,
                    title: "Items",
                    index: 0
                },
                {
                    icon: <IconBuildingWarehouse />,
                    title: "Inventory",
                    index: 1
                },
                {
                    icon: <IconLogs />,
                    title: "Logs",
                    index: 2
                }
            ]
        },
        {
            name: "Requests",
            items: [
                {
                    icon: <IconCommand />,
                    title: "Requests",
                    index: 3
                }
            ]
        },
        {
            name: "Orders",
            items: [
                {
                    icon: <IconMenuOrder />,
                    title: "Orders",
                    index: 4
                }
            ]
        }
    ]

    const [currentTab, setCurrentTab] = useState<number>(0);

    return (
        <Container
            fluid
            style={{
                paddingTop: NAV_BAR_HEIGHT
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
                            staffTabs.map((tab: TabGroup, tab_index) => (
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
                                                        ? APP_COLOR.PRIMARY
                                                        : "transparent",
                                                borderRadius: "5px",
                                            }}>
                                            <ActionIcon
                                                style={{
                                                    color: item.index === currentTab
                                                        ? "white" : isDarkMode ? "white" : "black",
                                                }}
                                                variant={"transparent"}>
                                                {item.icon}
                                            </ActionIcon>
                                            <Text
                                                style={{
                                                    position: "absolute",
                                                    left: 50,
                                                    color: item.index === currentTab
                                                        ? "white" : isDarkMode ? "white" : "black",
                                                }}>
                                                {item.title}
                                            </Text>
                                        </Group>
                                    ))}
                                    {tab_index < staffTabs.length - 1 && (
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
                    {staffItems[currentTab]}
                </div>
            </Group>
        </Container>
    )
}