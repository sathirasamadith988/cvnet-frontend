export type ApplicationStatus =
  | "In Review"
  | "Call for Interview"
  | "Application Closed"
  | "Rejected"
  | "Offer Received";

export type ApplicationDetails = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  currentRole: string;
  cvFileName: string;
  portfolio: string;
  availability: string;
  summary: string;
  coverLetter: string;
};

export type ApplicationRecord = {
  id: string;
  jobId: string;
  role: string;
  company: string;
  location: string;
  date: string;
  match: number;
  status: ApplicationStatus;
  details: ApplicationDetails;
};

export const applicationStorageKey = "cvnet-applications";

export const statusConfig: Record<
  ApplicationStatus,
  { bg: string; text: string; label: string }
> = {
  "In Review": {
    bg: "bg-amber-100",
    text: "text-amber-700",
    label: "In Review",
  },
  "Call for Interview": {
    bg: "bg-blue-100",
    text: "text-blue-700",
    label: "Call for Interview",
  },
  "Application Closed": {
    bg: "bg-slate-100",
    text: "text-slate-600",
    label: "Application Closed",
  },
  Rejected: {
    bg: "bg-red-100",
    text: "text-red-700",
    label: "Rejected",
  },
  "Offer Received": {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    label: "Offer Received",
  },
};

export const defaultApplicationDetails: ApplicationDetails = {
  fullName: "Alex Johnson",
  email: "alex.johnson@example.com",
  phone: "+1 (555) 014-2244",
  location: "Remote",
  currentRole: "Senior Frontend Developer",
  cvFileName: "alex-johnson-resume.pdf",
  portfolio: "https://portfolio.example.com/alex-johnson",
  availability: "2 weeks notice",
  summary:
    "Senior Frontend Developer with 7+ years of experience in React, TypeScript, and scalable UI systems.",
  coverLetter:
    "I am interested in this role and would like to be considered for the next stage.",
};

export const defaultApplications: ApplicationRecord[] = [
  {
    id: "frontend-lead-techcorp",
    jobId: "frontend-lead",
    role: "Senior Frontend Developer",
    company: "TechCorp Inc.",
    location: "Remote",
    date: "Oct 24, 2023",
    match: 92,
    status: "In Review",
    details: {
      ...defaultApplicationDetails,
      currentRole: "Senior Frontend Developer",
      summary:
        "Senior Frontend Developer with 7+ years of experience in React, TypeScript, and scalable UI systems.",
    },
  },
  {
    id: "product-designer-design-studio",
    jobId: "product-designer",
    role: "Product Designer",
    company: "Design Studio",
    location: "New York",
    date: "Oct 20, 2023",
    match: 88,
    status: "Call for Interview",
    details: {
      ...defaultApplicationDetails,
      currentRole: "Product Designer",
      summary:
        "Design-focused candidate with strong systems thinking, product collaboration, and prototyping experience.",
    },
  },
  {
    id: "react-engineer-global-systems",
    jobId: "react-engineer",
    role: "Senior React Engineer",
    company: "Global Systems",
    location: "Remote",
    date: "Oct 18, 2023",
    match: 65,
    status: "Application Closed",
    details: {
      ...defaultApplicationDetails,
      currentRole: "Senior React Engineer",
      summary:
        "Hands-on React engineer with a focus on performance, testing, and scalable UI delivery.",
    },
  },
  {
    id: "ux-researcher-innovatelab",
    jobId: "ux-researcher",
    role: "UX Researcher",
    company: "InnovateLab",
    location: "San Francisco",
    date: "Oct 15, 2023",
    match: 95,
    status: "Offer Received",
    details: {
      ...defaultApplicationDetails,
      currentRole: "UX Researcher",
      summary:
        "Research-oriented profile with strong synthesis, discovery, and user interview experience.",
    },
  },
  {
    id: "full-stack-dev-future-web",
    jobId: "frontend-engineer",
    role: "Full Stack Dev",
    company: "Future Web",
    location: "Remote",
    date: "Oct 12, 2023",
    match: 45,
    status: "Rejected",
    details: {
      ...defaultApplicationDetails,
      currentRole: "Full Stack Developer",
      summary:
        "Full stack candidate with broad web experience and a strong interest in modern product development.",
    },
  },
  {
    id: "backend-engineer-fintechflow",
    jobId: "backend-engineer",
    role: "Backend Engineer",
    company: "FintechFlow",
    location: "London",
    date: "Oct 10, 2023",
    match: 85,
    status: "In Review",
    details: {
      ...defaultApplicationDetails,
      currentRole: "Backend Engineer",
      summary:
        "Backend engineer with strong API design, systems thinking, and cross-team delivery experience.",
    },
  },
  {
    id: "engineering-manager-paygrid",
    jobId: "engineering-manager",
    role: "Engineering Manager",
    company: "PayGrid",
    location: "Remote",
    date: "Oct 8, 2023",
    match: 72,
    status: "Call for Interview",
    details: {
      ...defaultApplicationDetails,
      currentRole: "Engineering Manager",
      summary:
        "Engineering leader focused on delivery, coaching, and shipping high-quality product work.",
    },
  },
];

function parseStoredApplications(rawValue: string | null): ApplicationRecord[] {
  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((application): application is ApplicationRecord => {
      return (
        application &&
        typeof application === "object" &&
        typeof application.id === "string" &&
        typeof application.role === "string" &&
        typeof application.company === "string" &&
        typeof application.status === "string" &&
        typeof application.details === "object"
      );
    });
  } catch {
    return [];
  }
}

export function getApplicationsFromStorage(): ApplicationRecord[] {
  if (typeof window === "undefined") {
    return defaultApplications;
  }

  const storedApplications = parseStoredApplications(
    window.localStorage.getItem(applicationStorageKey),
  );

  const mergedApplications = [...storedApplications];

  defaultApplications.forEach((application) => {
    if (!mergedApplications.some((current) => current.id === application.id)) {
      mergedApplications.push(application);
    }
  });

  return mergedApplications;
}

export function saveApplicationToStorage(application: ApplicationRecord) {
  if (typeof window === "undefined") {
    return;
  }

  const existingApplications = getApplicationsFromStorage().filter(
    (current) => current.id !== application.id,
  );

  window.localStorage.setItem(
    applicationStorageKey,
    JSON.stringify([application, ...existingApplications]),
  );
}

export function createApplicationId(jobId: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${jobId}-${crypto.randomUUID()}`;
  }

  return `${jobId}-${Date.now()}`;
}
