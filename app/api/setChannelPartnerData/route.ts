import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ChannelPartnerSchema } from "@/types/types.td";
import { getServerSession } from "next-auth";
import { z } from "zod";

type ChannelPartnerFormData = z.infer<typeof ChannelPartnerSchema>;

export async function PATCH(req: Request) {
  try {
    const body: ChannelPartnerFormData = await req.json();
    const {
      fullName,
      contact,
      altContact,
      address,
      city,
      userType,
      weddingAnniversary,
      firm,
      birthday,
      status,
      assignTo,
      followupDate,
      email,
    } = ChannelPartnerSchema.parse(body);

    const user = await getServerSession();
    if (!user) {
      return NextResponse.json({ message: "authentication required!!" });
    }
    console.log(user?.user.email + " is trying to update Channel Partner! 👮🏾");

    const { searchParams } = new URL(req.url);
    const channelPartnerNo = searchParams.get("channelPartnerNo");

    if (!channelPartnerNo) {
      throw new Error("Channel Partner number required!");
    }

    const user_id = await db.user.findUnique({
      where: {
        empNo: assignTo,
        //Enter email fetched from cookies
      },
      select: {
        id: true,
        empNo: true,
        username: true,
      },
    });

    const id = user_id?.id!;
    const name = user_id?.username;
    const dateString = new Date();
    const newDate = dateString.toISOString();
    console.log(followupDate)
    const newchannelPartner = await db.channelPartner.update({
      where: {
        channelPartnerNo: channelPartnerNo!!,
      },
      data: {
        fullName,
        contact,
        altContact: altContact!!,
        address,
        city,
        userType: userType!!,
        weddingAnniversary,
        email,
        firm,
        birthday,
        status,
        followupDate: followupDate!!,
        assignTo,
        employee_id: id,
        assignToDate: newDate!!,
      },
    });
    return NextResponse.json(
      {
        new: newchannelPartner,
        message: "Channel Partner updated successfully with followupDate",
      },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: error }, { status: 500 });
  }
}
