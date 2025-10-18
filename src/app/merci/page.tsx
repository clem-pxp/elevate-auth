export default function MerciPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 text-center">
      <h1 className="text-4xl font-bold">Merci pour votre inscription !</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Votre compte est maintenant actif.
      </p>
      <div className="mt-8">
        <p>Téléchargez l'application pour commencer :</p>
        {/* Les liens vers les app stores (deeplinks) viendront ici */}
      </div>
    </main>
  );
}

