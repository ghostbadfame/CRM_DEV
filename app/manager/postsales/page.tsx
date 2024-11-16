"use client";
import EmployeeTable from "@/components/data-table/employeeTable";
import Loading from "@/components/loading";
import React from "react";
import { toast } from "sonner";
import useSWR from "swr";

const fetcher = async (url: string) => {
  const response = await fetch(url);
  const data = await response.json();
  return data.data;
};

export default function Engineers() {
  const { data, isLoading, error } = useSWR(
    "/api/getEmployeeDept?dept=postsales",
    fetcher
  );

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    toast.error("failed to fetch Post Sales!!");
  }
  return <EmployeeTable data={data || []} desc={"Data of Post Sales."} />;
}
