import KanjiTest from "./components/KanjiTest";

export default function Home() {
  return (
    <div className="h-screen bg-gradient-to-b from-blue-50 to-white overflow-hidden print:from-white">
      <main className="h-full">
        <KanjiTest />
      </main>
    </div>
  );
}
