// Import document classes.
import { FabulaUltimaActor } from "./documents/actor.mjs";
import { FabulaUltimaItem } from "./documents/item.mjs";
// Import sheet classes.
import { FabulaUltimaActorSheet } from "./sheets/actor-sheet.mjs";
import { FabulaUltimaItemSheet } from "./sheets/item-sheet.mjs";
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";
import { FABULAULTIMA } from "./helpers/config.mjs";

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once("init", async function () {
  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.fabulaultima = {
    FabulaUltimaActor,
    FabulaUltimaItem,
    rollItemMacro,
  };

  // Add custom constants for configuration.
  CONFIG.FABULAULTIMA = FABULAULTIMA;

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: "1d@attributes.dex.current + 1d@attributes.ins.current + @derived.init.value",
    decimals: 2,
  };

  // Define custom Document classes
  CONFIG.Actor.documentClass = FabulaUltimaActor;
  CONFIG.Item.documentClass = FabulaUltimaItem;

  CONFIG.statusEffects = [
    {
      "statuses": ["accelerated"],
      id: "accelerated",
      name: "Accelerated",
      icon: "systems/fabulaultima/images/Accelerated.webp",
    },
    {
      "statuses": ["aura"],
      id: "aura",
      name: "Aura",
      icon: "systems/fabulaultima/images/Aura.webp",
    },
    {
      "statuses": ["barrier"],
      id: "barrier",
      name: "Barrier",
      icon: "systems/fabulaultima/images/Barrier.webp",
    },
		{
      "statuses": ["beserk"],
			id: 'beserk',
			name: 'Beserk',
      icon: "systems/fabulaultima/images/Beserk.webp",
		},
		{
      "statuses": ["blinded"],
			id: 'blinded',
			name: 'Blinded',
      icon: "systems/fabulaultima/images/Blinded.webp",
		},
		{
      "statuses": ["death"],
			id: 'death',
			name: 'Death',
      icon: "systems/fabulaultima/images/Death.webp",
		},
    {
      "statuses": ["dazed"],
      id: "dazed",
      name: "Dazed",
      icon: "systems/fabulaultima/images/Dazed.webp",
      stats: ["ins"],
      mod: -2,
    },
    {
      "statuses": ["dex-down"],
			id: 'dex-down',
			name: 'DEX Down',
      icon: "systems/fabulaultima/images/DexDown.webp",
			stats: ['dex'],
			mod: -2,
		},
    {
      "statuses": ["dex-up"],
      id: "dex-up",
      name: "DEX Up",
      icon: "systems/fabulaultima/images/DexUp.webp",
      stats: ["dex"],
      mod: 2,
    },
    {
      "statuses": ["enraged"],
      id: "enraged",
      name: "Enraged",
      icon: "systems/fabulaultima/images/Enraged.webp",
      stats: ["dex", "ins"],
      mod: -2,
    },
    {
			"statuses": ["ins-down"],
      id: "ins-down",
			name: 'INS Down',
      icon: "systems/fabulaultima/images/InsDown.webp",
			stats: ['ins'],
			mod: -2,
		},
    {
      "statuses": ["ins-up"],
      id: "ins-up",
      name: "INS Up",
      icon: "systems/fabulaultima/images/InsUp.webp",
      stats: ["ins"],
      mod: 2,
    },
    {
      "statuses": ["ko"],
      id: "ko",
      name: "KO",
      icon: "systems/fabulaultima/images/KO.webp",
    },
    {
      "statuses": ["mig-down"],
			id: 'mig-down',
			name: 'MIG Down',
      icon: "systems/fabulaultima/images/MigDown.webp",
			stats: ['mig'],
			mod: -2,
		},
    {
      "statuses": ["mig-up"],
      id: "mig-up",
      name: "MIG Up",
      icon: "systems/fabulaultima/images/MigUp.webp",
      stats: ["mig"],
      mod: 2,
    },
    {
      "statuses": ["reflect"],
			id: 'reflect',
			name: 'Reflect',
      icon: "systems/fabulaultima/images/Reflect.webp",
		},
    {
      "statuses": ["regen"],
			id: 'regen',
			name: 'Regen',
      icon: "systems/fabulaultima/images/Regen.webp",
		},
    {
      "statuses": ["shaken"],
      id: "shaken",
      name: "Shaken",
      icon: "systems/fabulaultima/images/Shaken.webp",
      stats: ["wlp"],
      mod: -2,
    },
    {
      "statuses": ["sleep"],
			id: 'sleep',
			name: 'Sleep',
      icon: "systems/fabulaultima/images/Sleep.webp",
		},
    {
      "statuses": ["slow"],
      id: "slow",
      name: "Slow",
      icon: "systems/fabulaultima/images/Slow.webp",
      stats: ["dex"],
      mod: -2,
    },
    { 
      "statuses": ["poisoned"],
      id: "poisoned",
      name: "Poisoned",
      icon: "systems/fabulaultima/images/Poisoned.webp",
      stats: ["mig", "wlp"],
      mod: -2,
    },
    {
      "statuses": ["weak"],
      id: "weak",
      name: "Weak",
      icon: "systems/fabulaultima/images/Weak.webp",
      stats: ["mig"],
      mod: -2,
    },
    {
      "statuses": ["wlp-down"],
			id: 'wlp-down',
			name: 'WLP Down',
			icon: 'systems/fabulaultima/images/WlpDown.webp',
			stats: ['wlp'],
			mod: -2,
		},
    {
      "statuses": ["wlp-up"],
      id: "wlp-up",
      name: "WLP Up",
      icon: "systems/fabulaultima/images/WlpUp.webp",
      stats: ["wlp"],
      mod: 2,
    },
	{
      "statuses": ["crisis"],
      id: "crisis",
      name: "Crisis",
      icon: "systems/fabulaultima/images/Status_Bleeding.png",
    },
  ];

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("fabulaultima", FabulaUltimaActorSheet, {
    makeDefault: true,
  });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("fabulaultima", FabulaUltimaItemSheet, {
    makeDefault: true,
  });

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here are a few useful examples:
Handlebars.registerHelper("concat", function () {
  var outStr = "";
  for (var arg in arguments) {
    if (typeof arguments[arg] != "object") {
      outStr += arguments[arg];
    }
  }
  return outStr;
});

Handlebars.registerHelper("toLowerCase", function (str) {
  return str.toLowerCase();
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", async function () {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on("hotbarDrop", (bar, data, slot) => createItemMacro(data, slot));
});

Hooks.once("socketlib.ready", () => {
  const socket = socketlib.registerSystem("fabulaultima");
  socket.register("floatingText", displayFloatingText);
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createItemMacro(data, slot) {
  // First, determine if this is a valid owned item.
  if (data.type !== "Item") return;
  if (!data.uuid.includes("Actor.") && !data.uuid.includes("Token.")) {
    return ui.notifications.warn(
      "You can only create macro buttons for owned Items"
    );
  }
  // If it is, retrieve it based on the uuid.
  const item = await Item.fromDropData(data);

  // Create the macro command using the uuid.
  const command = `game.fabulaultima.rollItemMacro("${data.uuid}");`;
  let macro = game.macros.find(
    (m) => m.name === item.name && m.command === command
  );
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: "script",
      img: item.img,
      command: command,
      flags: { "fabulaultima.itemMacro": true },
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemUuid
 */
function rollItemMacro(itemUuid) {
  // Reconstruct the drop data so that we can load the item.
  const dropData = {
    type: "Item",
    uuid: itemUuid,
  };
  // Load the item from the uuid.
  Item.fromDropData(dropData).then((item) => {
    // Determine if the item loaded and if it's an owned item.
    if (!item || !item.parent) {
      const itemName = item?.name ?? itemUuid;
      return ui.notifications.warn(
        `Could not find item ${itemName}. You may need to delete and recreate this macro.`
      );
    }

    // Trigger the item roll
    item.roll();
  });
}

function displayFloatingText(text) {
  ui.notifications.queue.push({
    message: text,
    type: "fabulaultima-spellname",
    timestamp: new Date().getTime(),
    permanent: false,
    console: false,
  });
  if (ui.notifications.rendered) ui.notifications.fetch();
}
