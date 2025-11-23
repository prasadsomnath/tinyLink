import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: { code: string } }) {
  const code = params.code;

  if (code === "healthz" || code === "api" || code === "code") {
    return NextResponse.next();
  }

  const link = await prisma.link.findFirst({
    where: { code, deletedAt: null },
  });

  if (!link) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
    // alternatively: return NextResponse.redirect("/", 302) to go home
  }

  await prisma.link.update({
    where: { id: link.id },
    data: { totalClicks: { increment: 1 }, lastClicked: new Date() },
  });

  return NextResponse.redirect(link.targetUrl, { status: 302 });
}
