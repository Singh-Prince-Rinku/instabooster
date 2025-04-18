import { NextRequest, NextResponse } from 'next/server';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AutomationService from '@/lib/automation/automationService';
import { getAuth } from 'firebase/auth';
import { cookies } from 'next/headers';

// Initialize the automation service
const automationService = new AutomationService();

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
    
    // In a production environment, this should be secured by Firebase Auth
    // For now, we'll update the document directly
    const boostRef = doc(db, 'boosts', boostId);
    
    // Set the boost status to 'processing'
    await updateDoc(boostRef, { status: 'processing' });
    
    // Process the boost asynchronously
    processBoostAsync(boostId);
    
    return NextResponse.json({
      success: true,
      message: 'Boost processing initiated',
    });
  } catch (error) {
    console.error('Error triggering automation:', error);
    
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Process the boost asynchronously to avoid API timeout
async function processBoostAsync(boostId: string) {
  try {
    // Get the boost details
    const boostRef = doc(db, 'boosts', boostId);
    const boostSnap = await getDoc(boostRef);
    
    if (!boostSnap.exists()) {
      console.error(`Boost ${boostId} not found`);
      return;
    }
    
    const boostData = boostSnap.data();
    const { type, target, amount } = boostData;
    
    console.log(`Processing boost ${boostId} - ${type} for ${target} (${amount})`);
    
    try {
      // Process the boost using the automation service
      const success = await automationService.processBoost(type, target, amount);
      
      // Update the boost status
      if (success) {
        await updateDoc(boostRef, { 
          status: 'completed',
          completedAt: new Date()
        });
        console.log(`Boost ${boostId} completed successfully`);
      } else {
        await updateDoc(boostRef, { 
          status: 'failed',
          failedAt: new Date()
        });
        console.log(`Boost ${boostId} failed to complete`);
      }
    } catch (error: any) {
      console.error(`Error processing boost ${boostId}:`, error);
      await updateDoc(boostRef, { 
        status: 'failed',
        failedAt: new Date(),
        errorMessage: error.message || 'Unknown error'
      });
    }
  } catch (error) {
    console.error('Error in async boost processing:', error);
  }
} 