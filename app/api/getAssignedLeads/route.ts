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

    const leadData = await db.lead.findMany({
      where: {
        NOT: [{ clientStatus: "Lost" }],
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
        actualSource: true,
        salesPerson: true,
        assignToDate: true,
        followupDate: true,
        updatedAt: true,
        createdAt: true,
        lastDate: true,
        lead_id: true,
        status: true,
        engineerTask: true,
        technicianTask: true,
        afterSaleService: true,
        handoverDate: true,
        bookingDate: true,
        store:true
      },
    });

    console.log(`...${employeeId?.slice(-4)} is fetching leads!`);
    return NextResponse.json(
      { leadData, message: "Date Fetched Successfully " },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: error }, { status: 500 });
  }
}
