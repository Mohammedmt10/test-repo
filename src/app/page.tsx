// src/app/page.tsx
"use client";

import React, { useState, useRef } from "react";

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  portfolioUrl: string;
  gitHubUrl: string;
  preferredRole: string;
  experienceLevel: string;
  skills: string[];
  motivation: string;
  techChallenge: string;
  expectedSalary: string;
  resumeFile: File | null;
  certify: boolean;
}

const AVAILABLE_SKILLS = [
  "React",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "Go",
  "Python",
  "Rust",
  "Docker",
  "Kubernetes",
  "AWS",
  "PostgreSQL",
  "GraphQL",
  "CSS/Sass",
  "HTML5",
  "Git",
];

const ROLES = [
  { id: "frontend", title: "Frontend Engineer", desc: "Build gorgeous UI/UX, responsive interfaces, and performant web apps." },
  { id: "backend", title: "Backend Engineer", desc: "Design APIs, scaling databases, microservices, and system architectures." },
  { id: "fullstack", title: "Fullstack Engineer", desc: "Master of both worlds; build beautiful frontends and scale robust backends." }
];

export default function ApplicationForm() {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    portfolioUrl: "",
    gitHubUrl: "",
    preferredRole: "fullstack",
    experienceLevel: "1-3",
    skills: [],
    motivation: "",
    techChallenge: "",
    expectedSalary: "",
    resumeFile: null,
    certify: false,
  });

  const [trackingId, setTrackingId] = useState<string>("");
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real-time field validation helper
  const validateField = (name: keyof FormData, value: string | string[] | boolean | File | null): string => {
    switch (name) {
      case "fullName":
        return typeof value === "string" && value.trim() === "" ? "Full Name is required" : "";
      case "email":
        if (typeof value === "string") {
          if (value.trim() === "") return "Email is required";
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return !emailRegex.test(value) ? "Please enter a valid email address" : "";
        }
        return "";
      case "gitHubUrl":
        if (typeof value === "string") {
          if (value.trim() === "") return "GitHub profile is required";
          const urlRegex = /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?$/i;
          return !urlRegex.test(value) ? "Please enter a valid GitHub profile URL (e.g., github.com/username)" : "";
        }
        return "";
      case "portfolioUrl":
        if (typeof value === "string" && value.trim() !== "") {
          try {
            new URL(value.startsWith("http") ? value : "https://" + value);
          } catch {
            return "Please enter a valid website URL";
          }
        }
        return "";
      case "skills":
        return Array.isArray(value) && value.length < 3 ? "Please select at least 3 skills" : "";
      case "motivation":
        if (typeof value === "string") {
          if (value.trim() === "") return "Please write a brief statement";
          return value.trim().length < 50 ? `Please write at least 50 characters (currently ${value.trim().length})` : "";
        }
        return "";
      case "expectedSalary":
        if (typeof value === "string") {
          if (value.trim() === "") return "Salary expectation is required";
          if (isNaN(Number(value)) || Number(value) <= 0) return "Please enter a positive number";
        }
        return "";
      case "certify":
        return !value ? "You must certify before submitting" : "";
      default:
        return "";
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear validation error on change
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSkillToggle = (skill: string) => {
    setFormData((prev) => {
      const skills = prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill];
      
      // Real-time validation for skills
      if (errors.skills) {
        setErrors((prevErr) => ({ ...prevErr, skills: skills.length >= 3 ? "" : prevErr.skills }));
      }
      return { ...prev, skills };
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, resumeFile: "File size must be under 5MB" }));
      } else {
        setFormData((prev) => ({ ...prev, resumeFile: file }));
        setErrors((prev) => ({ ...prev, resumeFile: "" }));
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, resumeFile: "File size must be under 5MB" }));
      } else {
        setFormData((prev) => ({ ...prev, resumeFile: file }));
        setErrors((prev) => ({ ...prev, resumeFile: "" }));
      }
    }
  };

  const validateStep = (currentStep: number): boolean => {
    const stepErrors: Partial<Record<keyof FormData, string>> = {};

    if (currentStep === 1) {
      const nameErr = validateField("fullName", formData.fullName);
      const emailErr = validateField("email", formData.email);
      const githubErr = validateField("gitHubUrl", formData.gitHubUrl);
      const portErr = validateField("portfolioUrl", formData.portfolioUrl);

      if (nameErr) stepErrors.fullName = nameErr;
      if (emailErr) stepErrors.email = emailErr;
      if (githubErr) stepErrors.gitHubUrl = githubErr;
      if (portErr) stepErrors.portfolioUrl = portErr;
    }

    if (currentStep === 2) {
      const skillsErr = validateField("skills", formData.skills);
      if (skillsErr) stepErrors.skills = skillsErr;
    }

    if (currentStep === 3) {
      const motivationErr = validateField("motivation", formData.motivation);
      const salaryErr = validateField("expectedSalary", formData.expectedSalary);
      if (!formData.resumeFile) {
        stepErrors.resumeFile = "Resume is required";
      }

      if (motivationErr) stepErrors.motivation = motivationErr;
      if (salaryErr) stepErrors.expectedSalary = salaryErr;
    }

    if (currentStep === 4) {
      const certifyErr = validateField("certify", formData.certify);
      if (certifyErr) stepErrors.certify = certifyErr;
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(4)) {
      const generatedId = `APP-${Math.floor(100000 + Math.random() * 900000)}`;
      setTrackingId(generatedId);
      
      // 1. Log to the client browser console
      console.log("🌐 [Client] Submitting Application Details:", {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        portfolioUrl: formData.portfolioUrl,
        gitHubUrl: formData.gitHubUrl,
        preferredRole: formData.preferredRole,
        experienceLevel: formData.experienceLevel,
        skills: formData.skills,
        motivation: formData.motivation,
        techChallenge: formData.techChallenge,
        expectedSalary: formData.expectedSalary,
        trackingId: generatedId,
        resumeFile: formData.resumeFile ? {
          name: formData.resumeFile.name,
          size: formData.resumeFile.size,
          type: formData.resumeFile.type
        } : null
      });

      // 2. Call server API to log to terminal console (compatible with ngrok)
      fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone || undefined,
          portfolioUrl: formData.portfolioUrl || undefined,
          gitHubUrl: formData.gitHubUrl,
          preferredRole: formData.preferredRole,
          experienceLevel: formData.experienceLevel,
          skills: formData.skills,
          motivation: formData.motivation,
          techChallenge: formData.techChallenge || undefined,
          expectedSalary: formData.expectedSalary,
          resumeFileName: formData.resumeFile?.name || undefined,
          trackingId: generatedId
        }),
      }).catch(err => console.error("Error submitting to API route:", err));

      setStep(5); // Success state
    }
  };

  // Calculate overall steps percentage for progress bar
  const progressPercent = ((step - 1) / 3) * 100;

  return (
    <main>
      <div className="glow-orb glow-orb-1"></div>
      <div className="glow-orb glow-orb-2"></div>
      
      <div className="container">
        {step < 5 ? (
          <div className="glass-card">
            <h1 className="title-gradient">Apply for Software Engineer</h1>
            <p className="subtitle">Join our high-performance engineering team and build the future of software.</p>
            
            {/* Custom Steps Progress Indicator */}
            <div className="steps-container">
              <div className="steps-progress" style={{ width: `${progressPercent}%` }}></div>
              
              <div className={`step-node ${step >= 1 ? "active" : ""} ${step > 1 ? "completed" : ""}`}>
                1
                <span className="step-label">Personal Info</span>
              </div>
              <div className={`step-node ${step >= 2 ? "active" : ""} ${step > 2 ? "completed" : ""}`}>
                2
                <span className="step-label">Skills</span>
              </div>
              <div className={`step-node ${step >= 3 ? "active" : ""} ${step > 3 ? "completed" : ""}`}>
                3
                <span className="step-label">Details</span>
              </div>
              <div className={`step-node ${step >= 4 ? "active" : ""} ${step > 4 ? "completed" : ""}`}>
                4
                <span className="step-label">Review</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              
              {/* STEP 1: Personal Info */}
              {step === 1 && (
                <div className="form-section">
                  <div className="form-group">
                    <label htmlFor="fullName">
                      <span>Full Name <span className="required">*</span></span>
                    </label>
                    <div className={errors.fullName ? "has-error" : ""}>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    {errors.fullName && <div className="error-message">⚠️ {errors.fullName}</div>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">
                      <span>Email Address <span className="required">*</span></span>
                    </label>
                    <div className={errors.email ? "has-error" : ""}>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="john.doe@company.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    {errors.email && <div className="error-message">⚠️ {errors.email}</div>}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="phone">
                        <span>Phone Number <span className="helper">(Optional)</span></span>
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        placeholder="+1 (555) 000-0000"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="portfolioUrl">
                        <span>Portfolio / Website <span className="helper">(Optional)</span></span>
                      </label>
                      <div className={errors.portfolioUrl ? "has-error" : ""}>
                        <input
                          type="url"
                          id="portfolioUrl"
                          name="portfolioUrl"
                          placeholder="johndoe.dev"
                          value={formData.portfolioUrl}
                          onChange={handleInputChange}
                        />
                      </div>
                      {errors.portfolioUrl && <div className="error-message">⚠️ {errors.portfolioUrl}</div>}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="gitHubUrl">
                      <span>GitHub Profile URL <span className="required">*</span></span>
                    </label>
                    <div className={errors.gitHubUrl ? "has-error" : ""}>
                      <input
                        type="url"
                        id="gitHubUrl"
                        name="gitHubUrl"
                        placeholder="github.com/johndoe"
                        value={formData.gitHubUrl}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    {errors.gitHubUrl && <div className="error-message">⚠️ {errors.gitHubUrl}</div>}
                  </div>
                </div>
              )}

              {/* STEP 2: Technical Profile */}
              {step === 2 && (
                <div className="form-section">
                  <div className="form-group">
                    <label>
                      <span>Preferred Role <span className="required">*</span></span>
                    </label>
                    <div className="radio-cards">
                      {ROLES.map((role) => (
                        <div
                          key={role.id}
                          className={`radio-card ${formData.preferredRole === role.id ? "selected" : ""}`}
                          onClick={() => setFormData((prev) => ({ ...prev, preferredRole: role.id }))}
                        >
                          <input
                            type="radio"
                            name="preferredRole"
                            value={role.id}
                            checked={formData.preferredRole === role.id}
                            onChange={() => {}} // Controlled via onClick on container
                          />
                          <div className="radio-card-title">{role.title}</div>
                          <div className="radio-card-desc">{role.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="experienceLevel">
                      <span>Years of Experience <span className="required">*</span></span>
                    </label>
                    <select
                      id="experienceLevel"
                      name="experienceLevel"
                      value={formData.experienceLevel}
                      onChange={handleInputChange}
                    >
                      <option value="entry">Entry Level (&lt; 1 year)</option>
                      <option value="1-3">1 - 3 years</option>
                      <option value="3-5">3 - 5 years</option>
                      <option value="5+">Senior (5+ years)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>
                      <span>Core Tech Stack / Skills <span className="required">*</span></span>
                      <span className="helper">Select at least 3 core competencies</span>
                    </label>
                    <div className="skills-grid">
                      {AVAILABLE_SKILLS.map((skill) => (
                        <div
                          key={skill}
                          className={`skill-pill ${formData.skills.includes(skill) ? "selected" : ""}`}
                          onClick={() => handleSkillToggle(skill)}
                        >
                          {skill}
                        </div>
                      ))}
                    </div>
                    {errors.skills && <div className="error-message" style={{ marginTop: "0.75rem" }}>⚠️ {errors.skills}</div>}
                  </div>
                </div>
              )}

              {/* STEP 3: Details & Resume */}
              {step === 3 && (
                <div className="form-section">
                  <div className="form-group">
                    <label htmlFor="motivation">
                      <span>Why are you excited to build with us? <span className="required">*</span></span>
                      <span className="helper">Min. 50 characters</span>
                    </label>
                    <div className={errors.motivation ? "has-error" : ""}>
                      <textarea
                        id="motivation"
                        name="motivation"
                        placeholder="Tell us about what drives you, what projects you find inspiring, and why you want to join our team..."
                        value={formData.motivation}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    {errors.motivation && <div className="error-message">⚠️ {errors.motivation}</div>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="techChallenge">
                      <span>Describe a difficult technical challenge you solved <span className="helper">(Optional)</span></span>
                    </label>
                    <textarea
                      id="techChallenge"
                      name="techChallenge"
                      placeholder="Explain the architecture, the blocker you faced, and your creative engineering solution..."
                      value={formData.techChallenge}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="expectedSalary">
                      <span>Salary Expectation <span className="required">*</span></span>
                      <span className="helper">USD / year</span>
                    </label>
                    <div className={errors.expectedSalary ? "has-error" : ""}>
                      <input
                        type="text"
                        id="expectedSalary"
                        name="expectedSalary"
                        placeholder="e.g. 95000"
                        value={formData.expectedSalary}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    {errors.expectedSalary && <div className="error-message">⚠️ {errors.expectedSalary}</div>}
                  </div>

                  <div className="form-group">
                    <label>
                      <span>Resume / CV <span className="required">*</span></span>
                      <span className="helper">PDF, DOCX up to 5MB</span>
                    </label>
                    <div
                      className={`file-upload-zone ${errors.resumeFile ? "has-error" : ""}`}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        type="file"
                        id="resume"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        accept=".pdf,.docx,.doc"
                        onChange={handleFileChange}
                      />
                      <div className="file-icon">📄</div>
                      {formData.resumeFile ? (
                        <>
                          <div className="file-name">{formData.resumeFile.name}</div>
                          <div className="file-size">{(formData.resumeFile.size / 1024 / 1024).toFixed(2)} MB</div>
                        </>
                      ) : (
                        <>
                          <div><strong>Click to upload</strong> or drag and drop</div>
                          <div className="file-size" style={{ color: "var(--muted-foreground)" }}>PDF, DOCX, or DOC (Max 5MB)</div>
                        </>
                      )}
                    </div>
                    {errors.resumeFile && <div className="error-message">⚠️ {errors.resumeFile}</div>}
                  </div>
                </div>
              )}

              {/* STEP 4: Review Application */}
              {step === 4 && (
                <div className="form-section">
                  <div className="form-group">
                    <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>Review Your Application</h3>
                    <p style={{ color: "var(--muted-foreground)", fontSize: "0.875rem", marginBottom: "1rem" }}>
                      Double check your details before sending them to the hiring manager.
                    </p>
                    
                    <div className="summary-card">
                      <div className="summary-title">Personal Details</div>
                      <div className="summary-item">
                        <span className="summary-label">Full Name:</span>
                        <span className="summary-value">{formData.fullName}</span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Email:</span>
                        <span className="summary-value">{formData.email}</span>
                      </div>
                      {formData.phone && (
                        <div className="summary-item">
                          <span className="summary-label">Phone:</span>
                          <span className="summary-value">{formData.phone}</span>
                        </div>
                      )}
                      <div className="summary-item">
                        <span className="summary-label">GitHub Profile:</span>
                        <span className="summary-value">{formData.gitHubUrl}</span>
                      </div>
                      {formData.portfolioUrl && (
                        <div className="summary-item">
                          <span className="summary-label">Portfolio:</span>
                          <span className="summary-value">{formData.portfolioUrl}</span>
                        </div>
                      )}
                    </div>

                    <div className="summary-card">
                      <div className="summary-title">Professional Profile</div>
                      <div className="summary-item">
                        <span className="summary-label">Role:</span>
                        <span className="summary-value">
                          {ROLES.find(r => r.id === formData.preferredRole)?.title || formData.preferredRole}
                        </span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Experience:</span>
                        <span className="summary-value">
                          {formData.experienceLevel === "entry" && "Entry Level (<1 yr)"}
                          {formData.experienceLevel === "1-3" && "1 - 3 years"}
                          {formData.experienceLevel === "3-5" && "3 - 5 years"}
                          {formData.experienceLevel === "5+" && "Senior (5+ yrs)"}
                        </span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Expected Salary:</span>
                        <span className="summary-value">${Number(formData.expectedSalary).toLocaleString()}/year</span>
                      </div>
                      <div className="summary-item" style={{ flexDirection: "column", gap: "0.5rem", alignItems: "flex-start" }}>
                        <span className="summary-label">Tech Stack:</span>
                        <div className="skills-grid" style={{ marginTop: "0.25rem" }}>
                          {formData.skills.map(s => (
                            <span key={s} className="skill-pill selected" style={{ fontSize: "0.75rem", padding: "0.3rem 0.75rem", cursor: "default" }}>
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="summary-item" style={{ marginTop: "1rem" }}>
                        <span className="summary-label">Resume / CV:</span>
                        <span className="summary-value" style={{ fontWeight: 600, color: "var(--primary)" }}>
                          📄 {formData.resumeFile?.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: "1rem" }}>
                    <label className="checkbox-container">
                      <input
                        type="checkbox"
                        name="certify"
                        checked={formData.certify}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, certify: e.target.checked }));
                          if (errors.certify) setErrors(prev => ({ ...prev, certify: "" }));
                        }}
                      />
                      <span className="checkmark"></span>
                      <span>I certify that all the information provided in this application is true and complete to the best of my knowledge. <span className="required">*</span></span>
                    </label>
                    {errors.certify && <div className="error-message">⚠️ {errors.certify}</div>}
                  </div>
                </div>
              )}

              {/* Form Action Navigation Buttons */}
              <div className="form-actions">
                {step > 1 && (
                  <button type="button" className="btn btn-secondary" onClick={prevStep}>
                    Back
                  </button>
                )}
                
                {step < 4 ? (
                  <button type="button" className="btn btn-primary" style={{ marginLeft: "auto" }} onClick={nextStep}>
                    Continue
                  </button>
                ) : (
                  <button type="submit" className="btn btn-primary" style={{ marginLeft: "auto" }}>
                    Submit Application
                  </button>
                )}
              </div>
            </form>
          </div>
        ) : (
          /* SUCCESS SCREEN (STEP 5) */
          <div className="glass-card success-container">
            <div className="success-icon-container">✓</div>
            <h2 className="success-title">Application Submitted!</h2>
            <p className="success-subtitle">
              Thank you for applying, {formData.fullName.split(" ")[0]}. We have sent a confirmation email to <strong>{formData.email}</strong>.
            </p>
            
            <div className="summary-card" style={{ marginBottom: "2rem" }}>
              <div className="summary-title">Hiring Status Dashboard</div>
              <div className="summary-item">
                <span className="summary-label">Applicant Name:</span>
                <span className="summary-value" style={{ fontWeight: 600 }}>{formData.fullName}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Target Role:</span>
                <span className="summary-value">
                  {ROLES.find(r => r.id === formData.preferredRole)?.title || formData.preferredRole}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Expected Salary:</span>
                <span className="summary-value">${Number(formData.expectedSalary).toLocaleString()}/yr</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Tracking ID:</span>
                <span className="summary-value" style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--primary)" }}>
                  {trackingId}
                </span>
              </div>
            </div>

            <div className="timeline">
              <div className="timeline-title">Your Hiring Process Roadmap</div>
              
              <div className="timeline-item active">
                <div className="timeline-header">Application Received (Completed)</div>
                <div className="timeline-desc">Your profile has been captured in our hiring system.</div>
              </div>

              <div className="timeline-item active">
                <div className="timeline-header">Resume Review (In Progress)</div>
                <div className="timeline-desc">Our lead engineers are matching your stack ({formData.skills.slice(0, 3).join(", ")}) against our roadmap.</div>
              </div>

              <div className="timeline-item">
                <div className="timeline-header">Intro Call (15 Mins)</div>
                <div className="timeline-desc">Cultural alignment and role overview with the recruitment lead.</div>
              </div>

              <div className="timeline-item">
                <div className="timeline-header">Deep-dive Technical Interview (60 Mins)</div>
                <div className="timeline-desc">Live architectural review, coding principles, and database design.</div>
              </div>
              
              <div className="timeline-item">
                <div className="timeline-header">Executive Fit & Offer</div>
                <div className="timeline-desc">Meet the engineering director and final decision.</div>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ marginTop: "2.5rem" }}
              onClick={() => {
                setStep(1);
                setFormData({
                  fullName: "",
                  email: "",
                  phone: "",
                  portfolioUrl: "",
                  gitHubUrl: "",
                  preferredRole: "fullstack",
                  experienceLevel: "1-3",
                  skills: [],
                  motivation: "",
                  techChallenge: "",
                  expectedSalary: "",
                  resumeFile: null,
                  certify: false,
                });
                setErrors({});
              }}
            >
              Submit Another Application
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
