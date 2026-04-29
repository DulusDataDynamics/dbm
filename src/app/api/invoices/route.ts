
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Define the path to the JSON file where invoices will be stored.
const invoicesFilePath = path.join(process.cwd(), 'invoices.json');

// Helper function to read invoices from the file.
function readInvoices(): any[] {
  try {
    if (fs.existsSync(invoicesFilePath)) {
      const fileContent = fs.readFileSync(invoicesFilePath, 'utf-8');
      // If the file is empty or just whitespace, return an empty array
      return fileContent.trim() ? JSON.parse(fileContent) : [];
    }
  } catch (error) {
    console.error('Error reading invoices file:', error);
  }
  return [];
}

// Helper function to write invoices to the file.
function writeInvoices(invoices: any[]): void {
  try {
    fs.writeFileSync(invoicesFilePath, JSON.stringify(invoices, null, 2));
  } catch (error) {
    console.error('Error writing invoices file:', error);
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const invoices = readInvoices();

    const newInvoice = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString(),
    };

    invoices.push(newInvoice);
    writeInvoices(invoices);

    console.log("Saved to file ✅:", newInvoice);

    return NextResponse.json({ success: true, invoice: newInvoice });
  } catch (error) {
    console.error("API POST Error:", error);
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }
}

export async function GET() {
  const invoices = readInvoices();
  return NextResponse.json({ invoices });
}
