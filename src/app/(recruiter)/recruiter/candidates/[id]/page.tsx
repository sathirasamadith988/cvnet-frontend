'use client';

import { 
  FileText, 
  Mail, 
  Phone, 
  MapPin, 
  Linkedin, 
  Github, 
  Download, 
  Calendar, 
  MessageSquare, 
  CheckCircle2, 
  Zap, 
  Award, 
  Briefcase, 
  GraduationCap,
  ChevronRight,
  TrendingUp,
  Brain
} from 'lucide-react';
import { useState } from 'react';

// Mock data for the demonstration
const candidateData = {
  id: '1',
  name: 'Alex Rivera',
  role: 'Senior Product Designer',
  email: 'alex.rivera@example.com',
  phone: '+1 (555) 000-1234',
  location: 'Brooklyn, NY',
  bio: 'Product Designer with 7+ years of experience building scalable design systems and user-centric interfaces. Passionate about bridging the gap between design and engineering.',
  matchScore: 94,
  aiInsights: {
    strengths: ['Advanced Design Systems', 'Cross-functional Leadership', 'Prototyping Expert'],
    weaknesses: ['Limited Backend Knowledge', 'Public Speaking'],
    careerPath: 'On track for Design Lead / Creative Director roles within 1-2 years.'
  },
  experience: [
    {
      company: 'TechFlow Systems',
      role: 'Senior Product Designer',
      period: '2021 - Present',
      description: 'Leading the design of core platform features. Reduced user churn by 15% through data-driven UX improvements.'
    },
    {
      company: 'CreativePulse',
      role: 'Product Designer',
      period: '2018 - 2021',
      description: 'Developed and maintained the company design system. Collaborated with 20+ engineers on high-fidelity prototypes.'
    }
  ],
  education: [
    {
      school: 'Rhode Island School of Design',
      degree: 'BFA in Graphic Design',
      year: '2017'
    }
  ],
  skills: [
    { name: 'Figma', level: 'Expert' },
    { name: 'React', level: 'Advanced' },
    { name: 'TypeScript', level: 'Intermediate' },
    { name: 'User Research', level: 'Advanced' },
    { name: 'Prototyping', level: 'Expert' }
  ]
};

export default function CandidateProfilePage() {
  const [activeTab, setActiveTab] = useState('experience');

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto min-h-screen bg-slate-50/50">
      {/* Top Navigation / Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-widest mb-8">
        <span className="hover:text-blue-600 cursor-pointer">Candidates</span>
        <ChevronRight size={14} />
        <span className="text-slate-900">{candidateData.name}</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Main Profile Info */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Hero Section */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
            
            <div className="relative flex flex-col md:flex-row gap-8 items-center md:items-start">
              {/* Profile Image */}
              <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center text-white text-4xl font-black shadow-2xl relative">
                {candidateData.name.charAt(0)}
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 border-4 border-white rounded-full flex items-center justify-center text-white">
                  <CheckCircle2 size={16} />
                </div>
              </div>

              {/* Basic Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight">{candidateData.name}</h1>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100">
                    Verified Talent
                  </span>
                </div>
                <p className="text-lg text-slate-500 font-medium mb-6">{candidateData.role}</p>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm font-semibold text-slate-500">
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                    <MapPin size={16} className="text-blue-500" /> {candidateData.location}
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                    <Mail size={16} className="text-slate-400" /> {candidateData.email}
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                    <Phone size={16} className="text-slate-400" /> {candidateData.phone}
                  </div>
                </div>
              </div>

              {/* Main Action */}
              <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95 whitespace-nowrap">
                <Download size={18} /> Download Original CV
              </button>
            </div>
          </div>

          {/* Detailed Info Tabs */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
            <div className="flex border-b border-slate-100">
              {['Experience', 'Education', 'Skills'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={`px-8 py-5 text-sm font-bold transition-all relative ${activeTab === tab.toLowerCase() ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {tab}
                  {activeTab === tab.toLowerCase() && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />}
                </button>
              ))}
            </div>

            <div className="p-8">
              {activeTab === 'experience' && (
                <div className="space-y-10">
                  {candidateData.experience.map((exp, i) => (
                    <div key={i} className="flex gap-6">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                          <Briefcase size={20} />
                        </div>
                        {i !== candidateData.experience.length - 1 && <div className="w-px h-full bg-slate-100 my-2" />}
                      </div>
                      <div className="pb-4">
                        <h4 className="font-bold text-slate-900 text-lg leading-tight">{exp.role}</h4>
                        <p className="text-blue-600 font-bold text-sm mb-2">{exp.company}</p>
                        <span className="inline-block bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded mb-3 border border-slate-100">
                          {exp.period}
                        </span>
                        <p className="text-slate-500 text-sm leading-relaxed max-w-xl">{exp.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'education' && (
                <div className="space-y-8">
                  {candidateData.education.map((edu, i) => (
                    <div key={i} className="flex gap-6">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                        <GraduationCap size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-lg leading-tight">{edu.degree}</h4>
                        <p className="text-indigo-600 font-bold text-sm mb-2">{edu.school}</p>
                        <span className="text-slate-400 text-xs font-bold">{edu.year}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'skills' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {candidateData.skills.map((skill, i) => (
                    <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-colors">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-blue-500">{skill.level}</p>
                      <h4 className="font-bold text-slate-800">{skill.name}</h4>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Analysis & Actions */}
        <div className="space-y-8">
          
          {/* AI Matching Score Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-[80px] opacity-20" />
            
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6">
                <Brain size={14} className="text-blue-400" /> CvNet Intelligence
              </div>
              
              <div className="relative w-40 h-40 mx-auto mb-6">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="80" cy="80" r="70" className="stroke-white/10" strokeWidth="12" fill="transparent" />
                  <circle 
                    cx="80" cy="80" r="70" 
                    className="stroke-blue-500" 
                    strokeWidth="12" 
                    fill="transparent" 
                    strokeDasharray={440} 
                    strokeDashoffset={440 - (440 * candidateData.matchScore) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black">{candidateData.matchScore}%</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Match Score</span>
                </div>
              </div>

              <p className="text-sm text-slate-300 font-medium leading-relaxed">
                Excellent cultural and technical fit for the <span className="text-blue-400 font-bold">{candidateData.role}</span> position.
              </p>
            </div>
          </div>

          {/* AI Insights Card */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40 space-y-6">
            <h3 className="font-black text-slate-900 flex items-center gap-2">
              <Zap size={20} className="text-yellow-500 fill-yellow-500" /> Key Insights
            </h3>
            
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Technical Strengths</p>
              <div className="flex flex-wrap gap-2">
                {candidateData.aiInsights.strengths.map(s => (
                  <span key={s} className="bg-green-50 text-green-700 text-[11px] font-bold px-3 py-1.5 rounded-xl border border-green-100 flex items-center gap-1">
                    <TrendingUp size={12} /> {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-50">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">AI Prediction</p>
              <p className="text-sm text-slate-600 leading-relaxed italic">
                "{candidateData.aiInsights.careerPath}"
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-[2.5rem] p-4 border border-slate-100 shadow-xl shadow-slate-200/40 grid grid-cols-2 gap-3">
            <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-[2rem] bg-slate-50 hover:bg-blue-50 hover:text-blue-600 transition-all border border-slate-100 text-slate-600">
              <Calendar size={24} />
              <span className="text-xs font-bold">Schedule</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-[2rem] bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-100 text-slate-600">
              <MessageSquare size={24} />
              <span className="text-xs font-bold">Message</span>
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
