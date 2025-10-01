export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <main className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Kanji Test App
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Learn and test your kanji knowledge
          </p>
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
            <p className="text-gray-700">
              Welcome to your kanji learning journey!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
