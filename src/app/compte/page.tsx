export default function ComptePage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold">Gestion de votre compte</h1>
        <p className="mt-2 text-muted-foreground">
          Modifiez vos informations et gérez votre abonnement.
        </p>

        <div className="mt-8">
          {/* Les informations du profil et le bouton vers le portail Stripe viendront ici */}
          <p>Section de gestion de l'abonnement...</p>
        </div>
      </div>
    </main>
  );
}

