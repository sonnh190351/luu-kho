import type {DataTableColumn, DataTableRowExpansionProps} from "mantine-datatable";

export interface DataTableProps {
    data: any[];
    columns: DataTableColumn[];
    height?: string | number;
    rowExpansion?: DataTableRowExpansionProps
}
