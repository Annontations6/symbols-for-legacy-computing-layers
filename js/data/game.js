const game = {
    version: "1.0",
    timeSaved: Date.now(),
    layers: [],
    highestLayer: 0,
    highestUpdatedLayer: 0,
    automators: {
        autoMaxAll: new Automator("Auto Max All", "Automatically buys max on all Layers", () =>
        {
            for(let i = Math.max(0, game.volatility.autoMaxAll.apply().toNumber()); i < game.layers.length; i++)
            {
                game.layers[i].maxAll();
            }
        }, new DynamicLayerUpgrade(level => Math.floor(level / 3) + 1, () => null, () => "Decrease the Automator interval",
            level => Decimal.pow(10, PrestigeLayer.getPrestigeCarryOverForLayer(level.toNumber()) * [0.2, 0.5, 0.8][level.toNumber() % 3]),
            level => level.gt(0) ? Math.pow(0.8, level.toNumber() - 1) * 10 : Infinity, null, {
                getEffectDisplay: effectDisplayTemplates.automator()
            })),
        autoPrestige: new Automator("Auto Prestige", "Automatically prestiges all Layers", () =>
        {
            for(let i = 0; i < game.layers.length - 1; i++)
            {
                if(game.layers[game.layers.length - 2].canPrestige() && !game.settings.autoPrestigeHighestLayer)
                {
                    break;
                }
                if(game.layers[i].canPrestige() && !game.layers[i].isNonVolatile())
                {
                    game.layers[i].prestige();
                }
            }
        }, new DynamicLayerUpgrade(level => Math.floor(level / 2) + 2, () => null, () => "Decrease the Automator interval",
            level => Decimal.pow(10, PrestigeLayer.getPrestigeCarryOverForLayer(level.add(2).toNumber()) * (level.toNumber() % 2 === 0 ? 0.25 : 0.75)),
            level => level.gt(0) ? Math.pow(0.6, level.toNumber() - 1) * 30 : Infinity, null, {
                getEffectDisplay: effectDisplayTemplates.automator()
            })),
        autoAleph: new Automator("Auto Tasks", "Automatically Max All Task Upgrades", () =>
        {
            game.alephLayer.maxAll();
        }, new DynamicLayerUpgrade(level => level + 3, () => null, () => "Decrease the Automator interval",
            level => Decimal.pow(10, PrestigeLayer.getPrestigeCarryOverForLayer(level.add(3).toNumber()) * 0.7),
            level => level.gt(0) ? Math.pow(0.6, level.toNumber() - 1) * 60 : Infinity, null, {
                getEffectDisplay: effectDisplayTemplates.automator()
            })),
    },
    hackers: {
        autoKiller: new Hacker("Auto Upgrade Killers", "Automatically buys max on all killers", () =>
        {
            game.metaLayer.maxAll()
        }, new DynamicLayerUpgrade(level => Math.floor(level / 3) + 1, () => null, () => "Decrease the Automator interval",
            level => Decimal.pow(10, PrestigeLayer.getPrestigeCarryOverForLayer(level.toNumber()) * [0.2, 0.5, 0.8][level.toNumber() % 3]),
            level => level.gt(0) ? Math.pow(0.8, level.toNumber() - 1) * 360 : Infinity, null, {
                getEffectDisplay: effectDisplayTemplates.automator()
            }))
    },
    volatility: {
        layerVolatility: new DynamicLayerUpgrade(level => level + 1, level => level,
            function()
            {
                return "Make the next Layer non-volatile";
            }, level => Decimal.pow(10, PrestigeLayer.getPrestigeCarryOverForLayer(level.add(1).toNumber())), level => level.sub(1), null, {
                getEffectDisplay: function()
                {
                    const val1 = this.level.eq(0) ? "None" : PrestigeLayer.getNameForLayer(this.apply().toNumber());
                    const val2 = PrestigeLayer.getNameForLayer(this.getEffect(this.level.add(1)).toNumber());
                    return val1 + " → " + val2;
                }
            }),
        prestigePerSecond: new DynamicLayerUpgrade(level => Math.round(level * 1.3) + 3, level => null,
            () => "Boost the Prestige Reward you get per second",
            function(level)
            {
                const max = PrestigeLayer.getPrestigeCarryOverForLayer(Math.round(level.toNumber() * 1.3) + 3);
                return Decimal.pow(10, new Random(level.toNumber() * 10 + 10).nextDouble() * max).round();
            }, level => new Decimal(0.5 + 0.1 * level), null, {
                getEffectDisplay: effectDisplayTemplates.percentStandard(0)
            }),
        autoMaxAll: new DynamicLayerUpgrade(level => level + 2, level => level,
            function()
            {
                return "The next Layer is maxed automatically each tick";
            }, level => Decimal.pow(10, PrestigeLayer.getPrestigeCarryOverForLayer(level.add(2).toNumber()) * 0.125), level => level.sub(1), null, {
                getEffectDisplay: function()
                {
                    const val1 = this.level.eq(0) ? "None" : PrestigeLayer.getNameForLayer(this.apply().toNumber());
                    const val2 = PrestigeLayer.getNameForLayer(this.getEffect(this.level.add(1)).toNumber());
                    return val1 + " → " + val2;
                }
            }),
    },
    achievements: [
        new Achievement("sus", "start the game", "?", () => (game.layers[0] && game.layers[0].resource.gt(1)) || game.metaLayer.active),
        new Achievement("10", "buy  this generator", "10", () => (game.layers[0] && game.layers[0].resource.gt(10)) || game.metaLayer.active),
        new Achievement("100", "you have this?", "hundred", () => (game.layers[0] && game.layers[0].resource.gt(100)) || game.metaLayer.active),
        new Achievement("thousand", "have times", "1K", () => (game.layers[0] && game.layers[0].resource.gt(1e3)) || game.metaLayer.active),
        new Achievement("million", "million yes", "1,000,000", () => (game.layers[0] && game.layers[0].resource.gt(1e6)) || game.metaLayer.active),
        new Achievement("billion", "9 digits", "1.00e9", () => (game.layers[0] && game.layers[0].resource.gt(1e9)) || game.metaLayer.active),
        new Achievement("wow", "unlock my layer 2!", PrestigeLayer.getNameForLayer(1), () => (game.layers[0] && game.layers[0].resource.gt(1e20)) || game.metaLayer.active),
        new Achievement("pointy", "get epic pointy thing", "☛", () => (game.layers[1] && game.layers[1].resource.gt(1)) || game.metaLayer.active),
        new Achievement("two", "have these", "2", () => (game.layers[1] && game.layers[1].resource.gt(2)) || game.metaLayer.active),
        new Achievement("2 digits", "ok", "☛100☛", () => (game.layers[1] && game.layers[1].resource.gt(100)) || game.metaLayer.active),
        new Achievement("thousand", "abcdefghijklmnopqrstuvexyz", "☛1.00e3", () => (game.layers[1] && game.layers[1].resource.gt(1e3)) || game.metaLayer.active),
        new Achievement("trillion", "1T", "10^12", () => (game.layers[1] && game.layers[1].resource.gt(1e12)) || game.metaLayer.active),
        new Achievement("googol", "100 digits", "10^100", () => (game.layers[0] && game.layers[0].resource.gt(1e100)) || game.metaLayer.active),
        new Achievement("wow wow!", "unlock my layer 3!", PrestigeLayer.getNameForLayer(2), () => (game.layers[1] && game.layers[1].resource.gt(1e20)) || game.metaLayer.active),
        new Achievement("gun", "bang bang bang - kitchen gun guy", "🔫", () => (game.layers[2] && game.layers[2].resource.gt(1)) || game.metaLayer.active),
        new Achievement("triple gun", "bang bang bang bang bang bang bang bang bang - kitchen gun guy", "3 🔫", () => (game.layers[2] && game.layers[2].resource.gt(3)) || game.metaLayer.active),
        new Achievement("100", "bang x300", "🔫", () => (game.layers[2] && game.layers[2].resource.gt(100)) || game.metaLayer.active),
        new Achievement("million gun", "happens", "🔫", () => (game.layers[2] && game.layers[2].resource.gt(1e6)) || game.metaLayer.active),
        new Achievement("12 digits", "-_-", "!", () => (game.layers[2] && game.layers[2].resource.gt(1e12)) || game.metaLayer.active),
        new Achievement("unlock aleph", "yes you have unlocked aleph!", "🗡", () => (game.layers[2] && game.layers[2].resource.gt(1e20)) || game.metaLayer.active),
        new Achievement("when life gives you tasks", "turn them into useless upgrades that nobody will use", "🗡", () => (game.layers[3] && game.layers[3].resource.gt(1)) || game.metaLayer.active),
        new Achievement("2", "what", "🗡", () => (game.layers[3] && game.layers[3].resource.gt(2)) || game.metaLayer.active),
        new Achievement("3", "what", "🗡", () => (game.layers[3] && game.layers[3].resource.gt(3)) || game.metaLayer.active),
        new Achievement("4", "what", "🗡", () => (game.layers[3] && game.layers[3].resource.gt(4)) || game.metaLayer.active),
        new Achievement("5", "what", "🗡", () => (game.layers[3] && game.layers[3].resource.gt(5)) || game.metaLayer.active),
        new Achievement("6", "what", "🗡", () => (game.layers[3] && game.layers[3].resource.gt(6)) || game.metaLayer.active),
        new Achievement("7", "what", "🗡", () => (game.layers[3] && game.layers[3].resource.gt(7)) || game.metaLayer.active),
        new Achievement("8", "what", "🗡", () => (game.layers[3] && game.layers[3].resource.gt(8)) || game.metaLayer.active),
        new Achievement("9", "what", "🗡", () => (game.layers[3] && game.layers[3].resource.gt(9)) || game.metaLayer.active),
        new Achievement("10", "what", "🗡", () => (game.layers[3] && game.layers[3].resource.gt(10)) || game.metaLayer.active),
        new Achievement("100", "hundred", "100 🗡", () => (game.layers[3] && game.layers[3].resource.gt(100)) || game.metaLayer.active),
        new Achievement("10,000", "theory guys", "🗡", () => (game.layers[3] && game.layers[3].resource.gt(1e4)) || game.metaLayer.active),
        new Achievement("1 billion", "1 more digit until 1 digit digit!", "🗡", () => (game.layers[3] && game.layers[3].resource.gt(1e9)) || game.metaLayer.active),
        new Achievement("10^2^4", "........", "🗡", () => (game.layers[3] && game.layers[3].resource.gt(1e16)) || game.metaLayer.active),
        new Achievement("icon called", "SUSSY LAYERS", "ඞ", () => (game.layers[3] && game.layers[3].resource.gt(1e20)) || game.metaLayer.active),
        new Achievement("WHEN THE IM-", "hey hey its the icon from the game called sussy layers", "ඞ", () => (game.layers[4] && game.layers[4].resource.gt(1)) || game.metaLayer.active),
        new Achievement("2", "what", "ඞ", () => (game.layers[4] && game.layers[4].resource.gt(2)) || game.metaLayer.active),
        new Achievement("3", "what", "ඞ", () => (game.layers[4] && game.layers[4].resource.gt(3)) || game.metaLayer.active),
        new Achievement("4", "what", "ඞ", () => (game.layers[4] && game.layers[4].resource.gt(4)) || game.metaLayer.active),
        new Achievement("5", "what", "ඞ", () => (game.layers[4] && game.layers[4].resource.gt(5)) || game.metaLayer.active),
        new Achievement("6", "what", "ඞ", () => (game.layers[4] && game.layers[4].resource.gt(6)) || game.metaLayer.active),
        new Achievement("7", "what", "ඞ", () => (game.layers[4] && game.layers[4].resource.gt(7)) || game.metaLayer.active),
        new Achievement("8", "what", "ඞ", () => (game.layers[4] && game.layers[4].resource.gt(8)) || game.metaLayer.active),
        new Achievement("9", "what", "ඞ", () => (game.layers[4] && game.layers[4].resource.gt(9)) || game.metaLayer.active),
        new Achievement("10", "what", "ඞ", () => (game.layers[4] && game.layers[4].resource.gt(10)) || game.metaLayer.active),
        new Achievement("100 impostor", "yes", "100ඞ", () => (game.layers[4] && game.layers[4].resource.gt(100)) || game.metaLayer.active),
        new Achievement("1 million impostor", "yes", "1,000,000ඞ", () => (game.layers[4] && game.layers[4].resource.gt(1e6)) || game.metaLayer.active),
        new Achievement("100 billion impostor", "yes me", "100,000,000,000ඞ", () => (game.layers[4] && game.layers[4].resource.gt(1e11)) || game.metaLayer.active),
        new Achievement("IMPOSTOR CIRCLE", "go", PrestigeLayer.getNameForLayer(5), () => (game.layers[5] && game.layers[5].resource.gt(1)) || game.metaLayer.active),
        new Achievement("IMPOSTOR POINTY", "go", PrestigeLayer.getNameForLayer(6), () => (game.layers[6] && game.layers[6].resource.gt(1)) || game.metaLayer.active),
        new Achievement("IMPOSTOR GUN", "go", PrestigeLayer.getNameForLayer(7), () => (game.layers[7] && game.layers[7].resource.gt(1)) || game.metaLayer.active),
        new Achievement("IMPOSTOR MASTER", "go", PrestigeLayer.getNameForLayer(8), () => (game.layers[8] && game.layers[8].resource.gt(1)) || game.metaLayer.active),
        new Achievement("impostor impostor", "double impostor!??!?", PrestigeLayer.getNameForLayer(9), () => (game.layers[9] && game.layers[9].resource.gt(1)) || game.metaLayer.active),
        new Achievement("IMPOSTOR GETER THAN CIRCLE", "go", PrestigeLayer.getNameForLayer(10), () => (game.layers[10] && game.layers[10].resource.gt(1)) || game.metaLayer.active),
        new Achievement("IMPOSTOR GETER THAN POINTY", "go", PrestigeLayer.getNameForLayer(11), () => (game.layers[11] && game.layers[11].resource.gt(1)) || game.metaLayer.active),
        new Achievement("IMPOSTOR GETER THAN GUN", "go", PrestigeLayer.getNameForLayer(12), () => (game.layers[12] && game.layers[12].resource.gt(1)) || game.metaLayer.active),
        new Achievement("IMPOSTOR GETER THAN MASTER", "go", PrestigeLayer.getNameForLayer(13), () => (game.layers[13] && game.layers[13].resource.gt(1)) || game.metaLayer.active),
        new Achievement("IMPOSTOR GETER THAN IMPOSTOR", "go", PrestigeLayer.getNameForLayer(14), () => (game.layers[14] && game.layers[14].resource.gt(1)) || game.metaLayer.active),
        new Achievement("IMPOSTOR ??? CIRCLE", "go", PrestigeLayer.getNameForLayer(15), () => (game.layers[15] && game.layers[15].resource.gt(1)) || game.metaLayer.active),
        new Achievement("IMPOSTOR ??? POINTY", "go", PrestigeLayer.getNameForLayer(16), () => (game.layers[16] && game.layers[16].resource.gt(1)) || game.metaLayer.active),
        new Achievement("IMPOSTOR ??? GUN", "go", PrestigeLayer.getNameForLayer(17), () => (game.layers[17] && game.layers[17].resource.gt(1)) || game.metaLayer.active),
        new Achievement("IMPOSTOR ??? MASTER", "go", PrestigeLayer.getNameForLayer(18), () => (game.layers[18] && game.layers[18].resource.gt(1)) || game.metaLayer.active),
        new Achievement("IMPOSTOR ??? IMPOSTOR", "go", PrestigeLayer.getNameForLayer(19), () => (game.layers[19] && game.layers[19].resource.gt(1)) || game.metaLayer.active),
        new Achievement("IMPOSTOR ??? CIRCLE", "go", PrestigeLayer.getNameForLayer(20), () => (game.layers[20] && game.layers[20].resource.gt(1)) || game.metaLayer.active),
        new Achievement("IMPOSTOR ??? POINTY", "go", PrestigeLayer.getNameForLayer(21), () => (game.layers[21] && game.layers[21].resource.gt(1)) || game.metaLayer.active),
        new Achievement("IMPOSTOR ??? GUN", "go", PrestigeLayer.getNameForLayer(22), () => (game.layers[22] && game.layers[22].resource.gt(1)) || game.metaLayer.active),
        new Achievement("IMPOSTOR ??? MASTER", "go", PrestigeLayer.getNameForLayer(23), () => (game.layers[23] && game.layers[23].resource.gt(1)) || game.metaLayer.active),
        new Achievement("IMPOSTOR ??? IMPOSTOR", "go", PrestigeLayer.getNameForLayer(24), () => (game.layers[24] && game.layers[24].resource.gt(1)) || game.metaLayer.active),
        new Achievement("IMPOSTOR ??? CIRCLE", "go", PrestigeLayer.getNameForLayer(25), () => (game.layers[25] && game.layers[25].resource.gt(1)) || game.metaLayer.active),
        new Achievement("IMPOSTOR ??? POINTY", "go", PrestigeLayer.getNameForLayer(26), () => (game.layers[26] && game.layers[26].resource.gt(1)) || game.metaLayer.active),
        new Achievement("IMPOSTOR ??? GUN", "go", PrestigeLayer.getNameForLayer(27), () => (game.layers[27] && game.layers[27].resource.gt(1)) || game.metaLayer.active),
        new Achievement("IMPOSTOR ??? MASTER", "go", PrestigeLayer.getNameForLayer(28), () => (game.layers[28] && game.layers[28].resource.gt(1)) || game.metaLayer.active),
        new Achievement("IMPOSTOR ??? IMPOSTOR", "go", PrestigeLayer.getNameForLayer(29), () => (game.layers[29] && game.layers[29].resource.gt(1)) || game.metaLayer.active),
        new Achievement("IMPOSTOR ??? CIRCLE", "go", PrestigeLayer.getNameForLayer(30), () => (game.layers[30] && game.layers[30].resource.gt(1)) || game.metaLayer.active),
        new Achievement("IMPOSTOR ??? POINTY", "go", PrestigeLayer.getNameForLayer(31), () => (game.layers[31] && game.layers[31].resource.gt(1)) || game.metaLayer.active),
        new Achievement("IMPOSTOR ??? GUN", "go", PrestigeLayer.getNameForLayer(32), () => (game.layers[32] && game.layers[32].resource.gt(1)) || game.metaLayer.active),
        new Achievement("IMPOSTOR ??? MASTER", "go", PrestigeLayer.getNameForLayer(33), () => (game.layers[33] && game.layers[33].resource.gt(1)) || game.metaLayer.active),
        new Achievement("IMPOSTOR ??? IMPOSTOR", "go", PrestigeLayer.getNameForLayer(34), () => (game.layers[34] && game.layers[34].resource.gt(1)) || game.metaLayer.active),
        new Achievement("IMPOSTOR ??? CIRCLE", "go", PrestigeLayer.getNameForLayer(35), () => (game.layers[35] && game.layers[35].resource.gt(1)) || game.metaLayer.active),
        new Achievement("IMPOSTOR ??? POINTY", "go", PrestigeLayer.getNameForLayer(36), () => (game.layers[36] && game.layers[36].resource.gt(1)) || game.metaLayer.active),
        new Achievement("IMPOSTOR ??? GUN", "go", PrestigeLayer.getNameForLayer(37), () => (game.layers[37] && game.layers[37].resource.gt(1)) || game.metaLayer.active),
        new Achievement("IMPOSTOR ??? MASTER", "go", PrestigeLayer.getNameForLayer(38), () => (game.layers[38] && game.layers[38].resource.gt(1)) || game.metaLayer.active),
        new Achievement("IMPOSTOR ??? IMPOSTOR", "go", PrestigeLayer.getNameForLayer(39), () => (game.layers[39] && game.layers[39].resource.gt(1)) || game.metaLayer.active),
        new Achievement("IMPOSTOR ??? CIRCLE", "go", PrestigeLayer.getNameForLayer(40), () => (game.layers[40] && game.layers[40].resource.gt(1)) || game.metaLayer.active),
        new Achievement("IMPOSTOR ??? POINTY", "go", PrestigeLayer.getNameForLayer(41), () => (game.layers[41] && game.layers[41].resource.gt(1)) || game.metaLayer.active),
        new Achievement("IMPOSTOR ??? GUN", "go", PrestigeLayer.getNameForLayer(42), () => (game.layers[42] && game.layers[42].resource.gt(1)) || game.metaLayer.active),
        new Achievement("IMPOSTOR ??? MASTER", "go", PrestigeLayer.getNameForLayer(43), () => (game.layers[43] && game.layers[43].resource.gt(1)) || game.metaLayer.active),
        new Achievement("IMPOSTOR ??? IMPOSTOR", "go", PrestigeLayer.getNameForLayer(44), () => (game.layers[44] && game.layers[44].resource.gt(1)) || game.metaLayer.active),
        new Achievement("IMPOSTOR ??? CIRCLE", "go", PrestigeLayer.getNameForLayer(45), () => (game.layers[45] && game.layers[45].resource.gt(1)) || game.metaLayer.active),
        new Achievement("IMPOSTOR ??? POINTY", "go", PrestigeLayer.getNameForLayer(46), () => (game.layers[46] && game.layers[46].resource.gt(1)) || game.metaLayer.active),
        new Achievement("IMPOSTOR ??? GUN", "go", PrestigeLayer.getNameForLayer(47), () => (game.layers[47] && game.layers[47].resource.gt(1)) || game.metaLayer.active),
        new Achievement("IMPOSTOR ??? MASTER", "go", PrestigeLayer.getNameForLayer(48), () => (game.layers[48] && game.layers[48].resource.gt(1)) || game.metaLayer.active),
        new Achievement("IMPOSTOR ??? IMPOSTOR", "go", PrestigeLayer.getNameForLayer(49), () => (game.layers[49] && game.layers[49].resource.gt(1)) || game.metaLayer.active),
        new Achievement("sussy mode", "you are the impostor", PrestigeLayer.getNameForLayer(23), () => game.metaLayer.active),
        new Achievement("cool", "your good at this", "👍", () => game.metaLayer.layer.gte("10000")),
        new Achievement("I Never Ends", "your good at this", "👍", () => game.metaLayer.layer.gte("1e10")),
        new Achievement("something", "1e38 or something i think", "idk", () => game.metaLayer.layer.gte("1e38")),
        new Achievement("I Turly Never Ends", "your good at this", "👍", () => game.metaLayer.layer.gte("1e100")),
        new Achievement("you win", "or do you?!?!?!!", "<span class='flipped-v'>ඞ</span>", () => game.metaLayer.layer.gte(INFINITY)),
        new Achievement("Starting Out", "Reach 1 α (somehow?)", "αααααααααα", () => game.metaLayer.layer.gte(INFINITY2)),
        new Achievement("Other Times Await", "something's up", "ββββββββββ", () => game.metaLayer.layer.gte(INFINITY3)),
        new Achievement("I Mitacully Ends", "Reach layer 1ee12", "\u7777" + PrestigeLayer.getNameForLayer(36) + "\u7777", () => game.metaLayer.layer.gte("1ee12")),
        new Achievement("get the impossible upgrade", "what", "winwinwinwinwin", () => game.sabotageLayer.upgrades.winPercentage.level.gte("1"))
    ],
    alephLayer: new AlephLayer(),
    sabotageLayer: new SabotageLayer(),
    restackLayer: new ReStackLayer(),
    metaLayer: new MetaLayer(),
    currentLayer: null,
    currentChallenge: null,
    notifications: [],
    timeSpent: 0,
    settings: {
        tab: "Layers",
        showAllLayers: true,
        showMinLayers: 5,
        showMaxLayers: 5,
        showLayerOrdinals: true,
        layerTickSpeed: 1,
        buyMaxAlways10: true,
        disableBuyMaxOnHighestLayer: false,
        resourceColors: true,
        resourceGlow: true,
        newsTicker: true,
        autoMaxAll: true,
        autoPrestigeHighestLayer: true,
        notifications: true,
        saveNotifications: true,
        confirmations: true,
        offlineProgress: true,
        titleStyle: 2,
        theme: "sussy.css",
        layerNames: [["○","☛","🔫","🗡","ඞ"], "</-=+x>"],
    },
};
const initialGame = functions.getSaveString();
