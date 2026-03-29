import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        // User authentication
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ 
                success: false, 
                reason: 'NOT_LOGGED_IN' 
            }, { status: 401 });
        }

        // Get PlayerStats with service role to bypass RLS
        const statsData = await base44.asServiceRole.entities.PlayerStats.filter({ 
            user_id: user.id 
        });

        const coins = statsData.length > 0 ? (statsData[0].total_coins || 0) : 0;

        return Response.json({ 
            success: true,
            coins: coins
        });

    } catch (error) {
        console.error('Error in getPlayerCoins:', error);
        return Response.json({ 
            success: false, 
            reason: 'SERVER_ERROR',
            message: error.message 
        }, { status: 500 });
    }
});