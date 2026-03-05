import {Modal} from "@mantine/core";

interface WarehouseItemModalProps {
    item: any,
    close: any,
    refresh: any,
    open: boolean,
}

export default function WarehouseItemModal({item, open, close, refresh}: WarehouseItemModalProps) {


    return (
        <Modal
            opened={open}
            onClose={close}
            centered
            title={"Get Warehouse Item"}>

        </Modal>
    )
}