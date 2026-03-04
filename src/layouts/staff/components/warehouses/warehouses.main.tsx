import {
    ActionIcon,
    Card,
    Container,
    Divider, Grid,
    Group,
    LoadingOverlay,
    NumberInput,
    Select,
    Stack,
    TextInput,
    Title
} from "@mantine/core";
import {LocalStorage} from "../../../../enums/localStorage.ts";
import {useEffect, useState} from "react";
import {NotificationsService} from "../../../../services/notifications/notifications.service.ts";
import ManagementService from "../../../../services/operations/management.service.ts";
import {IconPlus, IconSearch} from "@tabler/icons-react";

export default function StaffWarehousesTab() {

    const cachedData = localStorage.getItem(LocalStorage.userData);

    const loginData = JSON.parse(cachedData!);

    const warehouse_id = loginData.warehouse_id;

    const [items, setItems] = useState<any[]>([]);

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        (async () => await fetchItems())();
    }, []);

    async function fetchItems() {
        setIsLoading(true)
        try {
            console.log("Fetch Items");
            if(warehouse_id !== null) {
                const service = ManagementService.getInstance();
                const data = await service.getWarehouseInventoryItems(warehouse_id)
                setItems(data);
            }
        } catch (e: any) {
            NotificationsService.error("Fetch Items", e.toString());
        }
        setIsLoading(false)
    }

    return (
        <>
            <Stack pt={"lg"} pl={"sm"}>
                <LoadingOverlay
                    visible={isLoading}
                    overlayProps={{radius: "sm", blur: 2}}
                />

                <Title>Items</Title>
                <Group>
                    <TextInput label={"Name"} leftSection={<IconSearch />} />
                    <Select label={"Warehouse Id"}></Select>
                    <Divider orientation={"vertical"} />
                    <NumberInput label={"Quantity"} />
                    <Select label={"Quantity Type"}></Select>
                </Group>
                <Divider />
                <Stack>
                    <Group style={{
                        width: "90%",
                    }}>
                        <Grid style={{
                            width: "100%",
                        }}>
                            <Grid.Col span={4}>
                                <Title ml={'sm'} order={4}>Name</Title>
                            </Grid.Col>
                            <Grid.Col span={4}>
                                <Title ml={5} order={4}>Quantity</Title>
                            </Grid.Col>
                        </Grid>
                    </Group>

                    {
                        items.map((item: any, index: number) => (
                            <Card key={`warehouse-item-${index}`}>
                                <Group justify={"space-between"}>
                                    <Group style={{
                                        width: "90%",
                                    }}>
                                        <Grid style={{
                                            width: "100%",
                                        }}>
                                            <Grid.Col span={4}>
                                                {item.items.name}
                                            </Grid.Col>
                                            <Grid.Col span={4}>
                                                {item.quantity}
                                            </Grid.Col>
                                        </Grid>
                                    </Group>
                                    <Group>
                                        <ActionIcon>
                                            <IconPlus />
                                        </ActionIcon>
                                    </Group>
                                </Group>
                            </Card>
                        ))
                    }
                </Stack>
            </Stack>
        </>
    )
}