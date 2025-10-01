import KanjiTest from "./components/KanjiTest";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <main className="container mx-auto px-4 py-8">
        <KanjiTest />
      </main>
    </div>
  );
}
