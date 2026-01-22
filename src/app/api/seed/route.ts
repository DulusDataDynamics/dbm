
import { NextResponse } from 'next/server';
import { adminDb, isAdminEnabled } from '@/lib/firebase-admin';
import { collection, writeBatch, getDocs, query } from 'firebase-admin/firestore';
import { clients, tasks, inventory } from '@/lib/data';

async function seedCollection(collectionName: string, data: any[], userId: string) {
    if (!adminDb) {
        throw new Error("Firebase Admin is not initialized.");
    }
    const collectionRef = adminDb.collection('users').doc(userId).collection(collectionName);
    const q = query(collectionRef);
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
        console.log(`Collection ${collectionName} is not empty for user ${userId}. Skipping seed.`);
        return { message: `Collection ${collectionName} already contains data.`, skipped: true };
    }

    const batch = adminDb.batch();
    data.forEach((item) => {
        const docRef = collectionRef.doc(); // Let Firestore generate the ID
        batch.set(docRef, item);
    });
    
    await batch.commit();
    console.log(`Seeded ${collectionName} collection for user ${userId}.`);
    return { message: `Successfully seeded ${collectionName}.`, skipped: false };
}


export async function GET(req: Request) {
    // Check if Firebase Admin is enabled.
    if (!isAdminEnabled || !adminDb) {
         return NextResponse.json({ 
            error: 'Admin features are disabled.', 
            details: 'The Firebase Admin SDK is not initialized, likely due to a missing FIREBASE_ADMIN_KEY environment variable. This endpoint is not available.' 
        }, { status: 403 });
    }
    
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'Missing userId query parameter.' }, { status: 400 });
    }

    try {
        const results = [];
        
        results.push(await seedCollection('clients', clients, userId));
        results.push(await seedCollection('tasks', tasks, userId));
        results.push(await seedCollection('inventory', inventory, userId));
        
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
