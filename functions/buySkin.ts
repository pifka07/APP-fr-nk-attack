import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Authenticate user first
        const user = await base44.auth.me();
        if (!user) {
            console.log('User not authenticated');
            return Response.json({ 
                success: false, 
                reason: 'NOT_LOGGED_IN' 
            }, { status: 401 });
        }

        // Parse request body
        const body = await req.json();
        console.log('Received body:', JSON.stringify(body));
        const { skin_id } = body;

        if (!skin_id) {
            console.log('Missing skin_id');
            return Response.json({ 
                success: false, 
                reason: 'INVALID_REQUEST',
                body: body
            }, { status: 400 });
        }

        console.log('Processing skin purchase for user:', user.id, 'skin:', skin_id);

        // Get skin
        const allSkins = await base44.asServiceRole.entities.Skin.list();
        const skin = allSkins.find(s => s.id === skin_id);
        
        if (!skin) {
            return Response.json({ 
                success: false, 
                reason: 'SKIN_NOT_FOUND' 
            }, { status: 404 });
        }

        // Get skin price
        const skinPrice = skin.cost_coins ?? 0;
        if (skinPrice <= 0) {
            return Response.json({ 
                success: false, 
                reason: 'INVALID_SKIN_PRICE' 
            }, { status: 400 });
        }

        // Check if already owned
        const ownedSkins = await base44.asServiceRole.entities.PlayerSkin.filter({
            user_id: user.id,
            skin_id: skin_id
        });

        if (ownedSkins.length > 0) {
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

        // Check coins
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

        // Update User entity for consistency
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
        console.error('buySkin error:', error);
        return Response.json({ 
            success: false, 
            reason: 'SERVER_ERROR',
            message: error.message
        }, { status: 500 });
    }
});