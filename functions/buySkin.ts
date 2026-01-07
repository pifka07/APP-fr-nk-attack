import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // 1️⃣ User holen
    const user = await base44.auth.me();
    console.log('User:', user?.id);
    if (!user) {
      return Response.json({ success: false, reason: 'NOT_LOGGED_IN' }, { status: 401 });
    }

    const payload = await req.json();
    console.log('=== RAW PAYLOAD ===', JSON.stringify(payload, null, 2));
    
    // Robust: Unterstützt beide Varianten { skin_id } und { body: { skin_id } }
    const skin_id = payload?.body?.skin_id || payload?.skin_id;
    console.log('=== EXTRACTED SKIN_ID ===', skin_id);
    
    if (!skin_id) {
      console.log('❌ INVALID_REQUEST - skin_id fehlt!');
      return Response.json({ success: false, reason: 'INVALID_REQUEST', payload_received: payload }, { status: 400 });
    }

    // 2️⃣ Skin laden (Admin → OK)
    const skins = await base44.asServiceRole.entities.Skin.filter({ id: skin_id });
    console.log('Skins gefunden:', skins.length);
    if (skins.length === 0) {
      return Response.json({ success: false, reason: 'SKIN_NOT_FOUND' }, { status: 404 });
    }
    const skinRecord = skins[0];
    const skin = skinRecord.data || skinRecord;
    console.log('Skin:', skin);

    const price = skin.cost_coins ?? 0;
    console.log('Price:', price);

    // 3️⃣ Coins von PlayerStats holen (primäre Quelle)
    const statsResult = await base44.asServiceRole.entities.PlayerStats.filter({ user_id: user.id });
    let playerStats = statsResult[0];
    
    if (!playerStats) {
        // PlayerStats erstellen, falls noch nicht vorhanden
        playerStats = await base44.asServiceRole.entities.PlayerStats.create({
            user_id: user.id,
            total_coins: 0,
            total_score: 0,
            total_distance: 0,
            best_score: 0,
            best_distance: 0,
            total_runs: 0
        });
        console.log('PlayerStats erstellt für User:', user.id);
    }
    
    const currentCoins = playerStats.total_coins ?? 0;
    console.log('PlayerStats Coins:', currentCoins);

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