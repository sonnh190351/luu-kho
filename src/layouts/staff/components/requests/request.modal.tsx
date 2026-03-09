import {Modal} from "@mantine/core";

interface RequestModalProps {
    open: boolean;
    refresh: any;
    close: any;
}


export default function StaffRequestModal({open, close, refresh}: RequestModalProps) {
    return (
        <Modal opened={open} onClose={close}></Modal>
    )
}