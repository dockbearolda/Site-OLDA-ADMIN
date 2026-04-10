import { signOut } from "@/auth";

export default function LogoutPage() {
  return (
    <main style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: "1rem" }}>
      <p>Cliquez pour vous déconnecter :</p>
      <form action={async () => {
        "use server";
        await signOut({ redirectTo: "/login" });
      }}>
        <button type="submit" style={{ padding: "0.75rem 2rem", fontSize: "1rem", cursor: "pointer" }}>
          Se déconnecter
        </button>
      </form>
    </main>
  );
}
