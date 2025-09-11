export default function TestStaticPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Static Test Page</h1>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <p>This is a static page to test if Next.js is working properly.</p>
          <p>If you can see this, Next.js is rendering correctly.</p>
          <p>Timestamp: {new Date().toISOString()}</p>
        </div>
      </div>
    </div>
  )
}
