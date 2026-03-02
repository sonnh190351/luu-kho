import {
    Avatar,
    Button,
    Container,
    Divider,
    Group,
    Menu, Modal,
    Switch,
    useMantineColorScheme,
} from "@mantine/core";
import {
    BG_COLOR_DARK,
    BG_COLOR_LIGHT,
    BORDER_COLOR_DARK,
    BORDER_COLOR_LIGHT,
    NAV_BAR_HEIGHT,
    ZIndexLevel,
} from "../../enums/styling.ts";
import { LocalStorage } from "../../enums/localStorage.ts";
import {
    IconLogout,
    IconMoonStars,
    IconSettings,
    IconSun,
    IconUser,
} from "@tabler/icons-react";
import {useState} from "react";
import UserDetails from "../../layouts/user_details/user.layout.tsx";

export default function NavigationBar() {
    const { colorScheme, setColorScheme } = useMantineColorScheme();

    const isDarkMode = colorScheme === "dark";

    const cachedData = localStorage.getItem(LocalStorage.userData);

    const isLoggedIn = Boolean(cachedData);

    const loginData = JSON.parse(cachedData!);

    const [openUserDetails, setOpenUserDetails] = useState<boolean>(false)

    function handleLogout(): void {
        localStorage.removeItem(LocalStorage.userData);
        window.location.href = "/"
    }

    return (
        <>
            <Container
                fluid
                style={{
                    width: "100%",
                    position: "fixed",
                    left: 0,
                    top: 0,
                    height: NAV_BAR_HEIGHT,
                    backgroundColor: isDarkMode ? BG_COLOR_DARK : BG_COLOR_LIGHT,
                    borderBottom: `1px solid ${isDarkMode ? BORDER_COLOR_DARK : BORDER_COLOR_LIGHT}`,
                    zIndex: ZIndexLevel.MEDIUM - 1,
                }}>
                <Group pt={5} justify={"space-between"}>
                    <img src={"/logo.png"} height={25} />

                    <Group>
                        <Switch
                            mr="0"
                            label="Color Mode"
                            labelPosition="left"
                            color="dark.4"
                            onLabel={
                                <IconSun
                                    size={16}
                                    stroke={2.5}
                                    color="var(--mantine-color-yellow-4)"
                                />
                            }
                            offLabel={
                                <IconMoonStars
                                    size={16}
                                    stroke={2.5}
                                    color="var(--mantine-color-blue-6)"
                                />
                            }
                            checked={isDarkMode}
                            onChange={(_) =>
                                setColorScheme(isDarkMode ? "light" : "dark")
                            }
                        />
                        <Divider orientation="vertical" />
                        {isLoggedIn ? (
                            <Menu>
                                <Menu.Target>
                                    <Avatar />
                                </Menu.Target>

                                <Menu.Dropdown>
                                    <Menu.Label>{loginData.email}</Menu.Label>
                                    <Menu.Divider></Menu.Divider>
                                    <Menu.Item leftSection={<IconUser />} onClick={() => setOpenUserDetails(true)}>
                                        User Details
                                    </Menu.Item>
                                    <Menu.Item leftSection={<IconSettings />}>
                                        Settings
                                    </Menu.Item>
                                    <Menu.Divider></Menu.Divider>
                                    <Menu.Item
                                        onClick={handleLogout}
                                        leftSection={<IconLogout />}
                                        color="red">
                                        Log out
                                    </Menu.Item>
                                </Menu.Dropdown>
                            </Menu>
                        ) : (
                            <Button size={"xs"}>Login</Button>
                        )}
                    </Group>
                </Group>
            </Container>

            <Modal title={"User Details"} p={0} m={0} size={'lg'} centered={true} opened={openUserDetails} onClose={() => setOpenUserDetails(false)}>
                <UserDetails />
            </Modal>
        </>
    );
}
