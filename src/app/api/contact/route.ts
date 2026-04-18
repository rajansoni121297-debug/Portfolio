import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

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

    // Store message locally in messages.json
    const filePath = path.join(process.cwd(), "messages.json");
    let messages = [];

    try {
      const fileData = await fs.readFile(filePath, "utf-8");
      messages = JSON.parse(fileData);
    } catch (err: any) {
      if (err.code !== "ENOENT") {
        console.error("Error reading messages.json", err);
      }
    }

    const newMessage = {
      id: crypto.randomUUID(),
      name,
      email,
      subject,
      message,
      createdAt: new Date().toISOString()
    };

    messages.push(newMessage);

    try {
      await fs.writeFile(filePath, JSON.stringify(messages, null, 2));
    } catch (err) {
      console.error("Error writing messages.json", err);
      return NextResponse.json({ error: "Failed to save message" }, { status: 500 });
    }

    // Forward the data to Google Sheets Webhook
    try {
      const googleScriptUrl = "https://script.google.com/macros/s/AKfycbyu6BfFbQMeN6NOtiooEO-Q99nhHLWOKH5KTMgn3x8EK1S2GJhZDnqrVJPRD1-Lclv-/exec";
      
      // Google Apps Script will match these exact property names with the Sheet headers.
      await fetch(googleScriptUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Name: name,
          Email: email,
          Subject: subject || "N/A",
          Message: message
        }),
      });
    } catch (err) {
      console.error("Failed to forward to Google Sheets", err);
      // We don't bubble this error so the user still gets a success message if the local save worked.
    }

    return NextResponse.json({ success: true, message: "Message received!" });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
