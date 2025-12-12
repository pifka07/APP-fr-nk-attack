import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Parse body first
        let body;
        try {
            body = await req.json();
        } catch (e) {
            return Response.json({ 
                success: false, 
                reason: 'INVALID_JSON',
                error: e.message
            }, { status: 400 });
        }

        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ 
                success: false, 
                reason: 'NOT_LOGGED_IN' 
            }, { status: 401 });
        }

        const { skin_id } = body;
        if (!skin_id) {
            return Response.json({ 
                success: false, 
                reason: 'INVALID_REQUEST',
                received: body
            }, { status: 400 });
        }

        // Get skin
        const allSkins = await base44.asServiceRole.entities.Skin.list();
        const skin = allSkins.find(s => s.id === skin_id);
        
        if (!skin) {
            return Response.json({ 
                success: false, 
                reason: 'SKIN_NOT_FOUND' 
            }, { status: 404 });
        }

        // Get skin price (handle different field names)
        const skinPrice = skin.cost_coins ?? skin.price ?? skin.cost ?? 0;
        
        if (skinPrice <= 0) {
            return Response.json({ 
                success: false, 
                reason: 'INVALID_SKIN_PRICE' 
            }, { status: 400 });
        }

        // Check if already owned
        const ownedSkins = await base44.asServiceRole.entities.PlayerSkin.list();
        const alreadyOwned = ownedSkins.find(ps => ps.user_id === user.id && ps.skin_id === skin_id);

        if (alreadyOwned) {
            return Response.json({ 
                success: false, 
                reason: 'SKIN_ALREADY_OWNED' 
            }, { status: 400 });
        }

        // Get or create PlayerStats
        const playerStatsList = await base44.asServiceRole.entities.PlayerStats.filter({
            user_id: user.id
        });

        let playerStats;
        if (playerStatsList.length === 0) {
            playerStats = await base44.asServiceRole.entities.PlayerStats.create({
                user_id: user.id,
                total_score: 0,
                total_coins: 0,
                total_distance: 0,
                total_runs: 0,
                best_score: 0,
                best_distance: 0
            });
        } else {
            playerStats = playerStatsList[0];
        }

        // Check coins from PlayerStats
        const currentCoins = playerStats.total_coins || 0;
        if (currentCoins < skinPrice) {
            return Response.json({ 
                success: false, 
                reason: 'NOT_ENOUGH_COINS',
                required: skinPrice,
                available: currentCoins
            }, { status: 400 });
        }

        // Deduct coins from PlayerStats
        await base44.asServiceRole.entities.PlayerStats.update(playerStats.id, {
            total_coins: currentCoins - skinPrice
        });

        // Update User entity too (for consistency)
        await base44.asServiceRole.entities.User.update(user.id, {
            total_coins: currentCoins - skinPrice
        });

        // Create PlayerSkin
        await base44.asServiceRole.entities.PlayerSkin.create({
            user_id: user.id,
            skin_id: skin_id,
            owned: true
        });

        return Response.json({ 
            success: true,
            coins_remaining: currentCoins - skinPrice
        });

    } catch (error) {
        console.error('Error in buySkin:', error);
        console.error('Error stack:', error.stack);
        return Response.json({ 
            success: false, 
            reason: 'SERVER_ERROR',
            message: error.message,
            stack: error.stack
        }, { status: 500 });
    }
});