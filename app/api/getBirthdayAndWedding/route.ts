import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { endOfDay, startOfDay } from "date-fns";

export async function GET() {
  try {
    const user = await getServerSession();
    if (!user) {
      return NextResponse.json({ message: "authentication required!!" });
    }
    console.log(user?.user.email + " is trying to get all Channel Partnerss! 👮🏾");

    const birthdayData = await db.channelPartner.findMany({
        where:{
            OR: [
                {
                    weddingAnniversary: {
                        gte: startOfDay(new Date()),
                        lte: endOfDay(new Date()),
                        not: {
                          equals: new Date(new Date().setHours(18, 30, 0, 0)),
                        },
                      },
                },
                {
                  birthday: {
                    gte: startOfDay(new Date()),
                    lte: endOfDay(new Date()),
                    not: {
                      equals: new Date(new Date().setHours(18, 30, 0, 0)),
                    },
                  },
                },
              ],
           
        },
      select:{
        fullName       :true,                                                     
        channelPartnerNo  :true,
        channelPartnerId  :true,
        createdAt    :true,
        followupDate:true,
        updatedAt  :true,
        lastDate    :true,
        address :true,
        city:true,
        contact    :true,
        altContact  :true,
        birthday:true,
        weddingAnniversary:true,
        userType:true,
        assignTo:true,
        employee_id:true,
        email:true
      },
    });

    return NextResponse.json(
      { data: birthdayData, message: "Birthday and  fetched Successfully " },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: error }, { status: 500 });
  }
}
