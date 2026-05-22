'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  MapPin, 
  DollarSign, 
  Briefcase, 
  GraduationCap, 
  Calendar, 
  Users, 
  Percent, 
  Brain, 
  Search, 
  ChevronDown, 
  Check, 
  ExternalLink,
  Mail,
  Phone,
  Clock,
  Heart
} from 'lucide-react';

// Mock Data for all jobs (matching /recruiter/post-job structure)
interface JobDetail {
  id: string;
  title: string;
  dept: string;
  location: string;
  salaryMin: string;
  salaryMax: string;
  expLevel: string;
  education: string;
  posted: string;
  daysActive: number;
  status: string;
  skills: string[];
  description: string;
  responsibilities: string[];
  qualifications: string[];
  benefits: string[];
}

const mockJobsData: Record<string, JobDetail> = {
  'JOB-2491': {
    id: 'JOB-2491',
    title: 'Senior Product Designer',
    dept: 'Design',
    location: 'San Francisco, CA (Remote Friendly)',
    salaryMin: '120,000',
    salaryMax: '160,000',
    expLevel: 'Mid-Senior Level (5+ years)',
    education: "Bachelor's Degree",
    posted: '2 days ago',
    daysActive: 2,
    status: 'Active',
    skills: ['Figma', 'UI Design', 'Design Systems', 'Prototyping', 'React'],
    description: 'We are looking for a Senior Product Designer to join our fast-growing team. You will be responsible for leading the design of our core platform features, refining our design system, and creating highly interactive user flows.',
    responsibilities: [
      'Lead the design of core platform features from concept to launch.',
      'Work closely with product managers and engineers to define requirements.',
      'Mentor junior designers and provide constructive, detailed feedback.',
      'Drive the evolution of our central UI components library and design system.'
    ],
    qualifications: [
      '5+ years of experience in product design at a SaaS or tech company.',
      'Strong portfolio demonstrating excellence in high-fidelity UI/UX.',
      'Expert level mastery of Figma and modern design and prototyping tools.'
    ],
    benefits: ['Health Insurance', 'Remote Work', '401(k) Matching', 'Unlimited PTO']
  },
  'JOB-2488': {
    id: 'JOB-2488',
    title: 'Full Stack Engineer',
    dept: 'Engineering',
    location: 'New York, NY (Hybrid)',
    salaryMin: '140,000',
    salaryMax: '180,000',
    expLevel: 'Mid Level (2-5 years)',
    education: 'Any',
    posted: '5 days ago',
    daysActive: 5,
    status: 'Active',
    skills: ['React', 'Node.js', 'TypeScript', 'Python', 'SQL', 'AWS'],
    description: 'Seeking a skilled Full Stack Engineer to work on both front-end user interfaces and robust back-end APIs. You will join our high-performing core engineering team to build scalable features.',
    responsibilities: [
      'Implement responsive client-side features using React and TypeScript.',
      'Develop secure, high-performance REST and GraphQL APIs in Node.js/Python.',
      'Maintain database integrity and optimize queries.',
      'Deploy and monitor services in AWS cloud environment.'
    ],
    qualifications: [
      '3+ years of professional full-stack development experience.',
      'Proficient with modern JavaScript/TypeScript and front-end architectures.',
      'Strong understanding of relational databases (PostgreSQL/SQL) and REST API principles.'
    ],
    benefits: ['Health Insurance', '401(k) Matching', 'Stock Options', 'Gym Membership']
  },
  'JOB-2305': {
    id: 'JOB-2305',
    title: 'Data Scientist',
    dept: 'Data',
    location: 'Remote (US/Canada)',
    salaryMin: '130,000',
    salaryMax: '170,000',
    expLevel: 'Senior (8+ years)',
    education: "Master's Degree",
    posted: '1 week ago',
    daysActive: 7,
    status: 'Closed',
    skills: ['Python', 'SQL', 'Machine Learning', 'Data Visualization', 'Pandas'],
    description: 'We are seeking a Senior Data Scientist to lead mathematical modeling and user predictive analytics. You will work with complex data pools to drive business strategy.',
    responsibilities: [
      'Build and deploy machine learning models to predict customer behaviors.',
      'Create interactive data dashboards and visualizations for leadership.',
      'Collaborate with product teams to design robust A/B testing frameworks.'
    ],
    qualifications: [
      '6+ years of industry experience working with massive datasets.',
      'Expertise in Python, pandas, scikit-learn, and SQL.',
      'Strong statistical foundation with a Master or PhD degree.'
    ],
    benefits: ['Remote Work', 'Health Insurance', 'Unlimited PTO', 'Education Budget']
  },
  'JOB-2495': {
    id: 'JOB-2495',
    title: 'Head of HR',
    dept: 'Human Resources',
    location: 'Chicago, IL',
    salaryMin: '110,000',
    salaryMax: '140,000',
    expLevel: 'Director/Executive',
    education: "Bachelor's Degree",
    posted: '1 day ago',
    daysActive: 1,
    status: 'Active',
    skills: ['Agile', 'Product Management', 'Conflict Resolution', 'Recruiting'],
    description: 'Leading all human resource strategies and programs. This role drives culture, recruitment pipelines, benefits administration, and team conflict resolutions.',
    responsibilities: [
      'Oversee talent acquisition pipelines and candidate experiences.',
      'Formulate comprehensive employee wellness and benefits programs.',
      'Advise leadership on organizational development and team growth.'
    ],
    qualifications: [
      '8+ years of HR experience with 3+ years in a director-level role.',
      'Deep knowledge of labor compliance laws and recruitment best practices.',
      'Outstanding interpersonal and communication skills.'
    ],
    benefits: ['Health Insurance', '401(k) Matching', 'Relocation Bonus']
  }
};

// Mock candidates specifically applied for these jobs
interface Candidate {
  email: string;
  name: string;
  initials: string;
  skills: string[];
  experience: string;
  match: number;
  status: string;
  phone: string;
  reason: string;
  appliedJobs: string[];
}

const mockCandidates: Candidate[] = [
  {
    initials: 'SJ',
    name: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    skills: ['Product Design', 'Figma', 'UI Design', 'Design Systems'],
    experience: '6 Years',
    match: 95,
    status: 'Interview',
    phone: '+1 (555) 304-9876',
    reason: 'Excellent match! Strong portfolio showcasing robust UI Design systems and 6+ years of pure product design expertise using Figma.',
    appliedJobs: ['JOB-2491']
  },
  {
    initials: 'AL',
    name: 'Amanda Lee',
    email: 'amanda.l@design.co',
    skills: ['UX Research', 'Wireframing', 'User Interviews', 'Figma'],
    experience: '5 Years',
    match: 65,
    status: 'Applied',
    phone: '+1 (555) 789-0123',
    reason: 'Intermediate match. Strong UX Research background and wireframing, but lacks core active UI/SaaS design system development experience.',
    appliedJobs: ['JOB-2491']
  },
  {
    initials: 'MC',
    name: 'Michael Chen',
    email: 'm.chen@dev.io',
    skills: ['React', 'Node.js', 'TypeScript', 'SQL', 'Python'],
    experience: '4 Years',
    match: 88,
    status: 'Technical Test',
    phone: '+1 (555) 901-2345',
    reason: 'Highly compatible. Strong command of the complete full-stack workflow (React/TypeScript and Node.js backend). Relational DB knowledge is stellar.',
    appliedJobs: ['JOB-2488']
  },
  {
    initials: 'JW',
    name: 'James Wilson',
    email: 'j.wilson@tech.net',
    skills: ['Java', 'SQL', 'AWS', 'Spring Boot'],
    experience: '8 Years',
    match: 78,
    status: 'Applied',
    phone: '+1 (555) 456-7890',
    reason: 'Decent match. Extensive back-end engineering experience (8 Years) and strong SQL/AWS familiarity, but has limited experience with React.',
    appliedJobs: ['JOB-2488']
  },
  {
    initials: 'DR',
    name: 'David Ross',
    email: 'd.ross@mail.com',
    skills: ['Data Science', 'Python', 'SQL', 'Machine Learning'],
    experience: '3 Years',
    match: 82,
    status: 'Screening',
    phone: '+1 (555) 234-5678',
    reason: 'Good match. Proficient in Python, machine learning models, and SQL data extractions. Fits 80%+ of the technical prerequisites.',
    appliedJobs: ['JOB-2305']
  },
  {
    initials: 'EP',
    name: 'Emma Parker',
    email: 'emma.p@marketing.io',
    skills: ['SEO', 'Content', 'Copywriting'],
    experience: '2 Years',
    match: 45,
    status: 'Rejected',
    phone: '+1 (555) 567-8901',
    reason: 'Lacks core technical skills. Has strong SEO and content copywriting background, but does not meet product design or engineering skills.',
    appliedJobs: ['JOB-2491', 'JOB-2501']
  }
];

const statusConfig: Record<string, string> = {
  Interview: 'bg-blue-50 text-blue-700 border-blue-200',
  'Technical Test': 'bg-violet-50 text-violet-700 border-violet-200',
  Screening: 'bg-amber-50 text-amber-700 border-amber-200',
  Applied: 'bg-slate-50 text-slate-600 border-slate-200',
  Rejected: 'bg-red-50 text-red-700 border-red-200',
};

const pipelineStatuses = ['Applied', 'Screening', 'Technical Test', 'Interview', 'Rejected'];

export default function JobDetailPage() {
  const params = useParams();
  const rawId = params.id as string;
  const jobId = rawId.toUpperCase().includes('JOB') ? rawId.toUpperCase() : `JOB-${rawId}`;
  
  // States
  const [job, setJob] = useState<JobDetail | null>(mockJobsData[jobId] || null);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [applicants, setApplicants] = useState<Candidate[]>(
    mockCandidates.filter(c => c.appliedJobs.includes(jobId))
  );

  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Edit Modal form states
  const [editTitle, setEditTitle] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editSalaryMin, setEditSalaryMin] = useState('');
  const [editSalaryMax, setEditSalaryMax] = useState('');
  const [editExpLevel, setEditExpLevel] = useState('');
  const [editEducation, setEditEducation] = useState('');
  const [editSkillsString, setEditSkillsString] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editResponsibilities, setEditResponsibilities] = useState('');
  const [editQualifications, setEditQualifications] = useState('');
  const [editBenefits, setEditBenefits] = useState<string[]>([]);

  useEffect(() => {
    let detailedJobs = mockJobsData;
    const savedDetailed = localStorage.getItem('cvnet_jobs_detailed');
    if (savedDetailed) {
      try {
        detailedJobs = JSON.parse(savedDetailed);
      } catch (e) {
        console.error(e);
      }
    } else {
      localStorage.setItem('cvnet_jobs_detailed', JSON.stringify(mockJobsData));
    }

    const loadedJob = detailedJobs[jobId] || mockJobsData[jobId] || null;
    if (loadedJob) {
      setJob(loadedJob);
      setEditTitle(loadedJob.title);
      setEditDept(loadedJob.dept);
      setEditLocation(loadedJob.location);
      setEditSalaryMin(loadedJob.salaryMin);
      setEditSalaryMax(loadedJob.salaryMax);
      setEditExpLevel(loadedJob.expLevel);
      setEditEducation(loadedJob.education);
      setEditSkillsString(loadedJob.skills.join(', '));
      setEditDescription(loadedJob.description);
      setEditResponsibilities(loadedJob.responsibilities?.join('\n') || '');
      setEditQualifications(loadedJob.qualifications?.join('\n') || '');
      setEditBenefits(loadedJob.benefits || []);
    }
  }, [jobId]);

  // Update a candidate's pipeline status
  const handleChangeJobStatus = (newStatus: string) => {
    if (!job) return;
    const updatedJob = { ...job, status: newStatus };
    setJob(updatedJob);
    setIsStatusOpen(false);

    // Save to localStorage detailed list
    const savedDetailed = localStorage.getItem('cvnet_jobs_detailed');
    if (savedDetailed) {
      try {
        const detailedJobs = JSON.parse(savedDetailed);
        detailedJobs[jobId] = updatedJob;
        localStorage.setItem('cvnet_jobs_detailed', JSON.stringify(detailedJobs));
      } catch (e) {
        console.error(e);
      }
    }

    // Save to localStorage brief list (cvnet_jobs)
    const savedBrief = localStorage.getItem('cvnet_jobs');
    if (savedBrief) {
      try {
        const briefJobs = JSON.parse(savedBrief);
        const updatedBriefJobs = briefJobs.map((bj: any) => {
          if (bj.id.replace('#', '') === jobId) {
            return { ...bj, status: newStatus };
          }
          return bj;
        });
        localStorage.setItem('cvnet_jobs', JSON.stringify(updatedBriefJobs));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSaveJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;
    
    const updatedSkills = editSkillsString
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const updatedResps = editResponsibilities
      .split('\n')
      .map(line => line.trim().replace(/^[•\-\*\s]+/, ''))
      .filter(line => line.length > 0);

    const updatedQuals = editQualifications
      .split('\n')
      .map(line => line.trim().replace(/^[•\-\*\s]+/, ''))
      .filter(line => line.length > 0);

    const updatedJob: JobDetail = {
      ...job,
      title: editTitle,
      dept: editDept,
      location: editLocation,
      salaryMin: editSalaryMin,
      salaryMax: editSalaryMax,
      expLevel: editExpLevel,
      education: editEducation,
      skills: updatedSkills,
      description: editDescription,
      responsibilities: updatedResps,
      qualifications: updatedQuals,
      benefits: editBenefits
    };

    setJob(updatedJob);
    setIsEditOpen(false);

    // Save to localStorage detailed list
    const savedDetailed = localStorage.getItem('cvnet_jobs_detailed');
    if (savedDetailed) {
      try {
        const detailedJobs = JSON.parse(savedDetailed);
        detailedJobs[jobId] = updatedJob;
        localStorage.setItem('cvnet_jobs_detailed', JSON.stringify(detailedJobs));
      } catch (e) {
        console.error(e);
      }
    }

    // Save to localStorage brief list (cvnet_jobs)
    const savedBrief = localStorage.getItem('cvnet_jobs');
    if (savedBrief) {
      try {
        const briefJobs = JSON.parse(savedBrief);
        const updatedBriefJobs = briefJobs.map((bj: any) => {
          if (bj.id.replace('#', '') === jobId) {
            return { 
              ...bj, 
              title: editTitle, 
              dept: editDept 
            };
          }
          return bj;
        });
        localStorage.setItem('cvnet_jobs', JSON.stringify(updatedBriefJobs));
      } catch (e) {
        console.error(e);
      }
    }
  };

  // If job doesn't exist, show error view
  if (!job) {
    return (
      <div className="p-10 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ArrowLeft size={30} />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Job Post Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">We couldn't locate a job posting with the ID {jobId}. It may have been deleted or the URL is incorrect.</p>
        <Link href="/recruiter/jobs" className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-xl text-sm">
          Return to Jobs List
        </Link>
      </div>
    );
  }

  // Update a candidate's pipeline status
  const handleStatusChange = (email: string, newStatus: string) => {
    setApplicants(prev => 
      prev.map(c => c.email === email ? { ...c, status: newStatus } : c)
    );
  };

  // Filter candidates
  const filteredCandidates = applicants.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                          c.skills.some(s => s.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = selectedStatus === 'All' || c.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Calculate metrics
  const totalApplicants = applicants.length;
  const newApplicants = applicants.filter(c => c.status === 'Applied').length;
  const avgMatchScore = totalApplicants > 0 
    ? Math.round(applicants.reduce((sum, c) => sum + c.match, 0) / totalApplicants)
    : 0;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto min-h-screen bg-slate-50/30">
      {/* Navigation & Breadcrumbs */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
          <Link href="/recruiter/jobs" className="hover:text-blue-600 transition-colors">Jobs</Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900">{job.id}</span>
        </div>
        <Link href="/recruiter/jobs" className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 bg-white border border-slate-200 px-3.5 py-2 rounded-xl transition-all shadow-sm">
          <ArrowLeft size={14} /> Back to Jobs
        </Link>
      </div>

      {/* Hero Banner Section */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-6 sm:p-8 text-white mb-8 relative z-20 shadow-xl shadow-slate-900/10">
        <div className="absolute inset-0 rounded-[2rem] overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600 rounded-full blur-[100px] opacity-25 -mr-16 -mt-16" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-blue-600/30 border border-blue-400/30 text-blue-300 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                {job.dept} Department
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${job.status === 'Active' ? 'bg-green-600/30 border-green-400/30 text-green-300' : 'bg-slate-700 border-slate-600 text-slate-300'}`}>
                {job.status}
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-2">{job.title}</h1>
            <p className="text-sm text-slate-300 flex items-center gap-1.5">
              <MapPin size={14} className="text-blue-400" /> {job.location} · Posted {job.posted}
            </p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto relative">
            <button 
              onClick={() => setIsEditOpen(true)}
              className="flex-1 sm:flex-none bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-5 py-3 rounded-xl border border-white/10 transition-all cursor-pointer"
            >
              Edit Job Details
            </button>
            <div className="relative flex-1 sm:flex-none">
              <button 
                onClick={() => setIsStatusOpen(!isStatusOpen)}
                className="w-full flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 cursor-pointer border-0"
              >
                Change Status <ChevronDown size={14} />
              </button>
              
              {isStatusOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-100 rounded-2xl shadow-xl z-30 p-2 animate-in fade-in slide-in-from-top-2 duration-150">
                  {['Active', 'Draft', 'Closed'].map((statusOption) => (
                    <button
                      key={statusOption}
                      onClick={() => handleChangeJobStatus(statusOption)}
                      className="w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-colors hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer border-0 bg-transparent"
                    >
                      <span className={`w-2 h-2 rounded-full ${
                        statusOption === 'Active' ? 'bg-green-500' :
                        statusOption === 'Draft' ? 'bg-amber-500' : 'bg-slate-400'
                      }`} />
                      {statusOption}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Premium Statistics KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Applicants', val: totalApplicants, sub: 'All-time pipeline', icon: <Users className="text-blue-600" size={18} />, bg: 'bg-blue-50/50 border-blue-100' },
          { label: 'Avg Match Score', val: `${avgMatchScore}%`, sub: 'AI evaluation avg', icon: <Percent className="text-emerald-600" size={18} />, bg: 'bg-emerald-50/50 border-emerald-100' },
          { label: 'New Applied', val: newApplicants, sub: 'Awaiting screening', icon: <Brain className="text-violet-600" size={18} />, bg: 'bg-violet-50/50 border-violet-100' },
          { label: 'Days Active', val: job.daysActive, sub: 'Posted duration', icon: <Clock className="text-amber-600" size={18} />, bg: 'bg-amber-50/50 border-amber-100' }
        ].map((kpi, idx) => (
          <div key={idx} className={`bg-white border rounded-2xl p-5 shadow-sm relative overflow-hidden`}>
            <div className={`absolute top-4 right-4 w-9 h-9 rounded-xl flex items-center justify-center ${kpi.bg} border`}>
              {kpi.icon}
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{kpi.label}</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight mb-0.5">{kpi.val}</p>
            <p className="text-[10px] text-slate-400 font-semibold">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Main Grid: Details + Applicants */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Job Specification Details */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl shadow-slate-200/30">
            <h2 className="font-extrabold text-slate-900 text-lg mb-4 flex items-center gap-2">
              <Briefcase size={18} className="text-blue-600" /> Job Specifications
            </h2>

            {/* Quick specifications list */}
            <div className="space-y-4 mb-6">
              {[
                { name: 'Salary (Annual)', value: `$${job.salaryMin} – $${job.salaryMax}`, icon: <DollarSign size={15} className="text-slate-400" /> },
                { name: 'Experience Required', value: job.expLevel, icon: <Briefcase size={15} className="text-slate-400" /> },
                { name: 'Education', value: job.education, icon: <GraduationCap size={15} className="text-slate-400" /> }
              ].map((spec, i) => (
                <div key={i} className="flex gap-3 bg-slate-50/50 border border-slate-100 rounded-xl p-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                    {spec.icon}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">{spec.name}</p>
                    <p className="text-xs font-extrabold text-slate-800 leading-tight">{spec.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Required Skills list */}
            <div className="mb-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Required Technical Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {job.skills.map(s => (
                  <span key={s} className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-sm">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Job Description details */}
            <div className="border-t border-slate-100 pt-5 space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Overview Description</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{job.description}</p>
              </div>

              {job.responsibilities && (
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Key Responsibilities</h3>
                  <ul className="space-y-2">
                    {job.responsibilities.map((resp, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-600 font-medium">
                        <Check size={12} className="text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {job.qualifications && (
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Essential Qualifications</h3>
                  <ul className="space-y-2">
                    {job.qualifications.map((qual, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-600 font-medium">
                        <Check size={12} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                        <span>{qual}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {job.benefits && (
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Benefits & Perks</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {job.benefits.map(b => (
                      <span key={b} className="bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold px-2 py-1 rounded">
                        ✓ {b}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Applicants Tracker Pipeline */}
        <div className="space-y-6 lg:col-span-2">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl shadow-slate-200/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  <Brain size={18} className="text-blue-600" /> Applicants & AI Match
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">Candidates matched using CvNet AI systems</p>
              </div>

              {/* Status Pipeline Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {['All', ...pipelineStatuses].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setSelectedStatus(tab)}
                    className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all whitespace-nowrap ${tab === selectedStatus ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Candidate Search bar */}
            <div className="relative mb-6">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search candidates by name, email, or specific skills..."
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-inner"
              />
            </div>

            {/* List of Matched Candidates */}
            <div className="space-y-4">
              {filteredCandidates.length > 0 ? (
                filteredCandidates.map((candidate) => (
                  <div key={candidate.email} className="bg-white border border-slate-100 hover:border-blue-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      
                      {/* Left side: Initials, Name, Skills, Contact */}
                      <div className="flex items-start gap-4">
                        {/* Initials profile circle */}
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white font-extrabold flex items-center justify-center text-sm shadow-md group-hover:scale-105 transition-transform flex-shrink-0">
                          {candidate.initials}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-extrabold text-slate-900 text-base">{candidate.name}</h3>
                            <span className="text-[10px] font-bold text-slate-400">· {candidate.experience} Exp</span>
                          </div>
                          
                          <p className="text-xs text-slate-400 font-semibold mb-2 flex items-center gap-1.5 flex-wrap">
                            <span className="flex items-center gap-1"><Mail size={11} /> {candidate.email}</span>
                            <span className="text-slate-200">|</span>
                            <span className="flex items-center gap-1"><Phone size={11} /> {candidate.phone}</span>
                          </p>

                          {/* Skill badges */}
                          <div className="flex flex-wrap gap-1.5">
                            {candidate.skills.map((skill) => (
                              <span key={skill} className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right side: AI match Score radial graph */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start w-full sm:w-auto gap-4 sm:gap-2 self-stretch border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-50">
                        <div className="flex items-center gap-2.5">
                          {/* Mini radial progress */}
                          <div className="relative w-12 h-12">
                            <svg className="w-full h-full transform -rotate-90">
                              <circle cx="24" cy="24" r="20" className="stroke-slate-100" strokeWidth="4" fill="transparent" />
                              <circle
                                cx="24"
                                cy="24"
                                r="20"
                                className={candidate.match >= 85 ? "stroke-emerald-500" : candidate.match >= 70 ? "stroke-amber-500" : "stroke-red-500"}
                                strokeWidth="4"
                                fill="transparent"
                                strokeDasharray={125}
                                strokeDashoffset={125 - (125 * candidate.match) / 100}
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-slate-800">
                              {candidate.match}%
                            </div>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">AI Match</p>
                            <p className="text-xs font-black text-slate-700 leading-none">Compatibility</p>
                          </div>
                        </div>
                        
                        {/* Pipeline Dropdown selector */}
                        <div className="relative mt-1">
                          <select
                            value={candidate.status}
                            onChange={(e) => handleStatusChange(candidate.email, e.target.value)}
                            className={`appearance-none text-xs font-bold pl-3 pr-8 py-1.5 rounded-xl border cursor-pointer outline-none transition-all ${statusConfig[candidate.status] || 'bg-slate-50 border-slate-200'}`}
                          >
                            {pipelineStatuses.map(status => (
                              <option key={status} value={status} className="bg-white text-slate-700 font-bold">{status}</option>
                            ))}
                          </select>
                          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* AI Reasoning box */}
                    <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-3.5 mt-4 text-[11px] text-slate-500 leading-relaxed font-medium relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                      <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-blue-600 mb-1 leading-none">
                        <Brain size={12} /> AI Evaluator Reasoning
                      </div>
                      "{candidate.reason}"
                    </div>

                    {/* Bottom actions */}
                    <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-slate-50">
                      <Link 
                        href={`/recruiter/candidates/${candidate.email}`}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                      >
                        Open Profile <ExternalLink size={11} />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-400 border-2 border-dashed border-slate-100 rounded-3xl">
                  No applicants found matching "{search}" or the active pipeline stage.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Edit Job Details Pop-up Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white border border-slate-100 rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">Editor Panel</p>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Edit Job Specifications</h3>
              </div>
              <button 
                onClick={() => setIsEditOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-xl transition-colors bg-white"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSaveJob} className="space-y-4 text-left">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Job Title</label>
                  <input
                    required
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Department</label>
                  <select
                    value={editDept}
                    onChange={(e) => setEditDept(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-slate-800 font-medium"
                  >
                    {['Design', 'Engineering', 'Marketing', 'Data', 'Human Resources', 'Product'].map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Location</label>
                <input
                  required
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Min Salary (Annual)</label>
                  <input
                    required
                    type="text"
                    value={editSalaryMin}
                    onChange={(e) => setEditSalaryMin(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Max Salary (Annual)</label>
                  <input
                    required
                    type="text"
                    value={editSalaryMax}
                    onChange={(e) => setEditSalaryMax(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Experience Level</label>
                  <select
                    value={editExpLevel}
                    onChange={(e) => setEditExpLevel(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-slate-800 font-medium"
                  >
                    {['Entry Level (0-2 years)', 'Mid Level (2-5 years)', 'Mid-Senior Level (5+ years)', 'Senior (8+ years)', 'Director/Executive'].map((e) => (
                      <option key={e}>{e}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Education</label>
                  <select
                    value={editEducation}
                    onChange={(e) => setEditEducation(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-slate-800 font-medium"
                  >
                    {["High School", "Associate's Degree", "Bachelor's Degree", "Master's Degree", "PhD", "Any"].map((e) => (
                      <option key={e}>{e}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Required Skills (Comma separated)</label>
                <input
                  type="text"
                  value={editSkillsString}
                  onChange={(e) => setEditSkillsString(e.target.value)}
                  placeholder="e.g. Figma, React, Prototyping"
                  className="w-full px-4 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Overview Description</label>
                <textarea
                  required
                  rows={4}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-medium text-slate-700 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Key Responsibilities (One per line)</label>
                <textarea
                  rows={4}
                  value={editResponsibilities}
                  onChange={(e) => setEditResponsibilities(e.target.value)}
                  placeholder="e.g. Lead the design of core platform features&#10;Work closely with PMs and engineers"
                  className="w-full px-4 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-medium text-slate-700 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Essential Qualifications (One per line)</label>
                <textarea
                  rows={4}
                  value={editQualifications}
                  onChange={(e) => setEditQualifications(e.target.value)}
                  placeholder="e.g. 5+ years of experience in product design&#10;Expert level mastery of Figma"
                  className="w-full px-4 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-medium text-slate-700 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Employee Benefits & Perks</label>
                <div className="flex flex-wrap gap-2">
                  {['Health Insurance', 'Remote Work', '401(k) Matching', 'Unlimited PTO', 'Gym Membership', 'Stock Options', 'Relocation Bonus'].map((b) => {
                    const isSelected = editBenefits.includes(b);
                    return (
                      <button
                        type="button"
                        key={b}
                        onClick={() => {
                          if (isSelected) {
                            setEditBenefits(editBenefits.filter(item => item !== b));
                          } else {
                            setEditBenefits([...editBenefits, b]);
                          }
                        }}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-blue-50 border-blue-200 text-blue-700 font-extrabold' 
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '} {b}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-5 py-2.5 text-xs font-bold border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md cursor-pointer transition-colors border-0"
                >
                  Save Specifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
