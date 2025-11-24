// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/db";

// export const runtime = "nodejs"; // if you use Prisma/Node APIs

// export async function GET(
//   _req: NextRequest,
//   context: { params: Promise<{ code: string }> }
// ) {
//   const { code } = await context.params;

//   const link = await prisma.link.findUnique({ where: { code } });
//   if (!link || link.deletedAt) {
//     return NextResponse.json({ error: "Not found" }, { status: 404 });
//   }

//   // example: redirect to targetUrl
//   return NextResponse.redirect(link.targetUrl, 302);
// }
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ code: string }> } // 👈 Next 16 expects a Promise
) {
  const { code } = await ctx.params; // 👈 await it

  // reserved paths
  if (code === "healthz" || code === "api" || code === "code") {
    return NextResponse.next();
  }

  const link = await prisma.link.findFirst({
    where: { code, deletedAt: null },
  });

  if (!link) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.link.update({
    where: { id: link.id },
    data: { totalClicks: { increment: 1 }, lastClicked: new Date() },
  });

  return NextResponse.redirect(link.targetUrl, { status: 302 });
}
