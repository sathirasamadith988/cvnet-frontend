export const matchedSkills = [
  "React",
  "TypeScript",
  "Tailwind",
  "Git",
  "Responsive Design",
  "JavaScript",
  "Redux",
  "REST API",
];

export const missingSkills = ["Docker", "GraphQL", "AWS", "Jest"];

export const gapBreakdown = [
  {
    skill: "Docker",
    category: "Containerization",
    demand: "High",
    yourLevel: "None Detected",
    required: "Intermediate",
    status: "Critical",
    action: "Find Course",
  },
  {
    skill: "GraphQL",
    category: "API Query Language",
    demand: "Medium",
    yourLevel: "Beginner",
    required: "Advanced",
    status: "Critical",
    action: "Find Course",
  },
  {
    skill: "AWS",
    category: "Cloud Infrastructure",
    demand: "High",
    yourLevel: "None Detected",
    required: "Intermediate",
    status: "Critical",
    action: "Find Course",
  },
  {
    skill: "Jest",
    category: "Testing Framework",
    demand: "Medium",
    yourLevel: "Beginner",
    required: "Intermediate",
    status: "Moderate",
    action: "Find Course",
  },
  {
    skill: "TypeScript",
    category: "Programming Language",
    demand: "High",
    yourLevel: "Expert",
    required: "Expert",
    status: "Matched",
    action: "Review",
  },
  {
    skill: "React.js",
    category: "Frontend Framework",
    demand: "High",
    yourLevel: "Beginner",
    required: "Intermediate",
    status: "Minor",
    action: "Practice",
  },
];

export const skillMatchScore = Math.round(
  (matchedSkills.length / (matchedSkills.length + missingSkills.length)) * 100,
);
