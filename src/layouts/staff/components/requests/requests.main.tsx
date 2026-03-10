import {
    ActionIcon,
    Button,
    Card,
    Grid,
    Group,
    LoadingOverlay,
    type MantineStyleProp,
    Stack,
    Text,
    TextInput,
    Title
} from "@mantine/core";
import {type ChangeEvent, useEffect, useState} from "react";
import StaffRequestModal from "./request.modal.tsx";
import {NotificationsService} from "../../../../services/notifications/notifications.service.ts";
import {IconPlus, IconRefresh, IconSearch, IconX} from "@tabler/icons-react";
import {DatabaseTables} from "../../../../enums/tables.ts";
import InventoryService from "../../../../services/operations/inventory.service.ts";

const cardStyle: MantineStyleProp = {
    height: '200px',
    position: 'relative',
}

export default function StaffRequestsLayout() {
    const [isLoading, setIsLoading] = useState(false);

    const [isOpenModal, setIsOpenModal] = useState(false);

    const [keyword, setKeyword] = useState<string>("");

    const [items, setItems] = useState<any[]>([]);

    useEffect(() => {
        (async() => await fetchRequests())();
    }, [])

    async function fetchRequests() {
        setIsLoading(true);

        const service = InventoryService.getInstance();

        try {
            const data = await service.getAllRows(DatabaseTables.Requests);
            setItems(data);
        } catch (e: any) {
            NotificationsService.error("Fetch requests", e.toString());
        }

        setIsLoading(false);
    }

    function handleCloseModal() {
        setIsOpenModal(false)
    }

    async function clearSearch(){
        setKeyword("")
        const temp = localStorage.getItem(DatabaseTables.Items);
        if(!temp) {
            setItems([])
        } else {
            setItems(JSON.parse(temp));
        }
    }

    async function handleSearchByName(e: ChangeEvent<HTMLInputElement>) {
        setKeyword(e.target.value)

        const temp = localStorage.getItem(DatabaseTables.Requests);
        let cache = []
        if(!temp) {
            localStorage.setItem(DatabaseTables.Requests, JSON.stringify(items));
            cache = JSON.parse(JSON.stringify(items));
        } else {
            cache = JSON.parse(temp);
        }

        const matchingItems = cache.filter((i: any) => i.name.startsWith(e.target.value));
        setItems(matchingItems)
    }


    return (
        <Stack pt={"lg"} pl={"sm"}>
            <LoadingOverlay
                visible={isLoading}
                overlayProps={{ radius: "sm", blur: 2 }}
            />
            <Title>Requests</Title>
            <Grid>
                <Grid.Col span={4}>
                    <Card style={{
                        ...cardStyle
                    }}>
                        <Stack justify={'flex-end'} align={'start'}>
                            <Text>Pending requests</Text>
                            <Title>1</Title>
                        </Stack>
                    </Card>
                </Grid.Col>
                <Grid.Col span={4}>
                    <Card style={{
                        ...cardStyle
                    }}>
                        <Stack justify={'flex-end'} align={'start'}>
                            <Text>Ongoing requests</Text>
                            <Title>1</Title>
                        </Stack>
                    </Card>
                </Grid.Col>
                <Grid.Col span={4}>
                    <Card style={{
                        ...cardStyle
                    }}>
                        <Stack justify={'flex-end'} align={'start'}>
                            <Text>Finished requests</Text>
                            <Title>1</Title>
                        </Stack>
                    </Card>
                </Grid.Col>
            </Grid>
            <Group justify={"space-between"}>
                <Stack gap={5}>
                    <Text>Filter</Text>
                    <Group>
                        <TextInput
                            placeholder={"Search by Name"}
                            value={keyword}
                            onChange={handleSearchByName}
                        />
                        {
                            keyword.length > 0 && <ActionIcon onClick={clearSearch} size={"lg"} color={'red'}>
                                <IconX />
                            </ActionIcon>
                        }
                        <ActionIcon size={"lg"}>
                            <IconSearch />
                        </ActionIcon>
                    </Group>
                </Stack>
                <Stack gap={5}>
                    <Text>Controls</Text>
                    <Group>
                        <Button
                            onClick={() => setIsOpenModal(true)}
                            leftSection={<IconPlus />}>
                            New Request
                        </Button>
                        <Button
                            onClick={() => fetchRequests()}
                            leftSection={<IconRefresh />}>
                            Refresh
                        </Button>
                    </Group>
                </Stack>
            </Group>



            <StaffRequestModal open={isOpenModal} refresh={fetchRequests} close={handleCloseModal} />
        </Stack>
    )
}