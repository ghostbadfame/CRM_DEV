import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";

export async function GET() {
  try {
    const user = await getServerSession();
    if (!user) {
      return NextResponse.json({ message: "authentication required!!" });
    }
    console.log(user?.user.email + " is trying to get Marketing Employee 👮🏾");

// Fetch marketing employees
const marketingEmpNames = await db.user.findMany({
  where: {
    userType: "marketing",
    NOT: [{ password: "1234" }]
  },
  select: {
    username: true,
  }
});

return NextResponse.json(
  {
    data: marketingEmpNames,
    message: "Marketing employees names fetched successfully",
  },
  { status: 200 }
);

  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: error }, { status: 500 });
  }
}
