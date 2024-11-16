"use client";
import { ChannelPartner } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "../ui/button";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  ArrowUpDown,
  CakeSlice,
  CakeSliceIcon,
  MoreHorizontal,
} from "lucide-react";
import { startOfDay, startOfToday } from "date-fns";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type ClientChannelPartner = ChannelPartner;

export const channelPartnerTableCol: ColumnDef<ClientChannelPartner>[] = [
  {
    accessorKey: "channelPartnerNo",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Partner no.
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const channelPartnerNo: string = row.getValue("channelPartnerNo");
      const birthday = startOfDay(new Date(row.original.birthday)).getTime();
      const anniversary = startOfDay(
        new Date(row.original.weddingAnniversary)
      ).getTime();
      const today = startOfToday().getTime();

      const showChip = birthday == today || anniversary == today;

      let chip = null;

      if (showChip) {
        chip = (
          <span
            className="text-xs relative bottom-2 text-black bg-yellow-500 rounded-md px-1 py-[.5px] border h-min flex items-center gap-1 truncate"
            title={birthday == today ? "Birthday" : "Anniversary"}
          >
            {birthday == today ? "Bir." : "Ann."} <CakeSliceIcon width={12} />
          </span>
        );
      }
      return (
        <div className="relative flex gap-2">
          <Button variant={"link"} className="p-0">
            <Link href={"/manager/channel-partner/" + channelPartnerNo}>
              {channelPartnerNo}
            </Link>
          </Button>
          {chip}
        </div>
      );
    },
    filterFn: "fuzzy",
  },
  {
    accessorKey: "fullName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const name: string = row.getValue("fullName");
      const channelPartnerNo: string = row.getValue("channelPartnerNo");
      return (
        <Button variant={"link"} asChild className="p-0">
          <Link href={"/manager/channel-partner/" + channelPartnerNo}>
            {name}
          </Link>
        </Button>
      );
    },
    filterFn: "fuzzy",
  },
  {
    accessorKey: "contact",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Contact
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    filterFn: "fuzzy",
  },
  {
    accessorKey: "userType",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          User Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const partner = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(partner.contact)}
            >
              Copy contact
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link
                href={"/channelPartner/" + partner.channelPartnerNo}
                className="p-0 m-0"
              >
                View Lead
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
