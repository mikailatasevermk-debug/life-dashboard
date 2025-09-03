"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Download, Share2, Edit, Mail, Phone, MapPin, 
  Globe, Calendar, Building, GraduationCap, Award,
  Languages, Star, ChevronRight, ExternalLink
} from "lucide-react"

interface CVViewerProps {
  variant?: 'full' | 'compact'
}

const PROFILE_DATA = {
  personalInfo: {
    name: "Mikail Odabas",
    title: "International Account Manager",
    tagline: "Languages | Communication | Sales | International ✈️ | Creativity | CryptoEnthusiast",
    location: "Enschede, Overijssel, Netherlands",
    phone: "+31648438146",
    email: "mikailodabas@hotmail.com",
    linkedin: "www.linkedin.com/in/mikail-odabas-48987725",
    summary: "Working at Dipasa Europe BV. At Dipasa Europe BV, I work daily with seeds, kernels, and oils and am proud to be part of a company with extensive expertise in these products. We not only offer high-quality products but also possess in-depth knowledge of the market and the latest industry developments. Whether you're looking for specific products or advice on trends and innovations in the sector, I'm here to help."
  },
  
  experience: [
    {
      company: "Dipasa Europe B.V.",
      position: "International Account Manager",
      duration: "November 2024 - Present (11 months)",
      location: "Enschede, Overijssel, Netherlands",
      description: "From Enschede, the Netherlands (close to Germany). We supply whole Europe with our products. Working with bakery seeds, kernels and oils including Flaxseed, Pumpkin Kernels, Macadamia Oil (refined, extra virgin), Avocado Oil (refined, extra virgin), Chia, Sunflower Kernels, Blue Poppy Seed.",
      current: true
    },
    {
      company: "Teleperformance",
      position: "BCO employee",
      duration: "September 2020 - August 2022 (2 years)",
      location: "Almere, Flevoland, Netherlands", 
      description: "In this crucial role for Covid-19 I am fulling the emergent need for communication with indexes and contacts to prevent further escalation of the disaster. This project is setup by GGD GHOR NEDERLAND. Daily tasks: Crucial communication with index, and contacts, Interview on phone, Documenting the interview in a system, Advice and recommendation.",
      current: false
    },
    {
      company: "Islamic Relief Nederland",
      position: "Marketing Communication Assistant", 
      duration: "October 2019 - June 2020 (9 months)",
      location: "Amsterdam Area, Netherlands",
      description: "My main responsibilities were among the tasks of relationship builder with the external parties for partnering with an activity. Support in media & Design with Adobe Photoshop, Video recording & editing, Adobe illustrator to make flyers, interviews, short videos, photo editing, and creating templates. As well as in creating new ideas that is up to date with todays trends in regard to campaigns.",
      current: false
    },
    {
      company: "Spillz B.V.",
      position: "International digital marketing graduating student",
      duration: "January 2019 - October 2019 (10 months)",
      location: "Overijssel, Netherlands",
      description: "The research that was held for Spillz Group gives insights for the company in terms of a suitable international online marketing strategy for an SME in an international environment that can attract leads. Research inherited: Internal & external research, Website infrastructure possibilities and opportunities, Online trends, Online competitor analysis, SWOT analysis & strategy.",
      current: false
    },
    {
      company: "IKEA Group",
      position: "Ikea logistics",
      duration: "July 2018 - April 2019 (10 months)", 
      location: "Hengelo",
      description: "Logistic departments. Responsibilities: execution of movement of goods, inventory control, supporting customers. What I liked the most: Effective communication for improving working methods, Communication with customers, Helping/supporting customers.",
      current: false
    },
    {
      company: "Wood & Soul",
      position: "International Business Development (internship)",
      duration: "August 2016 - January 2017 (6 months)",
      location: "Denpasar Area, Bali, Indonesia", 
      description: "International packaging policy development for designer teak wood items company.",
      current: false
    }
  ],

  education: [
    {
      institution: "Saxion Hogeschool Enschede",
      degree: "Bachelor's degree, International Business",
      duration: "2015 - 2020",
      type: "University"
    },
    {
      institution: "Universidad de Lima", 
      degree: "Bachelor's degree, International Business",
      duration: "2017 - 2018",
      type: "Exchange"
    }
  ],

  skills: {
    languages: [
      { name: "Turkish", level: "Native" },
      { name: "Dutch", level: "Native" }, 
      { name: "English", level: "Professional" },
      { name: "Spanish", level: "Limited Working" }
    ],
    technical: [
      "Social Media", "CRM", "Adobe Apps", "Sales", "Marketing", 
      "Business Development", "Supply Chain", "Communication"
    ]
  },

  certifications: [
    "Intensive Spanish language course",
    "OCW studentlab doorstroom mbo-hbo"
  ],

  quote: "Human resources are like natural resources; They're often buried deep. You have to go looking for them, They're not just lying around on the surface. You have to create the circumstances Where they show themselves. ~ Sir Ken Robinson ~"
}

export function CVViewer({ variant = 'full' }: CVViewerProps) {
  const [activeSection, setActiveSection] = useState<string>('experience')

  const downloadCV = () => {
    // In a real implementation, this would generate and download a PDF
    const link = document.createElement('a')
    link.href = 'data:text/plain;charset=utf-8,CV Download would happen here'
    link.download = 'Mikail_Odabas_CV.pdf'
    link.click()
  }

  const shareCV = () => {
    navigator.share?.({
      title: 'Mikail Odabas - CV',
      text: 'Check out my professional profile',
      url: PROFILE_DATA.personalInfo.linkedin
    }) || navigator.clipboard.writeText(PROFILE_DATA.personalInfo.linkedin)
  }

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white/70 rounded-xl p-4 border border-gray-200"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">📄 My CV</h3>
          <div className="flex gap-2">
            <button
              onClick={downloadCV}
              className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={shareCV}
              className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="text-center">
          <h4 className="font-bold text-lg text-gray-800">{PROFILE_DATA.personalInfo.name}</h4>
          <p className="text-blue-600 font-medium">{PROFILE_DATA.personalInfo.title}</p>
          <p className="text-sm text-gray-600 mt-1">{PROFILE_DATA.personalInfo.location}</p>
          
          <div className="flex justify-center gap-2 mt-3">
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
              {PROFILE_DATA.experience[0].company}
            </span>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
              {PROFILE_DATA.education[0].degree.split(',')[0]}
            </span>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">{PROFILE_DATA.personalInfo.name}</h1>
            <p className="text-blue-100 text-lg font-medium mt-1">{PROFILE_DATA.personalInfo.title}</p>
            <p className="text-blue-200 text-sm mt-2">{PROFILE_DATA.personalInfo.tagline}</p>
          </div>
          
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={downloadCV}
              className="p-3 bg-white/20 backdrop-blur rounded-xl hover:bg-white/30 transition-colors"
            >
              <Download className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={shareCV}
              className="p-3 bg-white/20 backdrop-blur rounded-xl hover:bg-white/30 transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{PROFILE_DATA.personalInfo.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <span>{PROFILE_DATA.personalInfo.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <span>{PROFILE_DATA.personalInfo.email}</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex bg-gray-50 border-b overflow-x-auto">
        {[
          { key: 'summary', label: 'Summary', icon: Star },
          { key: 'experience', label: 'Experience', icon: Building },
          { key: 'education', label: 'Education', icon: GraduationCap },
          { key: 'skills', label: 'Skills', icon: Award },
          { key: 'certifications', label: 'Certifications', icon: Medal }
        ].map(section => {
          const Icon = section.icon
          return (
            <button
              key={section.key}
              onClick={() => setActiveSection(section.key)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors whitespace-nowrap ${
                activeSection === section.key
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              {section.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {activeSection === 'summary' && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">Professional Summary</h3>
              <p className="text-gray-700 leading-relaxed">{PROFILE_DATA.personalInfo.summary}</p>
              
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 mt-6">
                <p className="text-blue-800 italic text-sm leading-relaxed">
                  "{PROFILE_DATA.quote}"
                </p>
              </div>
            </motion.div>
          )}

          {activeSection === 'experience' && (
            <motion.div
              key="experience"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-6">Work Experience</h3>
              <div className="space-y-6">
                {PROFILE_DATA.experience.map((exp, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative pl-6 pb-6 ${
                      index !== PROFILE_DATA.experience.length - 1 ? 'border-l-2 border-gray-200' : ''
                    }`}
                  >
                    {/* Timeline dot */}
                    <div className={`absolute -left-2 w-4 h-4 rounded-full ${
                      exp.current ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                    
                    <div className="bg-white p-4 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-bold text-gray-800">{exp.position}</h4>
                          <p className="text-blue-600 font-medium">{exp.company}</p>
                        </div>
                        {exp.current && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                            Current
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {exp.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {exp.location}
                        </div>
                      </div>
                      
                      <p className="text-gray-700 text-sm leading-relaxed">{exp.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeSection === 'education' && (
            <motion.div
              key="education"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-6">Education</h3>
              <div className="space-y-4">
                {PROFILE_DATA.education.map((edu, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white p-4 rounded-xl border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-bold text-gray-800">{edu.degree}</h4>
                        <p className="text-blue-600 font-medium">{edu.institution}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        edu.type === 'Exchange' 
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {edu.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {edu.duration}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeSection === 'skills' && (
            <motion.div
              key="skills"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Languages</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {PROFILE_DATA.skills.languages.map((lang, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
                      <div className="flex items-center gap-2">
                        <Languages className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-gray-800">{lang.name}</span>
                      </div>
                      <span className="text-sm text-gray-600">{lang.level}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Technical Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {PROFILE_DATA.skills.technical.map((skill, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="px-3 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'certifications' && (
            <motion.div
              key="certifications"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-6">Certifications</h3>
              <div className="space-y-3">
                {PROFILE_DATA.certifications.map((cert, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200"
                  >
                    <Award className="w-5 h-5 text-yellow-600" />
                    <span className="text-gray-800">{cert}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// Medal icon component (since it's not in lucide-react by default)
function Medal({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" />
    </svg>
  )
}