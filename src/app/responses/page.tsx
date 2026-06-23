// src/app/responses/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface Submission {
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

export default function ResponsesPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter States
  const [search, setSearch] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  
  // Selected Submission for Modal
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  useEffect(() => {
    async function fetchSubmissions() {
      try {
        const response = await fetch("/api/submissions");
        if (!response.ok) {
          throw new Error("Failed to load submissions");
        }
        const resData = await response.json();
        if (resData.success) {
          setSubmissions(resData.data);
        } else {
          throw new Error(resData.error || "Failed to load submissions");
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchSubmissions();
  }, []);

  // Compute Statistics
  const totalCount = submissions.length;
  const frontendCount = submissions.filter((s) => s.preferredRole === "frontend").length;
  const backendCount = submissions.filter((s) => s.preferredRole === "backend").length;
  const fullstackCount = submissions.filter((s) => s.preferredRole === "fullstack").length;

  // Filter & Sort Logic
  const filteredSubmissions = submissions
    .filter((sub) => {
      const matchesSearch =
        sub.fullName.toLowerCase().includes(search.toLowerCase()) ||
        sub.email.toLowerCase().includes(search.toLowerCase()) ||
        sub.trackingId.toLowerCase().includes(search.toLowerCase());
      
      const matchesRole = roleFilter === "all" || sub.preferredRole === roleFilter;

      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
      }
      if (sortBy === "salary") {
        return Number(b.expectedSalary) - Number(a.expectedSalary);
      }
      return 0;
    });

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "frontend":
        return "Frontend";
      case "backend":
        return "Backend";
      case "fullstack":
        return "Fullstack";
      default:
        return role;
    }
  };

  const getExperienceLabel = (exp: string) => {
    switch (exp) {
      case "entry":
        return "< 1 year";
      case "1-3":
        return "1-3 years";
      case "3-5":
        return "3-5 years";
      case "5+":
        return "5+ years";
      default:
        return exp;
    }
  };

  return (
    <main style={{ padding: "3rem 1rem" }}>
      <div className="glow-orb glow-orb-1" style={{ top: "5%", right: "-10%" }}></div>
      <div className="glow-orb glow-orb-2" style={{ bottom: "5%", left: "-15%" }}></div>

      <div className="dashboard-container">
        {/* Header Section */}
        <div className="dashboard-header-flex">
          <div>
            <h1 className="title-gradient">Applications Dashboard</h1>
            <p style={{ color: "var(--muted-foreground)", marginTop: "0.25rem" }}>
              Monitor and review all candidates applying for the Software Development role.
            </p>
          </div>
          <Link href="/" className="btn btn-primary" style={{ textDecoration: "none" }}>
            ➕ Apply Form
          </Link>
        </div>

        {/* Statistics Banner */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-val">{totalCount}</div>
            <div className="stat-label">Total Applicants</div>
          </div>
          <div className="stat-card" style={{ "--accent-color": "#60a5fa" } as React.CSSProperties}>
            <div className="stat-val">{frontendCount}</div>
            <div className="stat-label">Frontend</div>
          </div>
          <div className="stat-card" style={{ "--accent-color": "#a78bfa" } as React.CSSProperties}>
            <div className="stat-val">{backendCount}</div>
            <div className="stat-label">Backend</div>
          </div>
          <div className="stat-card" style={{ "--accent-color": "#34d399" } as React.CSSProperties}>
            <div className="stat-val">{fullstackCount}</div>
            <div className="stat-label">Fullstack</div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="filter-bar">
          <div className="filter-search">
            <input
              type="text"
              placeholder="Search by name, email, or tracking ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: "0.6rem 1rem" }}
            />
          </div>
          <div className="filter-selects">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{ padding: "0.6rem 2rem 0.6rem 1rem" }}
            >
              <option value="all">All Roles</option>
              <option value="frontend">Frontend</option>
              <option value="backend">Backend</option>
              <option value="fullstack">Fullstack</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ padding: "0.6rem 2rem 0.6rem 1rem" }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="salary">Highest Salary</option>
            </select>
          </div>
        </div>

        {/* Main List */}
        {loading ? (
          <div className="glass-card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
            <div style={{ color: "var(--muted-foreground)", fontSize: "1.1rem" }}>Loading applicant profiles...</div>
          </div>
        ) : error ? (
          <div className="glass-card" style={{ textAlign: "center", padding: "4rem 2rem", borderColor: "var(--input-error)" }}>
            <div style={{ color: "var(--input-error)", fontSize: "1.1rem" }}>⚠️ Error: {error}</div>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="empty-dashboard">
            <div className="empty-icon">📂</div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700 }}>No applicants found</h3>
            <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem" }}>
              {search || roleFilter !== "all" 
                ? "Try adjusting your search query or role filter settings."
                : "No job applications have been submitted to this server yet."}
            </p>
            {!search && roleFilter === "all" && (
              <Link href="/" className="btn btn-secondary" style={{ marginTop: "1rem", textDecoration: "none" }}>
                Submit First Application
              </Link>
            )}
          </div>
        ) : (
          <div className="submissions-list">
            {filteredSubmissions.map((submission) => (
              <div key={submission.trackingId} className="submission-row-card">
                
                {/* Profile Name & Email */}
                <div className="row-user-info">
                  <div className="row-name">{submission.fullName}</div>
                  <div className="row-meta">
                    <span className={`badge badge-${submission.preferredRole}`}>
                      {getRoleLabel(submission.preferredRole)}
                    </span>
                    <span>•</span>
                    <span style={{ fontSize: "0.85rem" }}>{submission.email}</span>
                  </div>
                </div>

                {/* Experience & Salary */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <div style={{ fontSize: "0.9rem", color: "var(--foreground)", fontWeight: 500 }}>
                    Exp: {getExperienceLabel(submission.experienceLevel)}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                    Salary: ${Number(submission.expectedSalary).toLocaleString()}/yr
                  </div>
                </div>

                {/* Skills Preview */}
                <div className="row-skills">
                  {submission.skills.slice(0, 4).map((skill) => (
                    <span key={skill} className="skills-pill-mini">
                      {skill}
                    </span>
                  ))}
                  {submission.skills.length > 4 && (
                    <span className="skills-pill-mini" style={{ color: "var(--primary)", fontWeight: 600 }}>
                      +{submission.skills.length - 4} more
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="row-actions">
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
                    onClick={() => setSelectedSubmission(submission)}
                  >
                    View Details
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details Modal overlay */}
      {selectedSubmission && (
        <div className="modal-overlay" onClick={() => setSelectedSubmission(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedSubmission(null)}>
              ✕
            </button>
            
            <h2 className="title-gradient" style={{ fontSize: "1.75rem", textAlign: "left", marginBottom: "0.25rem" }}>
              {selectedSubmission.fullName}
            </h2>
            <p style={{ color: "var(--muted-foreground)", fontSize: "0.85rem", marginBottom: "1rem" }}>
              Tracking ID: <span style={{ fontFamily: "var(--font-mono)", color: "var(--primary)" }}>{selectedSubmission.trackingId}</span>
            </p>

            <div className="summary-card" style={{ background: "rgba(255,255,255,0.02)", padding: "1.25rem", marginBottom: "1.5rem" }}>
              <div className="summary-title" style={{ fontSize: "0.75rem" }}>Contact & Background</div>
              <div className="summary-item">
                <span className="summary-label">Email:</span>
                <span className="summary-value">{selectedSubmission.email}</span>
              </div>
              {selectedSubmission.phone && (
                <div className="summary-item">
                  <span className="summary-label">Phone:</span>
                  <span className="summary-value">{selectedSubmission.phone}</span>
                </div>
              )}
              <div className="summary-item">
                <span className="summary-label">Target Role:</span>
                <span className="summary-value" style={{ fontWeight: 600 }}>{getRoleLabel(selectedSubmission.preferredRole)} Engineer</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Experience:</span>
                <span className="summary-value">{getExperienceLabel(selectedSubmission.experienceLevel)}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Expected Salary:</span>
                <span className="summary-value">${Number(selectedSubmission.expectedSalary).toLocaleString()}/year</span>
              </div>
              {selectedSubmission.resumeFileName && (
                <div className="summary-item">
                  <span className="summary-label">Uploaded Resume:</span>
                  <span className="summary-value" style={{ color: "var(--primary)", fontWeight: 600 }}>📄 {selectedSubmission.resumeFileName}</span>
                </div>
              )}
            </div>

            {/* Links Block */}
            <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1.5rem" }}>
              <a 
                href={selectedSubmission.gitHubUrl.startsWith("http") ? selectedSubmission.gitHubUrl : "https://" + selectedSubmission.gitHubUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="link-icon-btn"
              >
                🔗 GitHub Profile
              </a>
              {selectedSubmission.portfolioUrl && (
                <a 
                  href={selectedSubmission.portfolioUrl.startsWith("http") ? selectedSubmission.portfolioUrl : "https://" + selectedSubmission.portfolioUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="link-icon-btn"
                >
                  🔗 Portfolio / Website
                </a>
              )}
            </div>

            {/* Skill Tags */}
            <div className="modal-section-title">Core Skills</div>
            <div className="skills-grid" style={{ marginTop: "0.25rem", gap: "0.5rem" }}>
              {selectedSubmission.skills.map((skill) => (
                <span key={skill} className="skill-pill selected" style={{ fontSize: "0.75rem", padding: "0.3rem 0.75rem", cursor: "default" }}>
                  {skill}
                </span>
              ))}
            </div>

            {/* Motivation statement */}
            <div className="modal-section-title">Why work with us?</div>
            <div className="modal-body-text">{selectedSubmission.motivation}</div>

            {/* Coding Challenge problem solved */}
            {selectedSubmission.techChallenge && (
              <>
                <div className="modal-section-title">Technical Challenge Solved</div>
                <div className="modal-body-text">{selectedSubmission.techChallenge}</div>
              </>
            )}
            
            <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end" }}>
              <button className="btn btn-secondary" onClick={() => setSelectedSubmission(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
