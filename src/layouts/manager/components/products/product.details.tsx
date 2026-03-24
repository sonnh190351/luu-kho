import {ActionIcon, Button, Group, LoadingOverlay, Stack, Text, TextInput, Title} from "@mantine/core";
import {
    IconChevronLeft,
    IconEdit,
    IconPlus,
    IconRefresh,
    IconSearch,
    IconTrash,
    IconX
} from "@tabler/icons-react";
import {useEffect, useState} from "react";
import CommonTable from "../../../../components/dataTable/common.table.tsx";
import type {DataTableColumn} from "mantine-datatable";
import {NotificationsService} from "../../../../services/notifications/notifications.service.ts";
import OperationService from "../../../../services/operations/operationService.ts";
import {InformationService} from "../../../../services/notifications/information.service.ts";
import {DatabaseTables} from "../../../../enums/tables.ts";
import ManagerProductDetailsModal from "./product.details.modal.tsx";

interface ProductDetailsTabProps {
    product?: any
    close: any;
}

export default function ManagerProductDetailsTab({product, close}: ProductDetailsTabProps) {

    const [isLoading, setIsLoading] = useState(false);
    const [keyword, setKeyword] = useState("");
    const [openModal, setOpenModal] = useState(false);

    const [productItem, setProductItem] = useState<any>(undefined);
    const [selectedProductItem, setSelectedProductItem] = useState<any>(undefined);

    useEffect(() => {
        if(product) {
            (async () => await fetchProductItems())();
        }
    }, [product]);

    async function fetchProductItems(): Promise<void> {
        setIsLoading(true);
        try {
            const service = OperationService.getInstance()
            const data = await service.getProductDetails(product.id)
            if(data) {
                setProductItem(data)
                console.log(data)
            } else {
                close()
            }
        } catch (e: any) {
            NotificationsService.error("Fetch product items", e.toString())
        }
        setIsLoading(false)
    }

    const columns: DataTableColumn[] = [
        {
            accessor: "id",
            title: "ID",
            width: 120,
            sortable: true,
            render: ({ id }: any) => {
                return (
                    <Group>
                        <Text>{id}</Text>
                    </Group>
                );
            },
        },
        {
            accessor: "name",
            title: "Name",
            sortable: true,
            render: ({ items }: any) => {
                return <Group>{items.name}</Group>;
            },
        },
        {
            accessor: "quantity",
            title: "Name",
            sortable: true,
            width: 170,
            render: ({ quantity }: any) => {
                return <Group>{quantity}</Group>;
            },
        },
        {
            accessor: "quantity_type",
            title: "Name",
            sortable: true,
            width: 170,
            render: ({ items }: any) => {
                return <Group>{items.quantity_type}</Group>;
            },
        },
        {
            accessor: "actions",
            title: "Actions",
            width: 120,
            render: ({ id }: any) => {
                return (
                    <Group>
                        <ActionIcon
                            onClick={() => handleDelete(id)}
                            size={"lg"}>
                            <IconTrash />
                        </ActionIcon>
                        <ActionIcon size={"lg"} onClick={() => handleEdit(id)}>
                            <IconEdit />
                        </ActionIcon>
                    </Group>
                );
            },
        },
    ]

    function handleDelete(id: number) {
        InformationService.getInstance().confirm(async () => {
            try {
                const service = OperationService.getInstance();
                await service.deleteById(DatabaseTables.ProductItems, id);
                NotificationsService.success(
                    "Delete Product Item",
                    `Product item ${id} has been deleted!`,
                );
            } catch (e: any) {
                NotificationsService.error("Delete Product Item", e.toString());
            }
            await fetchProductItems()
        });
    }

    function handleEdit(id: number) {
        const matching = productItem.product_items.find((p: any) => p.id === id);
        if (matching) {
            setSelectedProductItem(matching);
            setOpenModal(true);
        }
    }

    function handleSearchByName(e: any) {
        setKeyword(e.target.value)
    }

    function handleClearSearch() {
        setKeyword("");
    }

    function handleCloseModal() {
        setOpenModal(false);
        setTimeout(() => {
            setSelectedProductItem(undefined)
        }, 200)
    }

    return (
        <Stack>
            <LoadingOverlay
                visible={isLoading}
                overlayProps={{radius: "sm", blur: 2}}
            />
            <Group>
                <ActionIcon onClick={close}>
                    <IconChevronLeft/>
                </ActionIcon>
                <Title order={4}>
                    You are viewing details of: {product.name}
                </Title>
            </Group>

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
                            keyword.length > 0 &&
                            <ActionIcon onClick={handleClearSearch} size={"lg"} color={'red'}>
                                <IconX/>
                            </ActionIcon>
                        }
                        <ActionIcon size={"lg"}>
                            <IconSearch/>
                        </ActionIcon>
                    </Group>
                </Stack>
                <Stack gap={5}>
                    <Text>Controls</Text>
                    <Group>
                        <Button
                            onClick={() => setOpenModal(true)}
                            leftSection={<IconPlus/>}>
                            Add
                        </Button>
                        <Button
                            onClick={() => fetchProductItems()}
                            leftSection={<IconRefresh/>}>
                            Refresh
                        </Button>
                    </Group>
                </Stack>
            </Group>
            <CommonTable height={'70dvh'} data={productItem ? productItem.product_items : []} columns={columns}/>

            <ManagerProductDetailsModal product_id={product.id} refresh={fetchProductItems} open={openModal} product_details={selectedProductItem} close={handleCloseModal} />
        </Stack>
    )
}