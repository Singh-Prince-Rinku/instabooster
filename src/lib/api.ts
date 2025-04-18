// Types for the API responses
export type ApiResponse = {
  success: boolean;
  message: string;
  data?: any;
};

// Types for the boost operations
export type BoostType = 'likes' | 'followers' | 'reels' | 'comments' | 'other';

export type BoostData = {
  id: string;
  userId: string;
  type: BoostType;
  target: string; // URL or profile link
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  cost: number;
  createdAt: Date;
  metadata?: Record<string, any>; // For storing ElectroSMM order details
};

// API Service for secure Instagram engagement
export const InstagramAPI = {
  // Boost Instagram likes
  async boostLikes(postUrl: string, amount: number): Promise<ApiResponse> {
    try {
      const response = await fetch('/api/boost/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postUrl, amount }),
      });

      return await response.json();
    } catch (error) {
      console.error('Error boosting likes:', error);
      return {
        success: false,
        message: 'Failed to boost likes. Please try again later.',
      };
    }
  },

  // Boost Instagram followers
  async boostFollowers(profileUrl: string, amount: number): Promise<ApiResponse> {
    try {
      const response = await fetch('/api/boost/followers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profileUrl, amount }),
      });

      return await response.json();
    } catch (error) {
      console.error('Error boosting followers:', error);
      return {
        success: false,
        message: 'Failed to boost followers. Please try again later.',
      };
    }
  },

  // Boost Instagram reels views
  async boostReels(reelUrl: string, amount: number): Promise<ApiResponse> {
    try {
      const response = await fetch('/api/boost/reels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reelUrl, amount }),
      });

      return await response.json();
    } catch (error) {
      console.error('Error boosting reels views:', error);
      return {
        success: false,
        message: 'Failed to boost reels views. Please try again later.',
      };
    }
  },

  // Boost Instagram comments
  async boostComments(postUrl: string, amount: number): Promise<ApiResponse> {
    try {
      const response = await fetch('/api/boost/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postUrl, amount }),
      });

      return await response.json();
    } catch (error) {
      console.error('Error boosting comments:', error);
      return {
        success: false,
        message: 'Failed to boost comments. Please try again later.',
      };
    }
  },
}; 