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

    // 3️⃣ Coins von PlayerStats holen (primäre Quelle)
    const statsResult = await base44.asServiceRole.entities.PlayerStats.filter({ user_id: user.id });
    console.log('🔍 Found PlayerStats entries:', statsResult.length);
    
    let playerStats;
    
    if (statsResult.length === 0) {
        // Keine Stats gefunden - Fehler zurückgeben
        console.log('❌ No PlayerStats found for user');
        return Response.json({ 
            success: false, 
            reason: 'NO_STATS_YET',
            message: 'Play at least one game first to unlock the shop!'
        }, { status: 400 });
    } else if (statsResult.length === 1) {
        // Genau ein Eintrag - perfekt
        playerStats = statsResult[0];
        console.log('✅ Using single PlayerStats entry');
    } else {
        // Mehrere Einträge - nimm den mit den meisten Coins
        playerStats = statsResult.sort((a, b) => (b.total_coins || 0) - (a.total_coins || 0))[0];
        console.log('⚠️ Multiple PlayerStats found, using one with most coins:', playerStats.total_coins);
    }

    const currentCoins = playerStats.total_coins ?? 0;
    console.log('💰 PlayerStats Coins:', currentCoins);

    // 4️⃣ Bereits gekauft?
    const owned = await base44.asServiceRole.entities.PlayerSkin.filter({
      user_id: user.id,
      skin_id
    });
    console.log('Bereits gekauft?', owned.length > 0);

    if (owned.length > 0) {
      console.log('❌ SKIN_ALREADY_OWNED');
      return Response.json({ success: false, reason: 'SKIN_ALREADY_OWNED' }, { status: 400 });
    }

    // Coin-Check HIER durchführen (nachdem wir wissen, dass der Skin nicht bereits owned ist)
    if (price > 0 && currentCoins < price) {
      console.log('❌ NOT_ENOUGH_COINS - Benötigt:', price, 'Verfügbar:', currentCoins);
      return Response.json({
        success: false,
        reason: 'NOT_ENOUGH_COINS',
        required: price,
        available: currentCoins
      }, { status: 400 });
    }

    // 5️⃣ Skin anlegen (mit Service Role)
    console.log('Erstelle PlayerSkin...');
    const newPlayerSkin = await base44.asServiceRole.entities.PlayerSkin.create({
      user_id: user.id,
      skin_id,
      owned: true
    });
    console.log('PlayerSkin erstellt:', newPlayerSkin);

    // 6️⃣ Coins abziehen (nur wenn Skin Coins kostet)
    let newCoinBalance = currentCoins;
    if (price > 0) {
      newCoinBalance = currentCoins - price;
      await base44.asServiceRole.entities.PlayerStats.update(playerStats.id, { total_coins: newCoinBalance });
      console.log('Coins abgezogen. Neuer Stand:', newCoinBalance);
    }

    return Response.json({
      success: true,
      coins_remaining: newCoinBalance
    });

  } catch (err) {
    console.error('buySkin ERROR', err);
    console.error('Stack:', err.stack);
    return Response.json({
      success: false,
      reason: 'SERVER_ERROR',
      message: err.message,
      stack: err.stack
    }, { status: 500 });
  }
});