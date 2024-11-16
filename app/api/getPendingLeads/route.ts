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

    // const { searchParams } = new URL(request.url);

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("empId");

    console.log(employeeId);
    const userType = searchParams.get("userType");

    console.log(userType);

    const leadData = await db.lead.findMany({
      where: {
        NOT: [
          {
            clientStatus: "Lost",
          },
        ],
        OR: [
          {
            followupDate: {
              gte: startOfDay(new Date()),
              lte: endOfDay(new Date()),
            },
          },
          {
            assignToDate: {
              gte: startOfDay(new Date()),
              lte: endOfDay(new Date()),
            },
          },
        ],
        employee_id: employeeId!!,
        status: "pending",
      },
      select: {
        fullName: true,
        leadNo: true,
        contact: true,
        clientStatus: true,
        siteStage: true,
        priority: true,
        altContact: true,
        address: true,
        city: true,
        leadSource: true,
        lastDate: true,
        actualSource: true,
        salesPerson: true,
        followupDate: true,
        assignTo: true,
        updatedAt: true,
        createdAt: true,
        lead_id: true,
        status: true,
        handoverDate:true,
        bookingDate:true,
        store:true
      },
    });

    return NextResponse.json(
      { leadData, message: "Date Fetched Successfully " },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: error }, { status: 500 });
  }
}
