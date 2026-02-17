import {
    ActionIcon,
    Container,
    Divider,
    Group,
    Stack,
    Text,
    useMantineColorScheme,
} from "@mantine/core";
import {
    BG_COLOR_DARK,
    BG_COLOR_LIGHT,
    BORDER_COLOR_DARK,
    BORDER_COLOR_LIGHT,
    NAV_BAR_HEIGHT,
} from "../../enums/styling.ts";
import { useRef, useState } from "react";

import {
    IconBuildingWarehouse,
    IconCategory,
    IconPackage,
    IconReceipt,
    IconTag,
    IconTemplate,
    IconUser,
    IconUserDollar,
} from "@tabler/icons-react";
import ItemsTab from "./components/items/items.tab.tsx";
import CategoriesTab from "./components/categories/categories.tab.tsx";
import TagsTab from "./components/tags/tags.tab.tsx";
import InventoriesTab from "./components/inventories/inventories.tab.tsx";
import WarehousesTab from "./components/warehouses/warehouses.tab.tsx";
import SuppliersTab from "./components/suppliers/suppliers.tab.tsx";
import UsersTab from "./components/users/users.tab.tsx";
import RequestsTab from "./components/requests/requests.tab.tsx";
import type { TabGroup } from "./admin.types.ts";

const openMenuWidth = 200;

export default function AdminLayout() {
    const { colorScheme, setColorScheme } = useMantineColorScheme();

    const isDarkMode = colorScheme === "dark";

    const adminItems = [
        <ItemsTab />,
        <CategoriesTab />,
        <TagsTab />,
        <InventoriesTab />,
        <WarehousesTab />,
        <UsersTab />,
        <SuppliersTab />,
        <RequestsTab />,
    ];

    const adminTabs: TabGroup[] = [
        {
            name: "Items",
            items: [
                {
                    icon: <IconTemplate />,
                    title: "Items",
                    index: 0,
                },
                {
                    icon: <IconCategory />,
                    title: "Categories",
                    index: 1,
                },
                {
                    icon: <IconTag />,
                    title: "Tags",
                    index: 2,
                },
            ],
        },
        {
            name: "Inventory",
            items: [
                {
                    icon: <IconPackage />,
                    title: "Inventories",
                    index: 3,
                },
                {
                    icon: <IconBuildingWarehouse />,
                    title: "Warehouses",
                    index: 4,
                },
            ],
        },
        {
            name: "Users",
            items: [
                {
                    icon: <IconUser />,
                    title: "Users",
                    index: 5,
                },
                {
                    icon: <IconUserDollar />,
                    title: "Suppliers",
                    index: 6,
                },

                {
                    icon: <IconReceipt />,
                    title: "Requests",
                    index: 7,
                },
            ],
        },
    ];

    const menuRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [currentTab, setCurrentTab] = useState<number>(0);

    return (
        <Container
            fluid
            style={{
                paddingTop: NAV_BAR_HEIGHT,
            }}>
            <Group p={0} m={0}>
                <Stack
                    justify={"space-between"}
                    ref={menuRef}
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
                        {adminTabs.map((tab: TabGroup, tab_index: number) => (
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
                                {tab_index < adminTabs.length - 1 && (
                                    <Divider mb={"xs"} mt={"sm"} />
                                )}
                            </Stack>
                        ))}
                    </Stack>
                </Stack>
                <div
                    ref={containerRef}
                    style={{
                        width: "100%",
                        height: "100px",
                        zIndex: -1,
                        marginLeft: openMenuWidth,
                    }}>
                    {adminItems[currentTab]}
                </div>
            </Group>
        </Container>
    );
}
