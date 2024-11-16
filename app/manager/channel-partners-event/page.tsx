"use client";
import useSWR from "swr";
import { DataTable } from "../../../components/ui/data-table";
import { toast } from "sonner";
import { Icons } from "../../../components/icons";
import { useSession } from "next-auth/react";
import { channelPartnerTableCol } from "../../../components/data-table/channelPartnerTableCol";

const fetcher = async (url: string) => {
  const response = await fetch(url);
  const data = await response.json();
  return data.data;
};

function ChannelPartnerTable() {
  const { data: session } = useSession();
  const { data, error, isLoading } = useSWR(
    session?.user &&
      `/api/getBirthdayAndWedding?empId=${session?.user.userId}&userType=${session?.user.userType}`,
    fetcher
  );

  console.log(session);

  if (error) {
    toast("⚠️ failed to fetch channel partners!!");
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center">
        {<Icons.spinner className="animate-spin" />}
      </div>
    );
  }

  return (
    <DataTable
      columns={channelPartnerTableCol}
      data={data || []}
      noFilters={true}
      caption="List of all channel Partners with birthday or anniversary!"
    />
  );
}

export default ChannelPartnerTable;
