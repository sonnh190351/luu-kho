import {Modal} from "@mantine/core";
import {useForm} from "@mantine/form";
import {useEffect} from "react";

interface ProductModalProps {
    product: any,
    open: boolean,
    close: any
}

interface ProductModalForm {
    name: string,
}

export default function ProductModal({product, open, close}: ProductModalProps) {

    const form = useForm<ProductModalForm>({
        initialValues: {
            name: ""
        }
    })

    useEffect(() => {
        if(product) {
            form.setValues({})
        }
    }, []);

    return (
        <Modal opened={open} onClose={close} centered={true}>
            <form>

            </form>
        </Modal>
    )
}
