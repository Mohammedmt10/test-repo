// src/app/api/submit/route.ts
import { NextResponse } from "next/server";
import { saveSubmission } from "../../../lib/db";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Save to local JSON database
    const saved = saveSubmission({
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      portfolioUrl: data.portfolioUrl,
      gitHubUrl: data.gitHubUrl,
      preferredRole: data.preferredRole,
      experienceLevel: data.experienceLevel,
      skills: data.skills || [],
      motivation: data.motivation,
      techChallenge: data.techChallenge,
      expectedSalary: data.expectedSalary,
      resumeFileName: data.resumeFileName,
      trackingId: data.trackingId,
    });
    
    console.log("\n🚀 [Server API] New Job Application Saved:");
    console.log("-----------------------------------------");
    console.log(`Tracking ID:      ${saved.trackingId}`);
    console.log(`Full Name:        ${saved.fullName}`);
    console.log(`Email:            ${saved.email}`);
    console.log(`Preferred Role:   ${saved.preferredRole}`);
    console.log(`Core Skills:      ${saved.skills.join(", ")}`);
    console.log(`Expected Salary:  $${Number(saved.expectedSalary).toLocaleString()}/year`);
    console.log(`Submitted At:     ${saved.submittedAt}`);
    console.log("-----------------------------------------\n");

    return NextResponse.json({ success: true, data: saved });
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
