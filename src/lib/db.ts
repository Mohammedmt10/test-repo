// src/lib/db.ts
import fs from "fs";
import path from "path";

export interface Submission {
  fullName: string;
  email: string;
  phone?: string;
  portfolioUrl?: string;
  gitHubUrl: string;
  preferredRole: string;
  experienceLevel: string;
  skills: string[];
  motivation: string;
  techChallenge?: string;
  expectedSalary: string;
  resumeFileName?: string;
  trackingId: string;
  submittedAt: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "submissions.json");

export function getSubmissions(): Submission[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
      return [];
    }
    const content = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(content || "[]");
  } catch (error) {
    console.error("Failed to read submissions from local storage:", error);
    return [];
  }
}

export function saveSubmission(submission: Omit<Submission, "submittedAt">): Submission {
  try {
    const submissions = getSubmissions();
    const newSubmission: Submission = {
      ...submission,
      submittedAt: new Date().toISOString(),
    };
    submissions.unshift(newSubmission); // Show newest first
    
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(submissions, null, 2));
    return newSubmission;
  } catch (error) {
    console.error("Failed to write submission to local storage:", error);
    throw error;
  }
}
