"use client";
import DashboardCard from "@/components/dashboard/dashboard-card";
import ChannelPartnerTable from "@/components/data-table/channelPartnerTable";
import { GrUserWorker } from "react-icons/gr";
import { MdArchitecture } from "react-icons/md";
import { FaHandshake } from "react-icons/fa";
import { HiMiniBuildingOffice2 } from "react-icons/hi2";

import React from "react";
import useSWR from "swr";

const fetcher = async (url: string) => {
  const response = await fetch(url);
  const { data } = await response.json();
  return data;
};

export default function ChannelPartnersList() {
  const { data, isLoading, error } = useSWR(
    "/api/getNoOfChannelPartners",
    fetcher
  );

  return (
    <div className="flex flex-col gap-4 justify-center">
      <div className="grid grid-cols-2 lg:grid-cols-4 md:gap-8 gap-2 w-full md:place-items-center">
        <DashboardCard
          href="channel-partner/type/Architect"
          title={"Architects"}
          desc="total architects"
          icon={<MdArchitecture size={30} />}
          progress={data?.Architect | 0}
        />
        <DashboardCard
          href="channel-partner/type/BNI"
          title={"BNI"}
          desc="total BNI"
          icon={<FaHandshake size={30} />}
          progress={data?.BNI | 0}
        />
        <DashboardCard
          href="channel-partner/type/Builder"
          title={"Builders"}
          desc="total builders"
          icon={<HiMiniBuildingOffice2 size={30} />}
          progress={data?.Builder | 0}
        />
        <DashboardCard
          href="channel-partner/type/Contractor"
          title={"Contractor"}
          desc="total contractors"
          icon={<GrUserWorker size={30} />}
          progress={data?.Contractor | 0}
        />
      </div>
      <div>
        <ChannelPartnerTable />
      </div>
    </div>
  );
}
