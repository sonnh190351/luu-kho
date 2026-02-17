import {
    Avatar,
    Card,
    Container,
    Divider,
    Text,
    Title,
    Grid,
    Group,
    Stack,
    ActionIcon,
} from "@mantine/core";
import { NAV_BAR_HEIGHT } from "../../enums/styling";
import { IconEdit } from "@tabler/icons-react";
import { LocalStorage } from "../../enums/localStorage";

export default function UserDetailsLayout() {
    const cachedData = localStorage.getItem(LocalStorage.userData);

    const isLoggedIn = Boolean(cachedData);

    const loginData = JSON.parse(cachedData!);

    return (
        <Container
            fluid
            style={{
                paddingTop: NAV_BAR_HEIGHT * 1.4,
            }}>
            <Grid>
                <Grid.Col span={12}>
                    <Card>
                        <Grid>
                            <Grid.Col span={4}>
                                <Stack
                                    justify="center"
                                    style={{
                                        height: "15dvh",
                                        borderRight:
                                            "1px solid rgba(255,255,255,0.3)",
                                    }}>
                                    <Group gap={30}>
                                        <Avatar size={100}></Avatar>
                                        <Stack gap="xs">
                                            <Title order={3}>Test User</Title>
                                            <Text>Staff User</Text>
                                        </Stack>
                                    </Group>
                                </Stack>
                            </Grid.Col>
                            <Grid.Col span={8}>
                                <Stack
                                    p="xl"
                                    justify="center"
                                    style={{
                                        height: "15vh",
                                    }}>
                                    <Group justify={"space-between"}>
                                        <Stack gap="xs">
                                            <Title order={4}>Staff ID:</Title>
                                            <Text>142</Text>
                                        </Stack>
                                        <Stack gap="xs">
                                            <Title order={4}>
                                                Phone Number:
                                            </Title>
                                            <Text>(+84) 934 678 890</Text>
                                        </Stack>
                                        <Stack gap="xs">
                                            <Title order={4}>E-mail:</Title>
                                            <Text>{loginData.user.email}</Text>
                                        </Stack>
                                    </Group>
                                </Stack>
                            </Grid.Col>
                        </Grid>
                    </Card>
                </Grid.Col>
                <Grid.Col
                    span={{
                        base: 12,
                        sm: 12,
                        md: 6,
                    }}>
                    <Card
                        style={{
                            height: "20dvh",
                        }}>
                        <Stack>
                            <Group justify="space-between">
                                <Title order={2}>Personal Information</Title>
                                <ActionIcon size={"lg"} variant="transparent">
                                    <IconEdit />
                                </ActionIcon>
                            </Group>
                            <Divider />
                        </Stack>
                    </Card>
                </Grid.Col>
                <Grid.Col
                    span={{
                        base: 12,
                        sm: 12,
                        md: 6,
                    }}>
                    <Card
                        style={{
                            height: "20dvh",
                        }}>
                        <Stack>
                            <Group justify="space-between">
                                <Title order={2}>Account Information</Title>
                                <ActionIcon size={"lg"} variant="transparent">
                                    <IconEdit />
                                </ActionIcon>
                            </Group>
                            <Divider />
                        </Stack>
                    </Card>
                </Grid.Col>
            </Grid>
        </Container>
    );
}
