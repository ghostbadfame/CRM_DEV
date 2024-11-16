import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ReactNode } from "react";

export default function DashboardCard({
  title,
  desc,
  icon,
  progress,
  textColor,
  href,
}: {
  title: string;
  desc: string;
  progress: number;
  textColor?: string;
  icon?: ReactNode;
  href: string;
}) {
  return (
    <Link href={href} className="md:w-[180px] flex-1">
      <Card className={cn("text-center", textColor)}>
        <CardHeader>
          <CardTitle>
            <div className="grid place-items-center md:text-lg text-base">
              <div className="md:text-lg text-base">{title}</div>
              {icon && <span>{icon}</span>}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="w-full font-bold md:text-5xl text-4xl flex gap-2 justify-center">
          <div>{progress}</div>
        </CardContent>
        {desc && (
          <CardDescription className="pb-2 capitalize">{desc}</CardDescription>
        )}
      </Card>
    </Link>
  );
}
