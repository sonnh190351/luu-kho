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
import {useState} from "react";
import type {TabGroup} from "../common.types.ts";
import {
    IconChartArea,
    IconCommand,
    IconLogs,
    IconPackages,
    IconPizza, IconTransferIn, IconTransferOut
} from "@tabler/icons-react";
import LogsTab from "../../components/shared/logs/logs.tab.tsx";
import ProductsTabs from "../../components/shared/products/products.tab.tsx";
import ManagerStatusTab from "./components/status/status.main.tsx";
import ManagerInventoryImportTab from "./components/inventoryImport/inventoryImport.main.tsx";
import RequestsTab from "../../components/shared/requests/requests.tab.tsx";
import ManagerDashboardTab from "./components/dashboard/dashboard.tab.tsx";
import {MANAGER_LOG_ACTIONS} from "../../enums/log.ts";
import ManagerInventoryExportTab from "./components/inventoryExport/inventoryExport.main.tsx";

const openMenuWidth = 200;

export default function ManagerLayout() {

    const { colorScheme } = useMantineColorScheme();

    const isDarkMode = colorScheme === "dark";

    const cachedData = localStorage.getItem(LocalStorage.userData);

    const isLoggedIn = Boolean(cachedData);

    if(!isLoggedIn) {
        window.location.href = "/login";
        return;
    }

    const customerItems = [
        <ManagerDashboardTab />,
        <ManagerInventoryImportTab />,
        <ManagerInventoryExportTab />,
        <ManagerStatusTab />,
        <ProductsTabs />,
        <RequestsTab />,
        <LogsTab log_actions={MANAGER_LOG_ACTIONS} />,
    ]

    const customerTabs: TabGroup[] = [
        {
          name: "",
          items: [
              {
                  icon: <IconChartArea/>,
                  title: "Dashboard",
                  index: 0,
              }
          ]
        },
        {
            name: "Warehouses",
            items: [
                {
                    icon: <IconTransferIn />,
                    title: "Import Tickets",
                    index: 1
                },
                {
                    icon: <IconTransferOut />,
                    title: "Export Tickets",
                    index: 2
                },
                {
                    icon: <IconPackages />,
                    title: "Inventory Status",
                    index: 3
                },
                {
                    icon: <IconPizza/>,
                    title: "Dishes",
                    index: 4
                }
            ]
        },
        {
            name: "Requests",
            items: [
                {
                    icon: <IconCommand />,
                    title: "Requests",
                    index: 5
                }
            ]
        },
        {
            name: "Logs",
            items: [
                {
                    icon: <IconLogs/>,
                    title: "Logs",
                    index: 6
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
                                                    top: 8,
                                                    left: 50,
                                                    color: item.index === currentTab
                                                        ? "white" : isDarkMode ? "white" : "black",
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