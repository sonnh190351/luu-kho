import type { DataTableColumn } from "mantine-datatable";

export interface DataTableProps {
    data: any[];
    columns: DataTableColumn[];
    height?: string | number;
}
