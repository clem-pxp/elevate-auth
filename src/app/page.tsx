import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <div className="w-full max-w-md rounded-lg border bg-card p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-card-foreground">
          Navigation du Projet Elevate-Auth
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Utilisez ces liens pour accéder aux différentes pages.
        </p>
        <ul className="mt-6 space-y-3 text-left">
          <li>
            <Link
              href="/auth/inscription"
              className="block rounded-md p-3 text-sm font-medium transition-colors hover:bg-muted"
            >
              ➡️ Page d'Inscription (/auth/inscription)
            </Link>
          </li>
          <li>
            <Link
              href="/auth/connexion"
              className="block rounded-md p-3 text-sm font-medium transition-colors hover:bg-muted"
            >
              ➡️ Page de Connexion (/auth/connexion)
            </Link>
          </li>
          <li>
            <Link
              href="/compte"
              className="block rounded-md p-3 text-sm font-medium transition-colors hover:bg-muted"
            >
              ➡️ Page Compte (/compte)
            </Link>
          </li>
          <li>
            <Link
              href="/merci"
              className="block rounded-md p-3 text-sm font-medium transition-colors hover:bg-muted"
            >
              ➡️ Page de Remerciement (/merci)
            </Link>
          </li>
        </ul>
      </div>
    </main>
  );
}