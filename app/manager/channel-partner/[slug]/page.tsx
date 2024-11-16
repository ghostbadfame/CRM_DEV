"use client";
import useSWR, { mutate } from "swr";
import DashboardCard from "@/components/dashboard/dashboard-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";
import Loading from "@/components/loading";
import { redirect, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import useSWRMutation from "swr/mutation";
import { format } from "date-fns";
import { ChannelPartnerSchema } from "@/types/types.td";
import {
  ErrorDialogContextType,
  useErrorDialog,
} from "@/components/ui/error-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FieldErrors, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CHANNEL_PARTNER_TYPES, cn } from "@/lib/utils";
import * as z from "zod";
import RemarksList from "@/components/remarks-list";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Switch } from "@/components/ui/switch";
import CustomCalendar from "@/components/ui/custom-calendar";
import { toast } from "sonner";

type ChannelPartnerFormData = z.infer<typeof ChannelPartnerSchema>;

const fetcher: any = async (url: string) => {
  const response = await fetch(url);
  const data = response.json();
  return data;
};

const updateUserDetails = async (
  url: string,
  {
    arg,
  }: {
    arg: { formData: any; channelPartnerNo: string };
  }
): Promise<any> => {
  const finalUrl = `${url}?channelPartnerNo=${arg.channelPartnerNo}`;
  const response = await fetch(finalUrl, {
    method: "PATCH",
    body: JSON.stringify(arg.formData),
  });
  return response;
};

const postRequest = async (
  url: string,
  {
    arg,
  }: {
    arg: { formData: any; channelPartnerNo: string };
  }
): Promise<any> => {
  const finalUrl = `${url}?channelPartnerNo=${arg.channelPartnerNo}`;
  const response = await fetch(finalUrl, {
    method: "POST",
    body: JSON.stringify(arg.formData),
  });
  return response;
};

const deleteChannelPartner = async (url: string): Promise<any> => {
  const response = await fetch(url, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete channel partner");
  }

  return response;
};

function ChannelPartner() {
  const params = useParams();
  let assignToOptions: ReactNode | null = null;
  const form = useForm<ChannelPartnerFormData>({
    resolver: zodResolver(ChannelPartnerSchema),
    defaultValues: {
      altContact: "",
      fullName: "",
      contact: "",
      address: "",
      city: "",
      email: "",
      followupDate: "",
      firm: "",
      assignTo: "",
      weddingAnniversary: "",
      birthday: "",
      userType: "",
      status: "",
    },
  });
  const [editMode, setEditMode] = useState(false);
  const { data: session } = useSession();
  const { showDialog } = useErrorDialog() as ErrorDialogContextType;

  const { data: managers } = useSWR("/api/getmanagersName", fetcher);

  const {
    data: remarks,
    isLoading: remarksLoading,
    error: remarksError,
  } = useSWR(
    "/api/getchannelPartnerRemark?channelPartnerNo=" + params.slug,
    fetcher
  );

  const {
    data: channelPartnerData,
    isLoading: channelPartnerDataLoading,
    error: channelPartnerDataError,
  } = useSWR(
    "/api/getChannelPartnerData?channelPartnerNo=" + params.slug,
    fetcher
  );

  const {
    data: channelPartnerLeads,
    isLoading: channelPartnerLeadsLoading,
    error: channelPartnerLeadsError,
  } = useSWR(
    "/api/getChannelPartnerLeads?channelPartnerNo=" + params.slug,
    fetcher
  );

  const {
    trigger: updateUserDetailsTrigger,
    isMutating: isMutatingUserDetails,
  } = useSWRMutation("/api/setChannelPartnerData", updateUserDetails);

  const { trigger: deletePartner, isMutating: isDeleting } = useSWRMutation(
    `/api/deleteChannelPartner?channelPartnerNo=${params.slug}`,
    deleteChannelPartner
  );

  const handleDelete = async () => {
    try {
      if (confirm("Are you sure you want to delete this channel partner?")) {
        await deletePartner();
        toast.success("Channel partner deleted successfully!");
        showDialog("Success", "Deleted succsesfully!!", true);
      }
    } catch (error) {
      const err = error as Error;
      showDialog("Error", err.message || "Failed to delete channel partner");
    }
  };

  const { trigger: addRemark, isMutating: isMutatingAddRemark } =
    useSWRMutation("/api/addChannelPartnerRemark", postRequest);

  useEffect(() => {
    if (channelPartnerData && managers) {
      const {
        fullName,
        contact,
        altContact,
        address,
        city,
        email,
        followupDate,
        firm,
        assignTo,
        weddingAnniversary,
        birthday,
        userType,
        status,
      } = channelPartnerData?.channelPartner;
      form.reset({
        fullName: fullName,
        contact: contact,
        city: city || "",
        firm: firm || "",
        userType: userType,
        email: email || "",
        birthday: birthday,
        weddingAnniversary: weddingAnniversary,
        altContact: altContact || "",
        address: address || "",
        status: status,
        followupDate: followupDate,
        assignTo: assignTo,
      });
    }
  }, [channelPartnerData, managers]);

  if (!session?.user) {
    return <Loading />;
  }

  if (managers) {
    assignToOptions = managers?.data?.map((value: any) => {
      return (
        <SelectItem value={value.empNo} key={value.empNo}>
          <div className={"flex justify-between gap-2"}>
            <span>{value.empNo}</span>
            <span>{value.username}</span>
            <span className="capitalize">{value.userType}</span>
          </div>
        </SelectItem>
      );
    });
  }

  if (session.user.userType != "manager") {
    redirect("/");
  }
  function getNextDayISOString(selectedDate: Date) {
    try {
      const currentDate = new Date(selectedDate);
      const nextDate = new Date(currentDate);
      nextDate.setDate(currentDate.getDate() + 1);
      nextDate.setUTCHours(0, 0, 0, 0);
      const isoString = nextDate.toISOString();

      return isoString;
    } catch (error) {
      throw new Error("Invalid date value");
    }
  }

  const onSubmit = async (data: ChannelPartnerFormData) => {
    console.log("submit things");

    const response = await updateUserDetailsTrigger({
      formData: {
        ...data,
        birthday: data.birthday || null,
        weddingAnniversary: data.weddingAnniversary || null,
      },
      channelPartnerNo: params.slug as string,
    });

    if (response.ok) {
      const responseRemark = await addRemark({
        formData: {
          remark: data.remark,
          channelPartnerNo: params.slug as string,
        },
        channelPartnerNo: params.slug as string,
      });

      if (responseRemark.ok) {
        form.resetField("remark", { defaultValue: "" });
        mutate("/api/getchannelPartnerRemark?channelPartnerNo=" + params.slug);
      }
      showDialog("Success", "Successfully updated user data!", true);
    } else {
      const errors = response?.message?.errors?.map(
        (error: any) => error.message
      );
      showDialog("Error", errors?.join(","));
    }
  };

  const onError = async (error: FieldErrors<ChannelPartnerFormData>) => {
    console.log(error);
  };

  return (
    <div className="md:p-8 p-2 justify-center items-center gap-8 flex">
      <div className="flex-col w-full justify-center items-center gap-4 inline-flex">
        {channelPartnerDataLoading && <Loading />}
        <div className="flex justify-between w-full">
          <div className="text-3xl w-full font-semibold">Total leads</div>
          <div className="flex flex-col-reverse md:flex-row  items-end md:justify-end gap-2 w-full">
            <Label
              htmlFor="edit-mode"
              className="text-xs md:text-base text-secondary-foreground"
            >
              Edit Mode
            </Label>
            <Switch
              id="edit-mode"
              checked={editMode}
              onCheckedChange={(val) => {
                setEditMode(val);
              }}
            />
          </div>
        </div>
        <div className="flex gap-8 w-full justify-between">
          <DashboardCard
            href=""
            title={"Total"}
            desc="leads added!"
            progress={channelPartnerLeads?.leadsCount || 0}
          />
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onError)}
            className="w-full"
          >
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-4">
              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input
                          disabled={!editMode}
                          placeholder="Full name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="assignTo"
                  render={({ field }) => {
                    return (
                      <FormItem defaultValue={field.value}>
                        <FormLabel>Assign To*</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Employee" />
                            </SelectTrigger>
                            <SelectContent>{assignToOptions}</SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>

              <div className="flex gap-2 items-end">
                <FormField
                  control={form.control}
                  name="contact"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Phone no. *</FormLabel>
                      <FormControl>
                        <Input
                          disabled={!editMode}
                          type="tel"
                          placeholder="Contact"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex gap-2 items-end">
                <FormField
                  control={form.control}
                  name="altContact"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Alt Contact no.</FormLabel>
                      <FormControl>
                        <Input
                          disabled={!editMode}
                          type="tel"
                          placeholder="Contact"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="firm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Firm</FormLabel>
                      <FormControl>
                        <Input
                          disabled={!editMode}
                          type="text"
                          placeholder="Firm/Company"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status*</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger
                            className={
                              field.value &&
                              (field.value == "done"
                                ? "bg-green-500"
                                : "bg-red-500")
                            }
                          >
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="done">Done</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input
                          disabled={!editMode}
                          type="text"
                          placeholder="Address"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input
                          disabled={!editMode}
                          type="text"
                          placeholder="City"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          disabled={!editMode}
                          type="email"
                          placeholder="Email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="birthday"
                  render={({ field }) => (
                    <CustomCalendar
                      label="Birthday"
                      disabled={!editMode}
                      readMode={!editMode}
                      date={field.value}
                      onDateChange={(value) =>
                        field.onChange(getNextDayISOString(new Date(value)))
                      }
                      dateFormat={"MMMM do"}
                    />
                  )}
                />
              </div>

              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="weddingAnniversary"
                  render={({ field }) => (
                    <CustomCalendar
                      label="Wedding Anniversary"
                      date={field.value}
                      onDateChange={(value) => {
                        field.onChange(getNextDayISOString(new Date(value)));
                      }}
                      disabled={!editMode}
                      dateFormat={"MMMM do"}
                    />
                  )}
                />
              </div>

              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="followupDate"
                  render={({ field }) => (
                    <CustomCalendar
                      label="Followup Date"
                      date={field.value}
                      onDateChange={(value) => {
                        field.onChange(getNextDayISOString(new Date(value)));
                      }}
                    />
                  )}
                />
              </div>

              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="userType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Partner type *</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={!editMode}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Partner Type" />
                          </SelectTrigger>
                          <SelectContent>
                            {CHANNEL_PARTNER_TYPES.map((v) => (
                              <SelectItem value={v} key={v}>
                                {v}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-2 md:col-span-2">
                <FormField
                  control={form.control}
                  name="remark"
                  defaultValue=""
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remark *</FormLabel>
                      <FormControl>
                        <Textarea id="remark" placeholder="remark" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex gap-4 place-items-start mb-3">
                <Button type="submit" id="sales">
                  Submit
                </Button>
                <Button
                  variant="destructive"
                  className="w-fit"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
        <div className="w-full">
          {remarks?.data && <RemarksList remarks={remarks.data || []} />}
        </div>
      </div>
    </div>
  );
}

export default ChannelPartner;
