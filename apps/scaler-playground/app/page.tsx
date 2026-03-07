import { PlaygroundDemo } from "@/components/playground-demo";

export default function PlaygroundPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-900">
        <h1 className="text-xl font-semibold">Scaler Playground</h1>
        <p className="text-sm text-gray-500">Pan, zoom, and scroll with momentum, bounce, and snapping.</p>
      </header>
      <div className="p-6">
        <PlaygroundDemo />
      </div>
    </main>
  );
}
