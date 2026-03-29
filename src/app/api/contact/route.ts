import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Log the contact submission (replace with email service like Resend/Nodemailer in production)
    console.log("Contact form submission:", { name, email, message, timestamp: new Date().toISOString() });

    // TODO: Integrate with email service
    // Example with Resend:
    // await resend.emails.send({
    //   from: 'portfolio@yourdomain.com',
    //   to: 'raj@email.com',
    //   subject: `New contact from ${name}`,
    //   text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    // });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
