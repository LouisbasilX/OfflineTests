// app/page.tsx
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-bold mb-6 text-accent">
          OfflineTests
        </h1>
        <p className="text-xl text-gray-300 mb-10">
          A volatile, secure, offline-first exam environment for educators and students.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="text-2xl font-semibold mb-3">For Teachers</h3>
            <p className="text-gray-400 mb-4">Create encrypted tests that expire automatically.</p>
            <Link href="/editor" className="text-accent hover:underline">
              Launch Editor →
            </Link>
          </div>
          
          <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="text-2xl font-semibold mb-3">For Students</h3>
            <p className="text-gray-400 mb-4">Take exams securely with offline support.</p>
            <Link href="/exam" className="text-accent hover:underline">
              Enter Exam Room →
            </Link>
          </div>
          
          <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="text-2xl font-semibold mb-3">For Admins</h3>
            <p className="text-gray-400 mb-4">Monitor system health and metrics.</p>
            <Link href="/admin" className="text-accent hover:underline">
              Admin Dashboard →
            </Link>
          </div>
        </div>
        
        <div className="text-sm text-gray-500">
          <p>All tests are end-to-end encrypted and automatically deleted after expiration.</p>
          <p>No data is stored permanently. Privacy by design.</p>
        </div>
      </div>
    </div>
  )
}