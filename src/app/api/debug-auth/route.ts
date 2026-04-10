import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return NextResponse.json({
    sessionEmail: session?.user?.email ?? null,
    isAdmin: session?.user?.isAdmin ?? false,
    adminEmailsCount: adminEmails.length,
    adminEmailsMatch: adminEmails.includes((session?.user?.email ?? "").toLowerCase()),
    // Masqué pour sécurité : on montre juste les longueurs et premiers caractères
    adminEmailsPreview: adminEmails.map(e => e.slice(0, 4) + "***"),
  });
}
