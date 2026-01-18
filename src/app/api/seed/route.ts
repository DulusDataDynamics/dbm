
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { collection, writeBatch, getDocs, query, doc } from 'firebase-admin/firestore';
import { clients, invoices, tasks, inventory } from '@/lib/data';

async function seedCollection(collectionName: string, data: any[]) {
    const collectionRef = adminDb.collection(collectionName);
    const q = query(collectionRef);
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
        console.log(`Collection ${collectionName} is not empty. Skipping seed.`);
        const docIds = snapshot.docs.map(doc => doc.id);
        return { message: `Collection ${collectionName} already contains data.`, skipped: true, docIds };
    }

    const batch = adminDb.batch();
    const docIds: string[] = [];
    data.forEach((item) => {
        const docRef = collectionRef.doc(); // Let Firestore generate the ID
        batch.set(docRef, item);
        docIds.push(docRef.id);
    });
    
    await batch.commit();
    console.log(`Seeded ${collectionName} collection.`);
    return { message: `Successfully seeded ${collectionName}.`, skipped: false, docIds };
}

async function seedInvoices(clientIds: string[]) {
    const collectionRef = adminDb.collection('invoices');
    const q = query(collectionRef);
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
        console.log(`Collection invoices is not empty. Skipping seed.`);
        return { message: `Collection invoices already contains data.`, skipped: true };
    }
    
    if (clientIds.length === 0) {
        console.log(`No client IDs provided for invoice seeding. Skipping.`);
        return { message: `No client IDs to link.`, skipped: true };
    }

    const batch = adminDb.batch();
    invoices.forEach((invoice) => {
        // Randomly assign a client ID from the list
        const randomClientId = clientIds[Math.floor(Math.random() * clientIds.length)];
        const { clientId: _, ...rest } = invoice; // remove placeholder clientId
        const newInvoice = { ...rest, clientId: randomClientId };
        
        const docRef = collectionRef.doc();
        batch.set(docRef, newInvoice);
    });
    await batch.commit();
    console.log(`Seeded invoices collection.`);
    return { message: `Successfully seeded invoices.`, skipped: false };
}


export async function GET() {
    try {
        // Check if Firebase Admin is initialized. It will be null if the required
        // environment variable is missing, preventing build-time errors.
        if (!adminDb) {
             return NextResponse.json({ 
                error: 'Firebase Admin not configured', 
                details: 'FIREBASE_ADMIN_KEY is not set or invalid in environment variables. Cannot seed database.' 
            }, { status: 500 });
        }

        const results = [];
        
        const clientResult = await seedCollection('clients', clients);
        results.push(clientResult);

        if (clientResult.docIds && clientResult.docIds.length > 0) {
            const invoiceResult = await seedInvoices(clientResult.docIds);
            results.push(invoiceResult);
        }

        results.push(await seedCollection('tasks', tasks));
        results.push(await seedCollection('inventory', inventory));
        
        const allSkipped = results.every(r => r.skipped);

        if (allSkipped) {
            return NextResponse.json({ message: 'All collections already contain data. No new data was seeded.' });
        }

        return NextResponse.json({ message: 'Database seeding completed.', results });

    } catch (error) {
        console.error('Error seeding database:', error);
        return NextResponse.json({ error: 'Failed to seed database', details: (error as Error).message }, { status: 500 });
    }
}
