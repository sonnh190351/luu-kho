import {Modal} from "@mantine/core";

interface ExportInventoryModalProps {
    open: boolean;
    refresh: any;
    close: any;
}


export default function ExportInventoryModal({open, close}: ExportInventoryModalProps) {
    return (
        <Modal opened={open} onClose={close} centered={true}>
        </Modal>
    )
}