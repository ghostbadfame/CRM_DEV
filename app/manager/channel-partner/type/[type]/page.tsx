"use client";
import ChannelPartnerTable from "@/components/data-table/channelPartnerTable";
import { useParams } from "next/navigation";
import React from "react";

export default function ChannelPartnersList() {
  const { type } = useParams();

  return <ChannelPartnerTable type={type} />;
}
