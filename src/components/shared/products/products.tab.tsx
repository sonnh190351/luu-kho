import {
    ActionIcon,
    Button, Divider,
    Group,
    LoadingOverlay,
    Stack,
    Text,
    TextInput,
    Title,
} from "@mantine/core";
import {useEffect, useState} from "react";
import {NotificationsService} from "../../../services/notifications/notifications.service.ts";
import OperationService from "../../../services/operations/operationService.ts";
import {IconEdit, IconInfoCircle, IconPlus, IconRefresh, IconSearch, IconTrash, IconX} from "@tabler/icons-react";
import ProductModal from "./products.modal.tsx";
import ProductDetailsTab from "./product.details.tsx";
import CommonTable from "../../dataTable/common.table.tsx";
import type {DataTableColumn} from "mantine-datatable";
import dayjs from "dayjs";
import {DatabaseTables, DISPLAY_TIME_FORMAT} from "../../../enums/tables.ts";
import {InformationService} from "../../../services/notifications/information.service.ts";
import {BUTTON_COLOR} from "../../../enums/styling.ts";

export default function ProductsTabs() {
    const [isLoading, setIsLoading] = useState(false);

    const [keyword, setKeyword] = useState("");

    const [openModal, setOpenModal] = useState(false);

    const [product, setProduct] = useState<any>(undefined);

    const [productDetails, setProductDetails] = useState<any>(undefined);

    const [products, setProducts] = useState<any[]>([]);

    const columns: DataTableColumn[] = [
        {
            accessor: "id",
            title: "ID",
            width: 120,
            sortable: true,
            render: ({id}: any) => {
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
            render: ({name}: any) => {
                return <Group>{name}</Group>;
            },
        },
        {
            accessor: "created_at",
            title: "Created At",
            sortable: true,
            width: 250,
            render: ({created_at}: any) => {
                return (
                    <Group>
                        {dayjs(created_at).format(DISPLAY_TIME_FORMAT)}
                    </Group>
                );
            },
        },

        {
            accessor: "actions",
            title: "Actions",
            width: 160,
            render: ({id}: any) => {
                return (
                    <Group>
                        <ActionIcon
                            color={BUTTON_COLOR.PRIMARY}
                            onClick={() => handleDelete(id)}
                            size={"lg"}>
                            <IconTrash/>
                        </ActionIcon>
                        <ActionIcon
                            color={BUTTON_COLOR.PRIMARY}
                            size={"lg"}
                            onClick={() => handleEdit(id)}>
                            <IconEdit/>
                        </ActionIcon>
                        <ActionIcon
                            color={BUTTON_COLOR.PRIMARY}
                            size={"lg"}
                            onClick={() => handleViewInfo(id)}>
                            <IconInfoCircle/>
                        </ActionIcon>
                    </Group>
                );
            },
        },
    ]

    useEffect(() => {
        (async () => await fetchProducts())();
    }, []);

    function handleDelete(id: number) {
        InformationService.getInstance().confirm(async () => {
            try {
                const service = OperationService.getInstance();
                await service.deleteById(DatabaseTables.Products, id);
                NotificationsService.success(
                    "Delete Products",
                    `Product ${id} has been deleted!`,
                );
            } catch (e: any) {
                NotificationsService.error("Delete Product", e.toString());
            }
            await fetchProducts();
        });
    }

    function handleEdit(id: number) {
        const matching = products.find((p: any) => p.id === id);
        if (matching) {
            setProduct(matching);
            setOpenModal(true);
        }
    }

    function handleViewInfo(id: number) {
        const matching = products.find((p: any) => p.id === id);
        if (matching) {
            setProductDetails(matching);
        }
    }

    async function fetchProducts() {
        setIsLoading(true)
        try {
            const service = OperationService.getInstance()
            const data = await service.getProductsItems()
            setProducts(data)
        } catch (e: any) {
            NotificationsService.error("Fetch products", e.toString());
        }
        setIsLoading(false)
    }

    function handleSearchByName(e: any) {
        setKeyword(e.target.value)
        let tempData = localStorage.getItem(DatabaseTables.Products);
        if(!tempData) {
            tempData =  JSON.stringify(products)
            localStorage.setItem(DatabaseTables.Products, tempData);
        }

        const temp = JSON.parse(tempData);

        const matching = temp.filter((p: any) => p.name.toLowerCase().startsWith(e.target.value.toLowerCase()));
        setProducts(matching)
    }

    async function handleClearSearch() {
        setKeyword("");
        await fetchProducts()
    }

    function handleCloseModal() {
        setOpenModal(false);
        setTimeout(() => {
            setProduct(undefined)
        }, 200)
    }

    return (
        <Stack pt={"lg"} pl={"sm"}>
            <LoadingOverlay
                visible={isLoading}
                overlayProps={{radius: "sm", blur: 2}}
            />
            <Stack gap={0}>
                <Text>Management</Text>
                <Title>Products Data</Title>
            </Stack>
            <Divider/>
            {
                productDetails ? <ProductDetailsTab product={productDetails} close={() => {
                    setProductDetails(undefined);
                }}/> : <>
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
                                <ActionIcon
                                    color={BUTTON_COLOR.PRIMARY}
                                    size={"lg"}>
                                    <IconSearch/>
                                </ActionIcon>
                            </Group>
                        </Stack>
                        <Stack gap={5}>
                            <Text>Controls</Text>
                            <Group>
                                <Button
                                    color={BUTTON_COLOR.PRIMARY}
                                    onClick={() => setOpenModal(true)}
                                    leftSection={<IconPlus/>}>
                                    Add
                                </Button>
                                <Button
                                    color={BUTTON_COLOR.PRIMARY}
                                    onClick={() => fetchProducts()}
                                    leftSection={<IconRefresh/>}>
                                    Refresh
                                </Button>
                            </Group>
                        </Stack>
                    </Group>
                    <CommonTable data={products} columns={columns}/>
                </>
            }
            <ProductModal refresh={fetchProducts} product={product} open={openModal} close={handleCloseModal}/>
        </Stack>
    )
}