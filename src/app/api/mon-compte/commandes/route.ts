import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getCommandesByEmail } from "@/lib/strapi";

export async function GET() {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const commandes = await getCommandesByEmail(session.user.email);
  return NextResponse.json({ commandes });
}
