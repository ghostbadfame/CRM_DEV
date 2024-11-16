import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";

export async function GET(request: Request) {
  try {
    const user = await getServerSession();
    if (!user) {
      return NextResponse.json({ message: "authentication required!!" });
    }
    console.log(
      user?.user.email + " is trying to get Channel Partners Data! 👮🏾"
    );

    // Query the database for each user type and store the counts
    const userTypes = ["Architect", "BNI", "Contractor", "Builder"];
    const userTypeCounts = new Map<string, number>();

    for (const userType of userTypes) {
      const count = await db.channelPartner.count({
        where: {
          userType: userType,
        },
      });
      // Store the count in the Map
      userTypeCounts.set(userType, count || 0);
    }

    return NextResponse.json(
      {
        data: Object.fromEntries(userTypeCounts.entries()),
        message: "channelPartner fetched Successfully ",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: error }, { status: 500 });
  }
}
