import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getAuth } from 'firebase/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json();
    const { boostId } = body;
    
    if (!boostId) {
      return NextResponse.json(
        { success: false, message: 'Boost ID is required' },
        { status: 400 }
      );
    }
    
    // Verify admin status (this should be enhanced with Firebase Auth admin check)
    // For now, we'll just check if the boost exists
    const boostRef = doc(db, 'boosts', boostId);
    const boostSnap = await getDoc(boostRef);
    
    if (!boostSnap.exists()) {
      return NextResponse.json(
        { success: false, message: 'Boost not found' },
        { status: 404 }
      );
    }
    
    // Call the automation endpoint
    try {
      const automationResponse = await fetch(new URL('/api/automation', request.url).toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ boostId }),
      });
      
      if (!automationResponse.ok) {
        const errorText = await automationResponse.text();
        return NextResponse.json(
          { success: false, message: `Failed to trigger automation: ${errorText}` },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: 'Boost processing triggered successfully',
      });
    } catch (error) {
      console.error('Error triggering automation:', error);
      return NextResponse.json(
        { success: false, message: 'Error triggering automation' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in admin trigger-boost endpoint:', error);
    
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 