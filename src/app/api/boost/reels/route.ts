import { NextRequest, NextResponse } from 'next/server';
import { createBoost, getUserData, updateUserCoins } from '@/lib/firestore';
import { FirebaseError } from 'firebase/app';

// Cost in coins per reel view
const COST_PER_VIEW = 0.5;

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json();
    const { reelUrl, amount, userId } = body;
    
    // Validate inputs
    if (!reelUrl || !reelUrl.includes('instagram.com')) {
      return NextResponse.json(
        { success: false, message: 'Invalid Instagram reel URL' },
        { status: 400 }
      );
    }
    
    if (!amount || amount < 50 || amount > 10000) {
      return NextResponse.json(
        { success: false, message: 'Amount must be between 50 and 10,000' },
        { status: 400 }
      );
    }
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 401 }
      );
    }
    
    // Calculate the cost
    const totalCost = Math.ceil(amount * COST_PER_VIEW);
    
    try {
      // Check if user has enough coins
      const userData = await getUserData(userId);
      
      if (!userData || userData.coins < totalCost) {
        return NextResponse.json(
          { success: false, message: 'Insufficient coins' },
          { status: 400 }
        );
      }
      
      // Create the boost record
      const boost = await createBoost(userId, 'reels', reelUrl, amount, totalCost);
      
      // Deduct the coins
      await updateUserCoins(userId, -totalCost);
      
      // Process the boost asynchronously by sending a request to our automation endpoint
      try {
        // Call the automation endpoint
        const automationResponse = await fetch(new URL('/api/automation', request.url).toString(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ boostId: boost.id }),
        });
        
        if (!automationResponse.ok) {
          console.error('Failed to trigger automation:', await automationResponse.text());
        }
      } catch (error) {
        console.error('Error triggering automation:', error);
        // We don't want to fail the request if automation triggering fails
        // The admin can manually trigger it later
      }
      
      return NextResponse.json({
        success: true,
        message: 'Reels views boost initiated successfully',
        data: {
          boost,
          remainingCoins: userData.coins - totalCost
        }
      });
    } catch (error) {
      console.error('Firestore operation error:', error);
      
      // Handle permission errors specially
      const firestoreError = error as FirebaseError;
      if (firestoreError.code === 'permission-denied') {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Database permission error. Please contact support.' 
          },
          { status: 403 }
        );
      }
      
      throw error; // Re-throw to be caught by outer catch
    }
  } catch (error) {
    console.error('Error boosting reels views:', error);
    
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 