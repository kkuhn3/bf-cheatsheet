// natures
function getSpeedNature(natureString) {
	if (natureString === "Timid" || natureString === "Hasty" || natureString === "Jolly" || natureString === "Naive") {
		return 1.1;
	}
	if (natureString === "Brave" || natureString === "Relaxed" || natureString === "Quiet" || natureString === "Sassy") {
		return .9;
	}
	return 1;
}
function getAttackNature(natureString) {
	if (natureString === "Lonely" || natureString === "Adamant" || natureString === "Naughty" || natureString === "Brave") {
		return 1.1;
	}
	if (natureString === "Bold" || natureString === "Modest" || natureString === "Calm" || natureString === "Timid") {
		return .9;
	}
	return 1;
}
function getSpecialAttackNature(natureString) {
	if (natureString === "Modest" || natureString === "Mild" || natureString === "Rash" || natureString === "Quiet") {
		return 1.1;
	}
	if (natureString === "Adamant" || natureString === "Impish" || natureString === "Careful" || natureString === "Jolly") {
		return .9;
	}
	return 1;
}
function getDefenseNature(natureString) {
	if (natureString === "Bold" || natureString === "Impish" || natureString === "Lax" || natureString === "Relaxed") {
		return 1.1;
	}
	if (natureString === "Lonely" || natureString === "Mild" || natureString === "Gentle" || natureString === "Hasty") {
		return .9;
	}
	return 1;
}
function getSpecialDefenseNature(natureString) {
	if (natureString === "Calm" || natureString === "Gentle" || natureString === "Careful" || natureString === "Sassy") {
		return 1.1;
	}
	if (natureString === "Naughty" || natureString === "Lax" || natureString === "Rash" || natureString === "Naive") {
		return .9;
	}
	return 1;
}

// calc
const physicalTypes = ["Normal", "Flying", "Rock", "Ground", "Fighting", "Poison", "Bug", "Ghost", "Steel"];
const soundMoves = ["Snore", "Uproar", "Hyper Voice"];
function calcDamage(attacker, defender, moveId) {
	moveId = moveId.toLowerCase();
	// if move isn't a move, ignore it
	if (!moveId || moveId === "---") {
		return null;
	}
	// set damage moves
	const defenderHealth = getHealthPoints(defender);
	if (moveId === "sonicboom") {
		const aspercent = round(20 * 100/ defenderHealth);
		return [aspercent, aspercent];
	}
	if (moveId === "seismic toss") {
		const aspercent = round(attacker.level * 100/ defenderHealth);
		return [aspercent, aspercent];
	}
	if (moveId === "dragon rage") {
		const aspercent = round(40 * 100/ defenderHealth);
		return [aspercent, aspercent];
	}
	// No power, don't bother calcing
	const move = moves[moveId];
	if (!move.Power) {
		return null;
	}
	// immunity abilities
	const typeEffectiveness = getTypeEffect(move, defender);
	if ((defender.ability === 'Flash Fire' && move.Type === 'Fire') ||
		(defender.ability === 'Levitate' && move.Type === 'Ground') ||
		(defender.ability === 'Volt Absorb' && move.Type === 'Electric') ||
		(defender.ability === 'Water Absorb' && move.Type === 'Water') ||
		(defender.ability === 'Wonder Guard' && typeEffectiveness <= 1) ||
		(defender.ability === 'Soundproof' && soundMoves.includes(moveId))) {
			return [0, 0];
	}
	// calc
	let attackStat;
	let defenseStat;
	// Scale Attack, Defense
	if (physicalTypes.includes(move.Type)) {
		attackStat = getAttack(attacker);
		if (attacker.ability === "Huge Power" || attacker.ability === "Pure Power") {
			attackStat = attackStat * 2;
		}
		else if (attacker.ability === "Hustle") {
			attackStat = Math.floor(attackStat * 1.5);
		}
		if (attacker.item === "Choice Band") {
			attackStat = Math.floor(attackStat * 1.5);
		}
		else if (attacker.item === "Thick Club" && (attacker.species === "Cubone" || attacker.species === "Marowak")) {
			attackStat = attackStat * 2;
		}
		defenseStat = getDefense(defender);
		if (moveId === "explosion" || moveId === "self destruct") {
			defenseStat = Math.floor(defenseStat / 2);
		}
		if (defender.item === "Metal Powder" && defender.species === "Ditto") {
			defenseStat = defenseStat * 2;
		}
	}
	// Scale Special Attack, Special Defense
	else {
		attackStat = getSpecialAttack(attacker);
		if (attacker.item === "Sea Incense" && move.Type === "Water") {
			attackStat = attackStat * 1.05;
		}
		else if (attacker.item === "Light Ball" && attacker.species === "Pikachu") {
			attackStat = attackStat * 2;
		}
		else if (attacker.item === "Deep Sea Tooth" && attacker.species === "Clamperl") {
			attackStat = attackStat * 2;
		}
		defenseStat = getSpecialDefense(defender);
		if (defender.item === "Deep Sea Scale" && defender.species === "Clamperl") {
			defenseStat = defenseStat * 2;
		}
		if (defender.ability === "Thick Fat" && (move.Type === "Fire" || move.Type === "Ice")) {
			defenseStat = defenseStat * 2;
		}
	}
	// Silk Scarf and co
	if (move.Type === getItemBoostType(attacker.item)) {
		attackStat = attackStat * 1.1;
	}
	// Damage Calc
	let baseDamage = Math.floor(Math.floor((Math.floor((2 * attacker.level) / 5 + 2) * attackStat * move.Power) / defenseStat) / 50);
	baseDamage = Math.max(1, baseDamage) + 2;
	let stab = 1;
	if (move.Type === getType1(attacker) || move.Type === getType2(attacker)) {
		stab = 1.5;
	}
	baseDamage = Math.floor(baseDamage * stab);
	baseDamage = Math.floor(baseDamage * typeEffectiveness);
	let min = Math.floor(baseDamage * 85 / 100);
	let max = Math.floor(baseDamage * 100 / 100);
	min = round(min * 100 / defenderHealth);
	max = round(max * 100/ defenderHealth);
	return [min, max];
}
function round(value) {
	return Math.trunc(value * 10) / 10;
}

// types
function getTypeEffect(move, defender) {
	let effectiveness = typechart[move.Type][getType1(defender)];
	let type2 = getType2(defender);
	if (type2) {
		return effectiveness * typechart[move.Type][type2];
	}
	return effectiveness;
}
function getType1(mon) {
	return basestats[mon.species].Type1;
}
function getType2(mon) {
	return basestats[mon.species].Type2;
}

// stats
function getStat(base, nature, evs, ivs, level) {
	return Math.floor((Math.floor(((base * 2 + ivs + Math.floor(evs / 4)) * level) / 100) + 5) * nature);
}
function getSpeed(species, nature, evs, ivs, level) {
	const base = basestats[species].Speed;
	const natureMulti = getSpeedNature(nature);
	return getStat(base, natureMulti, evs, ivs, level)
}
function getAttack(mon) {
	const base = basestats[mon.species].Attack;
	const evs = mon.evs.atk;
	const ivs = mon.ivs.atk;
	const level = mon.level;
	const natureMulti = getAttackNature(mon.nature);
	return getStat(base, natureMulti, evs, ivs, level);
}
function getSpecialAttack(mon) {
	const base = basestats[mon.species]["Special Attack"];
	const evs = mon.evs.spa;
	const ivs = mon.ivs.spa;
	const level = mon.level;
	const natureMulti = getSpecialAttackNature(mon.nature);
	return getStat(base, natureMulti, evs, ivs, level);
}
function getDefense(mon) {
	const base = basestats[mon.species].Defense;
	const evs = mon.evs.def;
	const ivs = mon.ivs.def;
	const level = mon.level;
	const natureMulti = getDefenseNature(mon.nature);
	return getStat(base, natureMulti, evs, ivs, level);
}
function getSpecialDefense(mon) {
	const base = basestats[mon.species]["Special Defense"];
	const evs = mon.evs.spd;
	const ivs = mon.ivs.spd;
	const level = mon.level;
	const natureMulti = getSpecialDefenseNature(mon.nature);
	return getStat(base, natureMulti, evs, ivs, level);
}
function getHealthPoints(mon) {
	const base = basestats[mon.species]["HP"];
	const evs = mon.evs.hp;
	const ivs = mon.ivs.hp;
	const level = mon.level;
	return Math.floor(((base * 2 + ivs + Math.floor(evs / 4)) * level) / 100) + level + 10;
}

// items
function getItemBoostType(item) {
    switch (item) {
        case 'Draco Plate':
        case 'Dragon Fang':
            return 'Dragon';
        case 'Dread Plate':
        case 'Black Glasses':
            return 'Dark';
        case 'Earth Plate':
        case 'Soft Sand':
            return 'Ground';
        case 'Fist Plate':
        case 'Black Belt':
            return 'Fighting';
        case 'Flame Plate':
        case 'Charcoal':
            return 'Fire';
        case 'Icicle Plate':
        case 'Never-Melt Ice':
            return 'Ice';
        case 'Insect Plate':
        case 'Silver Powder':
            return 'Bug';
        case 'Iron Plate':
        case 'Metal Coat':
            return 'Steel';
        case 'Meadow Plate':
        case 'Rose Incense':
        case 'Miracle Seed':
            return 'Grass';
        case 'Mind Plate':
        case 'Odd Incense':
        case 'Twisted Spoon':
            return 'Psychic';
        case 'Fairy Feather':
        case 'Pixie Plate':
            return 'Fairy';
        case 'Sky Plate':
        case 'Sharp Beak':
            return 'Flying';
        case 'Splash Plate':
        //case 'Sea Incense':
        case 'Wave Incense':
        case 'Mystic Water':
            return 'Water';
        case 'Spooky Plate':
        case 'Spell Tag':
            return 'Ghost';
        case 'Stone Plate':
        case 'Rock Incense':
        case 'Hard Stone':
            return 'Rock';
        case 'Toxic Plate':
        case 'Poison Barb':
            return 'Poison';
        case 'Zap Plate':
        case 'Magnet':
            return 'Electric';
        case 'Silk Scarf':
        case 'Pink Bow':
        case 'Polkadot Bow':
            return 'Normal';
        default:
            return undefined;
    }
}