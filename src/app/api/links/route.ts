// app/api/links/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createLinkSchema } from "@/lib/validators";
import { generateCode } from "@/lib/code";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createLinkSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { targetUrl, code } = parsed.data;
    const finalCode = code ?? generateCode(6);

    const link = await prisma.link.create({ data: { code: finalCode, targetUrl } });
    return NextResponse.json(link, { status: 201 });
  } catch (err: any) {
    // If "code" is unique in your Prisma schema, this catches races
    if (err?.code === "P2002") {
      return NextResponse.json({ error: "Code already exists" }, { status: 409 });
    }
    console.error("POST /api/links:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const links = await prisma.link.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(links, { status: 200 });
  } catch (err) {
    console.error("GET /api/links:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
