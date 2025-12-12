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
        console.log('Found skins:', allSkins.length);
        const skin = allSkins.find(s => s.id === skin_id);
        
        if (!skin) {
            console.log('Skin not found:', skin_id);
            return Response.json({ 
                success: false, 
                reason: 'SKIN_NOT_FOUND' 
            }, { status: 404 });
        }

        console.log('Skin found:', skin.name, 'price:', skin.cost_coins);

        // Get skin price
        const skinPrice = skin.cost_coins ?? 0;
        if (skinPrice <= 0) {
            console.log('Invalid skin price:', skinPrice);
            return Response.json({ 
                success: false, 
                reason: 'INVALID_SKIN_PRICE',
                price: skinPrice
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

        // Check coins from User
        const userCoins = user.total_coins || 0;
        
        console.log('User coins:', userCoins, 'required:', skinPrice);
        
        if (userCoins < skinPrice) {
            console.log('Not enough coins');
            return Response.json({ 
                success: false, 
                reason: 'NOT_ENOUGH_COINS',
                required: skinPrice,
                available: userCoins
            }, { status: 400 });
        }

        // Deduct coins from User
        await base44.asServiceRole.entities.User.update(user.id, {
            total_coins: userCoins - skinPrice
        });

        // Create PlayerSkin
        await base44.asServiceRole.entities.PlayerSkin.create({
            user_id: user.id,
            skin_id: skin_id,
            owned: true
        });

        return Response.json({ 
            success: true,
            coins_remaining: userCoins - skinPrice
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