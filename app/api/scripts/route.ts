import { db } from "@/lib/db";
import { startOfDay as SOTD, endOfDay as EOTD } from "date-fns";
import { start } from "repl";

export const dynamic = "force-dynamic"; // static by default, unless reading the request

export async function GET(request: Request) {
  const today = new Date();

  const startOfDay = SOTD(today);
  const endOfDay = EOTD(today);
  const currentDate = new Date();
  const nextDate = new Date();
  nextDate.setDate(currentDate.getDate());
  nextDate.setUTCHours(0, 0, 0, 0);
  console.log(startOfDay);
  console.log(nextDate);
  try {
   const gg = await db.channelPartner.updateMany({
    where:{
        assignTo:"Bharat Birla"
    },
    data:{
        assignTo:"EMP001"
    }
   })

    return new Response("🟢 Moved date followupdate and changed status", {
      status: 200,
    });
  } catch (error) {
    return new Response("🔴 Cron job failed!");
  }
}
