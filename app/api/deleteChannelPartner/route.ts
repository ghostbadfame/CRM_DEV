import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";

export async function DELETE(req: Request) {
  try {
    const user = await getServerSession();
    if (!user) {
      return NextResponse.json(
        { message: "Authentication required!" },
        { status: 401 }
      );
    }

    console.log(user?.user.email + " is trying to delete Channel Partner! 👮🏾");

    const { searchParams } = new URL(req.url);
    const channelPartnerNo = searchParams.get("channelPartnerNo");

    if (!channelPartnerNo) {
      return NextResponse.json(
        { message: "Channel Partner number required!" },
        { status: 400 }
      );
    }

    // First check if the channel partner exists
    const existingPartner = await db.channelPartner.findUnique({
      where: {
        channelPartnerNo: channelPartnerNo,
      },
    });

    if (!existingPartner) {
      return NextResponse.json(
        { message: "Channel Partner not found!" },
        { status: 404 }
      );
    }

    await db.channelPartnerRemark.deleteMany({
      where: {
        channelPartnerNo: channelPartnerNo,
      },
    });

    // Delete the channel partner
    await db.channelPartner.delete({
      where: {
        channelPartnerNo: channelPartnerNo,
      },
    });

    return NextResponse.json(
      {
        message: "Channel Partner deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting channel partner:", error);
    return NextResponse.json(
      {
        message: "Failed to delete channel partner",
        error: error instanceof Error ? error.message : "Unknown error occurred"
      },
      { status: 500 }
    );
  }
}