import {
  onManageActiveEffect,
  prepareActiveEffectCategories,
} from "../helpers/effects.mjs";

/* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class FabulaUltimaActorSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["fabulaultima", "sheet", "actor"],
      template: "systems/fabulaultima/templates/actor/actor-character-sheet.html",
      width: 600,
      height: 1150,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "features",
        },
      ],
    });
  }

  /** @override */
  get template() {
    return `systems/fabulaultima/templates/actor/actor-${this.actor.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = this.actor.toObject(false);

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system;
    context.flags = actorData.flags;

    this._prepareItems(context);
    this._prepareCharacterData(context);

    // Prepare character data and items.
    if (actorData.type == "character") {
    }

    // Prepare NPC data and items.
    if (actorData.type == "npc") {
    }

    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();

    // Prepare active effects
    context.effects = prepareActiveEffectCategories(this.actor.effects);

    return context;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterData(context) {
    // Handle ability scores.
    for (let [k, v] of Object.entries(context.system.attributes)) {
      v.label = game.i18n.localize(CONFIG.FABULAULTIMA.attributes[k]) ?? k;
    }
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareItems(context) {
    // Initialize containers.
    const weapons = [];
    const armor = [];
    const shields = [];
    const accessories = [];
    const classes = [];
    const skills = [];
    const spells = [];
    const abilities = [];
    const behaviors = [];
    const consumables = [];

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;

      if (i.system.quality?.value) {
        i.quality = i.system.quality.value;
      }

      i.isMartial = i.system.isMartial?.value ? true : false;
      i.isOffensive = i.system.isOffensive?.value ? true : false;
      i.equipped = i.system.isEquipped?.value ? true : false;
      i.level = i.system.level?.value;
      i.class = i.system.class?.value;
      i.mpCost = i.system.mpCost?.value;
      i.target = i.system.target?.value;
      i.duration = i.system.duration?.value;

      if (["armor", "shield", "accessory"].includes(i.type)) {
        i.def =
          i.isMartial && i.type === "armor"
            ? i.system.def.value
            : `+${i.system.def.value}`;
        i.mdef = `+${i.system.mdef.value}`;
        i.init =
          i.system.init.value > 0
            ? `+${i.system.init.value}`
            : i.system.init.value;
      }

      if (i.type === "weapon") {
        const itemObj = context.actor.items.get(i._id);
        const weapData = itemObj.getWeaponDisplayData();

        i.quality = weapData.qualityString;
        i.attackString = weapData.attackString;
        i.damageString = weapData.damageString;

        weapons.push(i);
      } else if (i.type === "armor") {
        armor.push(i);
      } else if (i.type === "shield") {
        shields.push(i);
      } else if (i.type === "accessory") {
        accessories.push(i);
      } else if (i.type === "class") {
        classes.push(i);
      } else if (i.type === "skill") {
        skills.push(i);
      } else if (i.type === "spell") {
        spells.push(i);
      } else if (i.type === "miscAbility") {
        abilities.push(i);
      } else if (i.type === "behavior") {
        behaviors.push(i);
      } else if (i.type === "consumable") {
        consumables.push(i);
      }
    }

    // Assign and return
    context.weapons = weapons;
    context.armor = armor;
    context.shields = shields;
    context.accessories = accessories;
    context.classes = classes;
    context.skills = skills;
    context.spells = spells;
    context.abilities = abilities;
    context.behaviors = behaviors;
    context.consumables = consumables;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Render the item sheet for viewing/editing prior to the editable check.
    html.find(".item-edit").click((ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.find(".item-create").click(this._onItemCreate.bind(this));

    // Delete Inventory Item
    html.find(".item-delete").click((ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    html.find(".item-equip").click((ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const itemId = li.data("itemId");
      const item = this.actor.items.get(itemId);
      const currentEquipped = item.system.isEquipped.value;
      this.actor.updateEmbeddedDocuments("Item", [
        { _id: itemId, "system.isEquipped.value": !currentEquipped },
      ]);
    });

    // Active Effect management
    html
      .find(".effect-control")
      .click((ev) => onManageActiveEffect(ev, this.actor));

    // Rollable abilities.
    html.find(".rollable").click(this._onRoll.bind(this));

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = (ev) => this._onDragStart(ev);
      html.find("li.item").each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: data,
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system["type"];

    // Finally, create the item!
    return await Item.create(itemData, { parent: this.actor });
  }

  _rollBehavior() {
    const behaviors = this.actor.items.filter(
      (item) => item.type === "behavior"
    );
    const behaviorMap = [];

    behaviors.forEach((behavior) => {
      for (let i = 0; i < behavior.system.weight.value; i++) {
        behaviorMap.push({
          name: behavior.name,
          desc: behavior.system.description,
          id: behavior.id,
        });
      }
    });

    const randVal = Math.floor(Math.random() * behaviorMap.length);
    const selected = behaviorMap[randVal];

    const targetArray = [1, 2, 3, 4, 5];
    shuffleArray(targetArray);

    const content = `<b>Enemy:</b> ${
      this.actor.name
    }<br /><b>Selected behavior:</b> ${
      selected.name
    }<br /><b>Target priority:</b> ${targetArray.join(" -> ")}`;

    let chatData = {
      user: game.user._id,
      speaker: ChatMessage.getSpeaker(),
      whisper: game.user._id,
      content,
    };

    ChatMessage.create(chatData, {});
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    // Handle item rolls.
    if (dataset.rollType) {
      if (dataset.rollType == "item") {
        const itemId = element.closest(".item").dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      }

      if (dataset.rollType == "behavior") {
        return this._rollBehavior();
      }
    }

    // Handle rolls that supply the formula directly.
    if (dataset.roll) {
      let label = dataset.label ? `${dataset.label}` : "";
      let roll = new Roll(dataset.roll, this.actor.getRollData());
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get("core", "rollMode"),
      });
      return roll;
    }
  }
}
