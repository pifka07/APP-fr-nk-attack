import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // 1️⃣ User holen
    const user = await base44.auth.me();
    console.log('🔐 User ID:', user?.id);
    if (!user) {
      console.log('❌ User not logged in');
      return Response.json({ success: false, reason: 'NOT_LOGGED_IN' }, { status: 200 });
    }

    const payload = await req.json();
    console.log('📦 Raw Payload:', JSON.stringify(payload, null, 2));
    
    const skin_id = payload?.body?.skin_id || payload?.skin_id;
    console.log('🎨 Extracted skin_id:', skin_id);
    
    if (!skin_id) {
      console.log('❌ No skin_id provided');
      return Response.json({ success: false, reason: 'INVALID_REQUEST', payload_received: payload }, { status: 200 });
    }

    // 2️⃣ Skin laden
    console.log('🔍 Searching for skin with ID:', skin_id);
    const skins = await base44.asServiceRole.entities.Skin.filter({ id: skin_id });
    console.log('📋 Skins found:', skins.length);
    
    if (skins.length === 0) {
      console.log('❌ Skin not found');
      return Response.json({ success: false, reason: 'SKIN_NOT_FOUND' }, { status: 200 });
    }
    
    const skinRecord = skins[0];
    const skin = skinRecord.data || skinRecord;
    const price = skin.cost_coins ?? 0;
    console.log('💎 Skin:', skin.name, '| Price:', price);

    // 3️⃣ Coins vom User holen
    const currentCoins = user.total_coins ?? 0;
    console.log('💰 Current coins:', currentCoins);

    // 4️⃣ Bereits gekauft?
    console.log('🔍 Checking if already owned...');
    const owned = await base44.asServiceRole.entities.PlayerSkin.filter({
      user_id: user.id,
      skin_id
    });
    console.log('👀 Already owned?', owned.length > 0);

    if (owned.length > 0) {
      console.log('❌ SKIN_ALREADY_OWNED');
      return Response.json({ success: false, reason: 'SKIN_ALREADY_OWNED' }, { status: 200 });
    }

    // Coin-Check
    if (price > 0 && currentCoins < price) {
      console.log('❌ NOT_ENOUGH_COINS - Required:', price, 'Available:', currentCoins);
      return Response.json({
        success: false,
        reason: 'NOT_ENOUGH_COINS',
        required: price,
        available: currentCoins
      }, { status: 200 });
    }

    // 5️⃣ Skin anlegen
    console.log('✅ Creating PlayerSkin...');
    const newPlayerSkin = await base44.asServiceRole.entities.PlayerSkin.create({
      user_id: user.id,
      skin_id,
      owned: true
    });
    console.log('✅ PlayerSkin created:', newPlayerSkin.id);

    // 6️⃣ Coins abziehen
    let newCoinBalance = currentCoins;
    if (price > 0) {
      newCoinBalance = currentCoins - price;
      console.log('💸 Deducting coins:', currentCoins, '->', newCoinBalance);
      await base44.asServiceRole.entities.User.update(user.id, { total_coins: newCoinBalance });
      console.log('✅ Coins updated');
    }

    console.log('🎉 Purchase successful! Remaining coins:', newCoinBalance);
    return Response.json({
      success: true,
      coins_remaining: newCoinBalance
    });

  } catch (err) {
    console.error('❌ buySkin ERROR:', err);
    console.error('Stack:', err.stack);
    return Response.json({
      success: false,
      reason: 'SERVER_ERROR',
      message: err.message,
      details: err.toString()
    }, { status: 200 });
  }
});