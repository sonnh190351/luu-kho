import {Modal} from "@mantine/core";

interface StaffExportInventoryModalProps {
    open: boolean;
    refresh: any;
    close: any;
}


export default function StaffExportInventoryModal({open, close, refresh}: StaffExportInventoryModalProps) {
    return (
        <Modal opened={open} onClose={close} centered={true}>
        </Modal>
    )
}