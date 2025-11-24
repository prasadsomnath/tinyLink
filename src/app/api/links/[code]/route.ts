// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/db";

// export async function GET(_: Request, { params }: { params: { code: string } }) {
//   const link = await prisma.link.findFirst({
//     where: { code: params.code, deletedAt: null },
//   });
//   if (!link) return NextResponse.json({ error: "Not found" }, { status: 404 });
//   return NextResponse.json(link, { status: 200 });
// }

// export async function DELETE(_: Request, { params }: { params: { code: string } }) {
//   const link = await prisma.link.findFirst({
//     where: { code: params.code, deletedAt: null },
//   });
//   if (!link) return NextResponse.json({ error: "Not found" }, { status: 404 });

//   await prisma.link.update({
//     where: { id: link.id },
//     data: { deletedAt: new Date() },
//   });
//   return NextResponse.json({ ok: true }, { status: 200 });
// }
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ code: string }> } // 👈
) {
  const { code } = await ctx.params; // 👈
  const link = await prisma.link.findFirst({
    where: { code, deletedAt: null },
  });
  if (!link) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(link, { status: 200 });
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ code: string }> } // 👈
) {
  const { code } = await ctx.params; // 👈
  const link = await prisma.link.findFirst({
    where: { code, deletedAt: null },
  });
  if (!link) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.link.update({
    where: { id: link.id },
    data: { deletedAt: new Date() },
  });
  return NextResponse.json({ ok: true }, { status: 200 });
}
