export const dynamic = "force-static";

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold mb-2">You are offline</h1>
        <p className="text-muted-foreground mb-4">
          This page is available offline. Try reconnecting to access live data.
        </p>
        <button
          className="inline-flex items-center rounded-md border px-3 py-2 text-sm"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    </main>
  );
}