import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ 
                success: false, 
                reason: 'NOT_LOGGED_IN' 
            }, { status: 401 });
        }

        const { skin_id } = await req.json();

        if (!skin_id) {
            return Response.json({ 
                success: false, 
                reason: 'INVALID_REQUEST' 
            }, { status: 400 });
        }

        // Get skin
        const skins = await base44.asServiceRole.entities.Skin.filter({ id: skin_id });
        if (skins.length === 0) {
            return Response.json({ 
                success: false, 
                reason: 'SKIN_NOT_FOUND' 
            }, { status: 404 });
        }
        const skin = skins[0];

        // Check if already owned
        const existingSkins = await base44.asServiceRole.entities.PlayerSkin.filter({ 
            user_id: user.id, 
            skin_id: skin_id 
        });

        if (existingSkins.length > 0) {
            return Response.json({ 
                success: false, 
                reason: 'SKIN_ALREADY_OWNED' 
            }, { status: 400 });
        }

        // Check coins
        const currentCoins = user.total_coins || 0;
        if (currentCoins < skin.cost_coins) {
            return Response.json({ 
                success: false, 
                reason: 'NOT_ENOUGH_COINS',
                required: skin.cost_coins,
                available: currentCoins
            }, { status: 400 });
        }

        // Deduct coins
        await base44.auth.updateMe({
            total_coins: currentCoins - skin.cost_coins
        });

        // Create PlayerSkin
        await base44.asServiceRole.entities.PlayerSkin.create({
            user_id: user.id,
            skin_id: skin_id,
            owned: true
        });

        return Response.json({ 
            success: true,
            coins_remaining: currentCoins - skin.cost_coins
        });

    } catch (error) {
        console.error('Error in buySkin:', error);
        return Response.json({ 
            success: false, 
            reason: 'SERVER_ERROR',
            message: error.message 
        }, { status: 500 });
    }
});