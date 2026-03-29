import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 });
    }

    // Log the contact submission
    console.log("\n═══ NEW CONTACT FORM SUBMISSION ═══");
    console.log(`Name:    ${name}`);
    console.log(`Email:   ${email}`);
    console.log(`Subject: ${subject || "N/A"}`);
    console.log(`Message: ${message}`);
    console.log(`Time:    ${new Date().toISOString()}`);
    console.log("═══════════════════════════════════\n");

    // TODO: Integrate with email service (Resend, Nodemailer, etc.)
    // or database (Supabase, Firebase, etc.)

    return NextResponse.json({ success: true, message: "Message received!" });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
