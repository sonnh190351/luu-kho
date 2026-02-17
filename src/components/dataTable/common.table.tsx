import type { DataTableProps } from "./table.types.ts";
import { DataTable } from "mantine-datatable";
import { useEffect, useState } from "react";
import sortBy from "lodash/sortBy";

const PAGE_SIZE = 15;

export default function CommonTable({ data, columns }: DataTableProps) {
    const [sortStatus, setSortStatus] = useState<any>({
        direction: "desc",
    });

    const [page, setPage] = useState(1);

    const [records, setRecords] = useState(sortBy(data, "id"));

    useEffect(() => {
        const inputData = sortBy(data, sortStatus.columnAccessor);

        const from = (page - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE;

        const initialData =
            sortStatus.direction === "asc" ? inputData.reverse() : inputData;

        setRecords(initialData.slice(from, to));
    }, [sortStatus, data]);

    return (
        <DataTable
            height={"75dvh"}
            style={{
                width: "100%",
            }}
            idAccessor={"id"}
            sortStatus={sortStatus}
            onSortStatusChange={setSortStatus}
            withTableBorder
            borderRadius="sm"
            totalRecords={records.length}
            recordsPerPage={PAGE_SIZE}
            page={page}
            onPageChange={(p) => setPage(p)}
            withColumnBorders
            striped
            highlightOnHover
            columns={columns}
            records={records}
        />
    );
}
