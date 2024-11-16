"use client";
import {
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
  Row,
  RowData,
  RowModel,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "./button";
import { useEffect, useRef, useState } from "react";
import { PRIORITY, CLIENT_STATUS, cn } from "@/lib/utils";
import { X } from "lucide-react";
import { RankingInfo, rankItem } from "@tanstack/match-sorter-utils";
import { Input } from "./input";
import { DatePickerWithRange } from "./calendar-range";
import { DateRange } from "react-day-picker";
import { DownloadIcon } from "@radix-ui/react-icons";
import { mkConfig, generateCsv, download as fileDownload } from "export-to-csv";
import { ClientAssignedLead } from "../data-table/totalLeadsTodayTableCol";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  dateRange?: Boolean;
  date?: Date | null;
  caption?: string;
  noFilters?: Boolean;
  download?: Boolean;
}

declare module "@tanstack/table-core" {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
    isWithinRange: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

export const isWithinRange: FilterFn<any> = (
  row,
  columnId,
  value: DateRange
) => {
  let dateToCheck: Date;
  
  switch (columnId) {
    case 'followupDate':
      dateToCheck = new Date(row.getValue("followupDate"));
      break;
    case 'assignToDate':
      dateToCheck = new Date(row.getValue("assignToDate"));
      break;
    case 'createdAt':
      dateToCheck = new Date(row.getValue("createdAt"));
      break;
    default:
      return false;
  }

  const { from, to } = value;

  // If there's no date in the row and either from or to is set, return false
  if ((from || to) && !dateToCheck) return false;

  // Check if the date falls within the specified range
  if (from && !to) {
    const fromDate = new Date(from.setHours(0, 0, 0, 0));
    const checkDate = new Date(dateToCheck.setHours(0, 0, 0, 0));
    return checkDate.getTime() === fromDate.getTime();
  } else if (!from && to) {
    const toDate = new Date(to.setHours(0, 0, 0, 0));
    const checkDate = new Date(dateToCheck.setHours(0, 0, 0, 0));
    return checkDate.getTime() === toDate.getTime();
  } else if (from && to) {
    const fromDate = new Date(from.setHours(0, 0, 0, 0));
    const toDate = new Date(to.setHours(23, 59, 59, 999));
    return (
      dateToCheck.getTime() >= fromDate.getTime() &&
      dateToCheck.getTime() <= toDate.getTime()
    );
  }
  
  return true;
};

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // Store the itemRank info
  addMeta({
    itemRank,
  });

  // Return if the item should be filtered in/out
  return itemRank.passed;
};

const csvConfig = mkConfig({
  fieldSeparator: ",",
  decimalSeparator: ".",
  useKeysAsHeaders: true,
});

export function DataTable<TData, TValue>({
  columns,
  data,
  dateRange = false,
  date,
  noFilters = false,
  download = false,
  caption,
}: DataTableProps<TData, TValue>) {
  const tableRef = useRef(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    updatedAt: false,
    followupDate: false,
    assignToDate: false,
    leadSource: false,
    actualSource: false,
    createdAt:false,
  });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [clientStatusFilterValue, setClientStatusFilterValue] = useState<
    string | undefined
  >(undefined);
  const [priorityFilterValue, setPriorityFilterValue] = useState<
    string | undefined
  >(undefined);

  const table = useReactTable({
    data,
    columns,
    filterFns: {
      isWithinRange: isWithinRange,
      fuzzy: fuzzyFilter,
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    renderFallbackValue: [],
    state: { sorting, columnFilters, globalFilter, columnVisibility },
    initialState: {
      pagination: {
        pageSize: 7,
      },
      columnVisibility: {
        updatedAt: false,
        followupDate: false,
        assignToDate: false,
        leadSource: false,
        actualSource: false,
        createdAt:false,
      },
    },
  });

  if (data) console.log("data received by table!");

  function handleSetFilter(name: string, value: string) {
    switch (name) {
      case "clientStatus":
        table.getColumn("clientStatus")?.setFilterValue(value);
        setClientStatusFilterValue(value);
        break;
      case "priority":
        table.getColumn("priority")?.setFilterValue(value);
        setPriorityFilterValue(value);
        break;
      default:
        break;
    }
  }

  function handleDateSelect(date: DateRange) {
    table.getColumn("followupDate")?.setFilterValue(date);
    table.getColumn("assignToDate")?.setFilterValue(date);

  }

  function handleCreationDateSelect(date: DateRange) {
    table.getColumn("createdAt")?.setFilterValue(date);
  }

  const handleExportRows = (rows: Row<ClientAssignedLead>[]) => {
    const rowData = rows.map((row) => row.original);
    const csv = generateCsv(csvConfig)(rowData);
    fileDownload(csvConfig)(csv);
  };

  return (
    <>
      <div className="flex justify-between py-2">
        {noFilters ? (
          ""
        ) : (
          <div className="flex space-x-2">
            <Select
              onValueChange={(value) => handleSetFilter("clientStatus", value)}
              value={clientStatusFilterValue}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Client Status" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(CLIENT_STATUS).map((status: string) => (
                  <SelectItem value={status} key={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              onValueChange={(value) => handleSetFilter("priority", value)}
              value={priorityFilterValue}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(PRIORITY).map((priority: string) => (
                  <SelectItem value={priority} key={priority}>
                    {priority}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex flex-row">
              <span className="px-2 items-center my-3"> FollowUp :</span>
              {dateRange && (
                <DatePickerWithRange
                  initialDate={date && { from: date, to: undefined }}
                  selectHandler={handleDateSelect}
                  className={"w-min"}
                />
              )}
            </div>
            <div className="flex flex-row">
          <span className="px-2 items-center my-3">Creation Date:</span>
          {dateRange && (
            <DatePickerWithRange
              initialDate={date && { from: date, to: undefined }}
              selectHandler={handleCreationDateSelect}
              className="w-min"
            />
          )}
        </div>

            <Button
              variant={"outline"}
              size={"icon"}
              onClick={() => {
                table.getColumn("priority")?.setFilterValue("");
                setClientStatusFilterValue("");
                table.getColumn("clientStatus")?.setFilterValue("");
                setPriorityFilterValue("");
                handleDateSelect({ from: undefined, to: undefined });
                handleCreationDateSelect({ from: undefined, to: undefined });
              }}
            >
              <X />
            </Button>
          </div>
        )}
        <div className="flex gap-2">
          <Button
            size={"icon"}
            variant={"outline"}
            className="aspect-square"
            title="export data"
            disabled={!data || data.length == 0}
            onClick={() =>
              handleExportRows(table.getPrePaginationRowModel().rows)
            }
          >
            <DownloadIcon />
          </Button>
          <DebouncedInput
            placeholder="search all columns"
            value={globalFilter ?? ""}
            onChange={(value) => setGlobalFilter(String(value))}
          />
        </div>
      </div>
      <div className="border">
        <Table ref={tableRef}>
          {caption ? (
            <TableCaption className="text-left m-2">{caption}</TableCaption>
          ) : null}
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4 px-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </>
  );
}

// A debounced input react component
function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value, debounce, onChange]);

  return (
    <Input
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
