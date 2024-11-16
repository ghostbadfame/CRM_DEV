import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";

export async function PATCH(req: Request) {
  try {

    const da = null;
    const loc = "GMS road Dehradun"
    // Fetch all leads with store value as "GMS road Dehradun"
    const leadsToUpdate = await db.lead.findMany({
      where: {
        OR:[
          {
            store:da
          },{
            store:loc
          }
        ]
       
      },
      select: {
        leadNo: true,  // Select leadNo to use for updating each lead
      },
    });

    // Filter out any leads with a null leadNo
    const validLeads = leadsToUpdate.filter((lead) => lead.leadNo !== null);

    // Update each lead's store field to "Dehradun"
    await Promise.all(
      validLeads.map(async (lead) => {
        await db.lead.update({
          where: { leadNo: lead.leadNo as string },
          data: { store: "Dehradun" },
        });
      })
    );

    console.log("Store names updated to 'Dehradun' for all applicable leads");

    return NextResponse.json(
      { message: "Store names updated successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: error }, { status: 500 });
  }
}
