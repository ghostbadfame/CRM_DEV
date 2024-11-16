import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { endOfDay, startOfDay } from "date-fns";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions); //it works on passing headers in fetch

    if (!session?.user) {
      return NextResponse.json(
        { message: "Authentication required!" },
        { status: 200 }
      );
    }

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("empId");

    console.log(`...${employeeId?.slice(-4)} is fetching ChannelPartner count!`);


    const doneChannelPartnerCount = await db.channelPartner.count({
      where: {
        
          
        OR: [
          {
            followupDate: {
               gte: startOfDay(new Date()),
              lte: endOfDay(new Date()),
              not: {
                equals: new Date(new Date().setHours(18, 30, 0, 0)),
              },
            },
          },
          {
            assignToDate: {
               gte: startOfDay(new Date()),
              lte: endOfDay(new Date()),
              not: {
                equals: new Date(new Date().setHours(18, 30, 0, 0)),
              },
            },
          },
        ],
         
        employee_id: employeeId!!,
        status: "done",
      },
    });

    const pendingChannelPartnerCount = await db.channelPartner.count({
        where: {
        
          
          OR: [
            {
              followupDate: {
                 gte: startOfDay(new Date()),
                lte: endOfDay(new Date()),
                not: {
                  equals: new Date(new Date().setHours(18, 30, 0, 0)),
                },
              },
            },
            {
              assignToDate: {
                 gte: startOfDay(new Date()),
                lte: endOfDay(new Date()),
                not: {
                  equals: new Date(new Date().setHours(18, 30, 0, 0)),
                },
              },
            },
          ],
         
        employee_id: employeeId!!,
        status: "pending",
      },
    });

    const totalChannelPartnerCount = await db.channelPartner.count({
        where: {
          OR: [
            {
              followupDate: {
                 gte: startOfDay(new Date()),
                lte: endOfDay(new Date()),
                not: {
                  equals: new Date(new Date().setHours(18, 30, 0, 0)),
                },
              },
            },
            {
              assignToDate: {
                 gte: startOfDay(new Date()),
                lte: endOfDay(new Date()),
                not: {
                  equals: new Date(new Date().setHours(18, 30, 0, 0)),
                },
              },
            },
          ],
        employee_id: employeeId!!,
      },
    });

    return NextResponse.json(
      {
        total: totalChannelPartnerCount,
        done: doneChannelPartnerCount,
        pending: pendingChannelPartnerCount,
        message: "Date Fetched Successfully ",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: error }, { status: 500 });
  }
}
