import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/container";

import styles from "./layout.module.css";

export const metadata = {
  title: "Mon Compte",
};

export default async function MonCompteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className={styles.root}>
      <nav className={styles.nav}>
        <Container>
          <div className={styles.navInner}>
            <Link href="/" className={styles.brand}>OLDA</Link>
            <div className={styles.navLinks}>
              <Link href="/mon-compte/commandes" className={styles.navLink}>
                Mes commandes
              </Link>
              <Link href="/catalogue" className={styles.navLink}>
                Catalogue
              </Link>
              {session.user?.isAdmin && (
                <Link href="/admin" className={styles.adminLink}>
                  ⚙ Administration
                </Link>
              )}
              <form action="/api/auth/signout" method="POST">
                <button type="submit" className={styles.signoutBtn}>
                  Déconnexion
                </button>
              </form>
            </div>
          </div>
        </Container>
      </nav>

      <main className={styles.main}>
        <Container>
          <div className={styles.welcome}>
            <p className={styles.welcomeText}>
              Bonjour, <strong>{session.user?.name ?? session.user?.email}</strong>
            </p>
          </div>
          {children}
        </Container>
      </main>
    </div>
  );
}
