import {Modal} from "@mantine/core";

interface RequestModalProps {
    open: boolean;
    refresh: any;
    close: any;
}


export default function StaffRequestModal({open, close}: RequestModalProps) {
    return (
        <Modal opened={open} onClose={close}></Modal>
    )
}