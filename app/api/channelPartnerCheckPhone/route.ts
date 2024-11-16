import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";

export async function GET(req: Request) {
  try {
    const user = await getServerSession();
    if (!user) {
      return NextResponse.json({ message: "authentication required!!" });
    }
    console.log(user?.user.email + " is trying to verify phone no 👮🏾");

    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");
    if (!searchParams.has("phone") || !phone) {
      return NextResponse.json({
        message: "phone no is required!",
        status: 500,
      });
    }

    const cp = await db.channelPartner.findUnique({
      where: {
        contact: phone,
      },
      select: {
        channelPartnerNo: true,
        fullName: true,
        employee_id: true,
      },
    });

    if (cp != null) {
      const employee = await db.user.findFirst({
        where: {
          id: cp.employee_id,
        },
        select: {
          empNo: true,
          username: true,
          userType: true,
        },
      });
      if (employee == null) {
        throw new Error("could not find the user!");
      }
      return NextResponse.json(
        {
          exists: true,
          lead: { ...cp, ...employee },
          message: "Channel Partner verified!",
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          exists: false,
          cp,
          message: "contact verified!",
        },
        { status: 200 }
      );
    }
  } catch (error) {
    return NextResponse.json({ message: error }, { status: 500 });
  }
}
