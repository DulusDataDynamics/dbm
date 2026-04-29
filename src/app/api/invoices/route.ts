
import { NextResponse } from 'next/server';

// This is just a basic in-memory store for testing.
// It does NOT connect to a database.
let invoices: any[] = [];

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const newInvoice = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString()
    };

    invoices.push(newInvoice);

    console.log("Saved Invoice:", newInvoice);

    return NextResponse.json({ success: true, invoice: newInvoice });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }
}

export async function GET() {
    return NextResponse.json({ invoices });
}
