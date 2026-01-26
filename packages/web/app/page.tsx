import Link from 'next/link'
import { FileText, User, Chrome } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-upwork-black text-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-upwork-green">Proposals Mastery AI</h1>
            <nav className="flex gap-6">
              <Link href="/templates" className="hover:text-upwork-green transition-colors">
                Templates
              </Link>
              <Link href="/profile" className="hover:text-upwork-green transition-colors">
                Profile
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-upwork-black mb-6">
            Win More Upwork Projects with AI-Powered Proposals
          </h2>
          <p className="text-xl text-upwork-medium-gray mb-12">
            Create custom proposal templates, manage your freelancer profile, and generate 
            winning cover letters instantly with our browser extension.
          </p>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {/* Templates Feature */}
            <div className="bg-white border-2 border-upwork-light-gray rounded-lg p-8 hover:border-upwork-green transition-all hover:shadow-lg">
              <div className="flex justify-center mb-4">
                <div className="bg-upwork-green rounded-full p-4">
                  <FileText className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-upwork-black mb-4">
                Proposal Templates
              </h3>
              <p className="text-upwork-medium-gray mb-6">
                Create and manage reusable proposal templates tailored to your expertise and services.
              </p>
              <Link 
                href="/templates"
                className="inline-block bg-upwork-green text-white px-6 py-3 rounded-lg font-semibold hover:bg-upwork-green-dark transition-colors"
              >
                Manage Templates
              </Link>
            </div>

            {/* Profile Feature */}
            <div className="bg-white border-2 border-upwork-light-gray rounded-lg p-8 hover:border-upwork-green transition-all hover:shadow-lg">
              <div className="flex justify-center mb-4">
                <div className="bg-upwork-green rounded-full p-4">
                  <User className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-upwork-black mb-4">
                Your Profile
              </h3>
              <p className="text-upwork-medium-gray mb-6">
                Set up your freelancer or agency information to personalize your proposals.
              </p>
              <Link 
                href="/profile"
                className="inline-block bg-upwork-green text-white px-6 py-3 rounded-lg font-semibold hover:bg-upwork-green-dark transition-colors"
              >
                Edit Profile
              </Link>
            </div>

            {/* Extension Feature */}
            <div className="bg-white border-2 border-upwork-light-gray rounded-lg p-8 hover:border-upwork-green transition-all hover:shadow-lg">
              <div className="flex justify-center mb-4">
                <div className="bg-upwork-green rounded-full p-4">
                  <Chrome className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-upwork-black mb-4">
                Browser Extension
              </h3>
              <p className="text-upwork-medium-gray mb-6">
                Analyze Upwork job postings and generate cover letters instantly while browsing.
              </p>
              <button 
                className="inline-block bg-upwork-medium-gray text-white px-6 py-3 rounded-lg font-semibold hover:bg-upwork-dark-gray transition-colors cursor-not-allowed"
                disabled
              >
                Coming Soon
              </button>
            </div>
          </div>

          {/* How It Works */}
          <div className="mt-20 text-left">
            <h3 className="text-3xl font-bold text-upwork-black mb-8 text-center">How It Works</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-upwork-green text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-upwork-black mb-2">Create Your Templates</h4>
                  <p className="text-upwork-medium-gray">
                    Build customizable proposal templates with placeholders for job-specific information.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-upwork-green text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-upwork-black mb-2">Set Up Your Profile</h4>
                  <p className="text-upwork-medium-gray">
                    Add your skills, experience, and information as a freelancer or agency.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-upwork-green text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-upwork-black mb-2">Use the Extension</h4>
                  <p className="text-upwork-medium-gray">
                    Browse Upwork jobs and generate tailored cover letters with one click using your templates.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-upwork-black text-white mt-20 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-upwork-light-gray">
            © 2024 Proposals Mastery AI. Create winning proposals for Upwork.
          </p>
        </div>
      </footer>
    </div>
  )
}
