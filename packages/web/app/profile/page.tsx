'use client'

import { useState } from 'react'
import Link from 'next/link'
import { User, Building2, Save } from 'lucide-react'

type ProfileType = 'freelancer' | 'agency' | 'both'

interface FreelancerProfile {
  name: string
  title: string
  yearsExperience: string
  skills: string
  portfolio: string
  bio: string
}

interface AgencyProfile {
  agencyName: string
  agencySize: string
  yearsInBusiness: string
  specializations: string
  website: string
  description: string
}

export default function ProfilePage() {
  const [profileType, setProfileType] = useState<ProfileType>('freelancer')
  const [freelancerData, setFreelancerData] = useState<FreelancerProfile>({
    name: '',
    title: '',
    yearsExperience: '',
    skills: '',
    portfolio: '',
    bio: '',
  })
  const [agencyData, setAgencyData] = useState<AgencyProfile>({
    agencyName: '',
    agencySize: '',
    yearsInBusiness: '',
    specializations: '',
    website: '',
    description: '',
  })
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    // In a real app, this would save to a database/API
    console.log('Saving profile:', { profileType, freelancerData, agencyData })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-upwork-black text-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-upwork-green">
              Proposals Mastery AI
            </Link>
            <nav className="flex gap-6">
              <Link href="/templates" className="hover:text-upwork-green transition-colors">
                Templates
              </Link>
              <Link href="/profile" className="text-upwork-green border-b-2 border-upwork-green pb-1">
                Profile
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-upwork-black mb-2">Your Profile</h1>
          <p className="text-upwork-medium-gray">
            Set up your profile information to personalize your proposals
          </p>
        </div>

        {/* Profile Type Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-upwork-black mb-4">Profile Type</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={() => setProfileType('freelancer')}
              className={`p-4 rounded-lg border-2 transition-all ${
                profileType === 'freelancer' || profileType === 'both'
                  ? 'border-upwork-green bg-green-50'
                  : 'border-upwork-light-gray hover:border-upwork-green'
              }`}
            >
              <User className={`w-8 h-8 mx-auto mb-2 ${
                profileType === 'freelancer' || profileType === 'both' 
                  ? 'text-upwork-green' 
                  : 'text-upwork-medium-gray'
              }`} />
              <div className="font-semibold text-upwork-black">Freelancer</div>
            </button>
            <button
              onClick={() => setProfileType('agency')}
              className={`p-4 rounded-lg border-2 transition-all ${
                profileType === 'agency' || profileType === 'both'
                  ? 'border-upwork-green bg-green-50'
                  : 'border-upwork-light-gray hover:border-upwork-green'
              }`}
            >
              <Building2 className={`w-8 h-8 mx-auto mb-2 ${
                profileType === 'agency' || profileType === 'both' 
                  ? 'text-upwork-green' 
                  : 'text-upwork-medium-gray'
              }`} />
              <div className="font-semibold text-upwork-black">Agency</div>
            </button>
            <button
              onClick={() => setProfileType('both')}
              className={`p-4 rounded-lg border-2 transition-all ${
                profileType === 'both'
                  ? 'border-upwork-green bg-green-50'
                  : 'border-upwork-light-gray hover:border-upwork-green'
              }`}
            >
              <div className="flex justify-center gap-2 mb-2">
                <User className={`w-6 h-6 ${
                  profileType === 'both' ? 'text-upwork-green' : 'text-upwork-medium-gray'
                }`} />
                <Building2 className={`w-6 h-6 ${
                  profileType === 'both' ? 'text-upwork-green' : 'text-upwork-medium-gray'
                }`} />
              </div>
              <div className="font-semibold text-upwork-black">Both</div>
            </button>
          </div>
        </div>

        {/* Freelancer Profile Form */}
        {(profileType === 'freelancer' || profileType === 'both') && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-upwork-black mb-6 flex items-center gap-2">
              <User className="w-6 h-6 text-upwork-green" />
              Freelancer Information
            </h2>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-upwork-black mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={freelancerData.name}
                    onChange={(e) => setFreelancerData({ ...freelancerData, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full px-4 py-2 border-2 border-upwork-light-gray rounded-lg focus:border-upwork-green focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-upwork-black mb-2">
                    Professional Title
                  </label>
                  <input
                    type="text"
                    value={freelancerData.title}
                    onChange={(e) => setFreelancerData({ ...freelancerData, title: e.target.value })}
                    placeholder="Full Stack Developer"
                    className="w-full px-4 py-2 border-2 border-upwork-light-gray rounded-lg focus:border-upwork-green focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-upwork-black mb-2">
                    Years of Experience
                  </label>
                  <input
                    type="text"
                    value={freelancerData.yearsExperience}
                    onChange={(e) => setFreelancerData({ ...freelancerData, yearsExperience: e.target.value })}
                    placeholder="5+"
                    className="w-full px-4 py-2 border-2 border-upwork-light-gray rounded-lg focus:border-upwork-green focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-upwork-black mb-2">
                    Portfolio URL
                  </label>
                  <input
                    type="url"
                    value={freelancerData.portfolio}
                    onChange={(e) => setFreelancerData({ ...freelancerData, portfolio: e.target.value })}
                    placeholder="https://yourportfolio.com"
                    className="w-full px-4 py-2 border-2 border-upwork-light-gray rounded-lg focus:border-upwork-green focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-upwork-black mb-2">
                  Skills (comma-separated)
                </label>
                <input
                  type="text"
                  value={freelancerData.skills}
                  onChange={(e) => setFreelancerData({ ...freelancerData, skills: e.target.value })}
                  placeholder="React, Node.js, TypeScript, Python"
                  className="w-full px-4 py-2 border-2 border-upwork-light-gray rounded-lg focus:border-upwork-green focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-upwork-black mb-2">
                  Professional Bio
                </label>
                <textarea
                  value={freelancerData.bio}
                  onChange={(e) => setFreelancerData({ ...freelancerData, bio: e.target.value })}
                  placeholder="Brief description of your experience and expertise..."
                  rows={4}
                  className="w-full px-4 py-2 border-2 border-upwork-light-gray rounded-lg focus:border-upwork-green focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Agency Profile Form */}
        {(profileType === 'agency' || profileType === 'both') && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-upwork-black mb-6 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-upwork-green" />
              Agency Information
            </h2>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-upwork-black mb-2">
                    Agency Name
                  </label>
                  <input
                    type="text"
                    value={agencyData.agencyName}
                    onChange={(e) => setAgencyData({ ...agencyData, agencyName: e.target.value })}
                    placeholder="Your Agency Name"
                    className="w-full px-4 py-2 border-2 border-upwork-light-gray rounded-lg focus:border-upwork-green focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-upwork-black mb-2">
                    Agency Size
                  </label>
                  <input
                    type="text"
                    value={agencyData.agencySize}
                    onChange={(e) => setAgencyData({ ...agencyData, agencySize: e.target.value })}
                    placeholder="e.g., 10-50 employees"
                    className="w-full px-4 py-2 border-2 border-upwork-light-gray rounded-lg focus:border-upwork-green focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-upwork-black mb-2">
                    Years in Business
                  </label>
                  <input
                    type="text"
                    value={agencyData.yearsInBusiness}
                    onChange={(e) => setAgencyData({ ...agencyData, yearsInBusiness: e.target.value })}
                    placeholder="3+"
                    className="w-full px-4 py-2 border-2 border-upwork-light-gray rounded-lg focus:border-upwork-green focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-upwork-black mb-2">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={agencyData.website}
                    onChange={(e) => setAgencyData({ ...agencyData, website: e.target.value })}
                    placeholder="https://youragency.com"
                    className="w-full px-4 py-2 border-2 border-upwork-light-gray rounded-lg focus:border-upwork-green focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-upwork-black mb-2">
                  Specializations (comma-separated)
                </label>
                <input
                  type="text"
                  value={agencyData.specializations}
                  onChange={(e) => setAgencyData({ ...agencyData, specializations: e.target.value })}
                  placeholder="Web Development, Mobile Apps, UI/UX Design"
                  className="w-full px-4 py-2 border-2 border-upwork-light-gray rounded-lg focus:border-upwork-green focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-upwork-black mb-2">
                  Agency Description
                </label>
                <textarea
                  value={agencyData.description}
                  onChange={(e) => setAgencyData({ ...agencyData, description: e.target.value })}
                  placeholder="Brief description of your agency and services..."
                  rows={4}
                  className="w-full px-4 py-2 border-2 border-upwork-light-gray rounded-lg focus:border-upwork-green focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            className="bg-upwork-green text-white px-8 py-3 rounded-lg font-semibold hover:bg-upwork-green-dark transition-colors flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            Save Profile
          </button>
          {saved && (
            <span className="text-upwork-green font-semibold">
              ✓ Profile saved successfully!
            </span>
          )}
        </div>
      </main>
    </div>
  )
}
