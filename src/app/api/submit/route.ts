// src/app/api/submit/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    console.log("\n🚀 [Server API] New Job Application Submitted:");
    console.log("-----------------------------------------");
    console.log(`Tracking ID:      ${data.trackingId}`);
    console.log(`Full Name:        ${data.fullName}`);
    console.log(`Email:            ${data.email}`);
    console.log(`Phone:            ${data.phone || "N/A"}`);
    console.log(`GitHub Profile:   ${data.gitHubUrl}`);
    console.log(`Portfolio/Web:    ${data.portfolioUrl || "N/A"}`);
    console.log(`Preferred Role:   ${data.preferredRole}`);
    console.log(`Experience Level: ${data.experienceLevel}`);
    console.log(`Core Skills:      ${data.skills?.join(", ") || ""}`);
    console.log(`Expected Salary:  $${Number(data.expectedSalary).toLocaleString()}/year`);
    console.log(`Resume Uploaded:  ${data.resumeFileName || "None"}`);
    console.log("-----------------------------------------\n");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
