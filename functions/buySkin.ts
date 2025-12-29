import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // 1️⃣ User holen
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ success: false, reason: 'NOT_LOGGED_IN' }, { status: 401 });
    }

    const { skin_id } = await req.json();
    if (!skin_id) {
      return Response.json({ success: false, reason: 'INVALID_REQUEST' }, { status: 400 });
    }

    // 2️⃣ Skin laden (Admin → OK)
    const skin = (await base44.asServiceRole.entities.Skin.get(skin_id));
    if (!skin) {
      return Response.json({ success: false, reason: 'SKIN_NOT_FOUND' }, { status: 404 });
    }

    const price = skin.cost_coins ?? 0;
    if (price <= 0) {
      return Response.json({ success: false, reason: 'INVALID_SKIN_PRICE' }, { status: 400 });
    }

    // 3️⃣ PlayerStats laden (mit Service Role für Filter)
    const stats = await base44.asServiceRole.entities.PlayerStats.filter({ user_id: user.id });
    if (stats.length === 0) {
      return Response.json({ success: false, reason: 'NO_PLAYER_STATS' }, { status: 400 });
    }

    const playerStats = stats[0];

    if (playerStats.total_coins < price) {
      return Response.json({
        success: false,
        reason: 'NOT_ENOUGH_COINS',
        required: price,
        available: playerStats.total_coins
      }, { status: 400 });
    }

    // 4️⃣ Bereits gekauft?
    const owned = await base44.asServiceRole.entities.PlayerSkin.filter({
      user_id: user.id,
      skin_id
    });

    if (owned.length > 0) {
      return Response.json({ success: false, reason: 'SKIN_ALREADY_OWNED' }, { status: 400 });
    }

    // 5️⃣ Coins abziehen
    const newCoinBalance = playerStats.total_coins - price;
    
    await Promise.all([
      base44.entities.PlayerStats.update(playerStats.id, {
        total_coins: newCoinBalance
      }),
      base44.auth.updateMe({ total_coins: newCoinBalance })
    ]);

    // 6️⃣ Skin anlegen (mit Service Role)
    await base44.asServiceRole.entities.PlayerSkin.create({
      user_id: user.id,
      skin_id,
      owned: true
    });

    return Response.json({
      success: true,
      coins_remaining: playerStats.total_coins - price
    });

  } catch (err) {
    console.error('buySkin ERROR', err);
    return Response.json({
      success: false,
      reason: 'SERVER_ERROR',
      message: err.message
    }, { status: 500 });
  }
});