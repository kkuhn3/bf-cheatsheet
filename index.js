let pokemon = {};
let trainers = {}
let basestats = {};
let moves = {};
let typechart = {};
async function loadJson() {
	const res1 = await fetch('./json/pokemon.json', {
		method: 'GET'
	});
	pokemon = await res1.json();
	const res2 = await fetch('./json/trainers.json', {
		method: 'GET'
	});
	trainers = await res2.json();
	const res3 = await fetch('./json/basestats.json', {
		method: 'GET'
	});
	basestats = await res3.json();
	const res4 = await fetch('./json/moves.json', {
		method: 'GET'
	});
	moves = await res4.json();
	const res5 = await fetch('./json/typechart.json', {
		method: 'GET'
	});
	typechart = await res5.json();
	filter();
}

function loadPokemon(json) {
	let innertable;
	const hasMyMon = myMons.A || myMons.B || myMons.C
	if (hasMyMon) {
		innertable = `<tr class="top">
						<th>Set</th>
						<th>Item</th>
						<th>Ability</th>
						<th>Speed</th>
						<th>Move 1</th>
						<th>Move 2</th>
						<th>Move 3</th>
						<th>Move 4</th>
						<th>Move 1</th>
						<th>Move 2</th>
						<th>Move 3</th>
						<th>Move 4</th>
					</tr>`;
	}
	else {
		innertable = `<tr class="top">
						<th>Set</th>
						<th>Item</th>
						<th>Ability</th>
						<th>Nature</th>
						<th>EVs</th>
						<th>Speed</th>
						<th>Move 1</th>
						<th>Move 2</th>
						<th>Move 3</th>
						<th>Move 4</th>
					</tr>`;
	}

	let isWhite = "white";
	for (const [key, value] of Object.entries(json)) {
		innertable = innertable + "<tr class='" + isWhite + "'>";
		innertable = innertable + "<td>" + value.Species + " " + value.Instance + "</td>";
		innertable = innertable + "<td>" + value.Item + "</td>";
		if (value["Ability 2"] === "---") {
			innertable = innertable + "<td>" + value["Ability 1"] + "</td>";
		}
		else {
			innertable = innertable + "<td>" + value["Ability 1"] + " / " + value["Ability 2"] + "</td>";
		}
		if (!hasMyMon) {
			innertable = innertable + "<td>" + value.Nature + "</td>";
			innertable = innertable + "<td>" + value.EVs + "</td>";
		}
		const ivs = getIvs(key);
		innertable = innertable + "<td>" + getSpeed(value.Species, value.Nature, parseInt(value.EVs.split("/")[5]), ivs, levelSelect.value) + "</td>";
		innertable = innertable + "<td>" + value["Move 1"] + "</td>";
		innertable = innertable + "<td>" + value["Move 2"] + "</td>";
		innertable = innertable + "<td>" + value["Move 3"] + "</td>";
		innertable = innertable + "<td>" + value["Move 4"] + "</td>";
		if (hasMyMon) {
			innertable = innertable + "<td></td>";
			innertable = innertable + "<td></td>";
			innertable = innertable + "<td></td>";
			innertable = innertable + "<td></td>";
		}
		innertable = innertable + "</tr>";
		innertable = innertable + myMonRow(myMons.A, key, value, isWhite);
		innertable = innertable + myMonRow(myMons.B, key, value, isWhite);
		innertable = innertable + myMonRow(myMons.C, key, value, isWhite);
		if (isWhite === "white") {
			isWhite = "grey";
		}
		else {
			isWhite = "white";
		}
	}

	pokemonTable.innerHTML = innertable;
}

function myMonRow(myMon, key, value, isWhite) {
	if (!myMon) {
		return "";
	}
	let innertable = "<tr class='" + isWhite + "'>";
	innertable = innertable + "<td>> " + myMon.species + "</td>";
	innertable = innertable + tdifExists(myMon.item);
	innertable = innertable + tdifExists(myMon.ability);
	let speedevs = 0;
	if (myMon.evs && myMon.evs.spe) {
		speedevs = myMon.evs.spe
	}
	let speedivs = 0;
	if (myMon.ivs && myMon.ivs.spe) {
		speedivs = myMon.ivs.spe
	}
	let level = levelSelect.value;
	if (myMon.level) {
		level = myMon.level;
	}
	const theirs = theirsToAttacker(key, value);
	innertable = innertable + "<td>" + getSpeed(myMon.species, myMon.nature, speedevs, speedivs, level); + "</td>";
	let move1Range = calcDamage(theirs, myMon, value["Move 1"]);
	innertable = innertable + rangeIfExists(move1Range);
	let move2Range = calcDamage(theirs, myMon, value["Move 2"]);
	innertable = innertable + rangeIfExists(move2Range);
	let move3Range = calcDamage(theirs, myMon, value["Move 3"]);
	innertable = innertable + rangeIfExists(move3Range);
	let move4Range = calcDamage(theirs, myMon, value["Move 4"]);
	innertable = innertable + rangeIfExists(move4Range);
	if (myMon.moves) {
		innertable = innertable + moveIfExists(myMon, theirs, myMon.moves[0]);
		innertable = innertable + moveIfExists(myMon, theirs, myMon.moves[1]);
		innertable = innertable + moveIfExists(myMon, theirs, myMon.moves[2]);
		innertable = innertable + moveIfExists(myMon, theirs, myMon.moves[3]);
	}
	else {
		innertable = innertable + "<td>---</td>";
		innertable = innertable + "<td>---</td>";
		innertable = innertable + "<td>---</td>";
		innertable = innertable + "<td>---</td>";
	}
	innertable = innertable + "</tr>";
	return innertable;
}

function theirsToAttacker(key, value) {
	let ability = null;
	if (value["Ability 2"] === "---") {
		ability = value["Ability 1"];
	}
	let listEvs = value.EVs.split("/");
	const ivs = getIvs(key);
	return {
		"species": value.Species,
		"item": value.Item,
		"ability": ability,
		"evs": {
			"hp": parseInt(listEvs[0]),
			"atk": parseInt(listEvs[1]),
			"def": parseInt(listEvs[2]),
			"spa": parseInt(listEvs[3]),
			"spd": parseInt(listEvs[4]),
			"spe": parseInt(listEvs[5]),
		},
		"ivs": {
			"hp": ivs,
			"atk": ivs,
			"def": ivs,
			"spa": ivs,
			"spd": ivs,
			"spe": ivs,
		},
		"nature": value.Nature,
		"level": parseInt(levelSelect.value)
	}
}

function tdifExists(tobetd) {
	if (tobetd) {
		return "<td>" + tobetd + "</td>";
	}
	else {
		return "<td>---</td>";
	}
}

function moveIfExists(mine, theirs, move) {
	let range = calcDamage(mine, theirs, move);
	if (range) {
		return "<td>" + move + " (" + range[0] + " - " + range[1]  + "%)</td>";
	}
	return "<td>" + move + "</td>";
}

function rangeIfExists(moveRange) {
	if (moveRange) {
		return "<td>" + moveRange[0] + " - " + moveRange[1] + "%</td>";
	}
	return "<td>---</td>";
}

function getIvs(key) {
	if (trainerSelect.value !== "---") {
		return trainers[trainerSelect.value].IVs;
	}
	
	let ivs = -1;
	for (const [trainerKey, trainerValue] of Object.entries(trainers)) {
		if (trainerValue.Pokemon.includes(key)) {
			if (trainerValue.IVs > ivs) {
				ivs = trainerValue.IVs;
			}
		}
	}
	return ivs;
}

function updateSel(selector, set) {
	let innerSel = `<option value="---">---</option>`;
	for (const value of set.values()) {
		if (value !== "---") {
			if (selector.value === value) {
				innerSel = innerSel + `<option selected value="` + value + `">` + value + `</option>`;
			}
			else {
				innerSel = innerSel + `<option value="` + value + `">` + value + `</option>`;
			}
		}
	}
	selector.innerHTML = innerSel;
}

function loadTrainers(json) {
	let innerselect = `<option value="---">---</option>`;
	for(const [key, value] of Object.entries(json)) {
		innerselect = innerselect + `<option value="` + key + `">` + key + `</option>`;
	}
	trainerSelect.innerHTML = innerselect;
}

function filter() {
	filtered = {};
	let trainerSet = new Set([]);
	let monSet = new Set([]);
	let itemSet = new Set([]);
	let move1Set = new Set([]);
	let move2Set = new Set([]);
	let move3Set = new Set([]);
	let move4Set = new Set([]);

	for (const [key, value] of Object.entries(pokemon)) {
		if (hasTrainer(key, value) && hasSpecies(key, value) && hasItem(key, value) && hasMove1(key, value) && hasMove2(key, value) && hasMove3(key, value) && hasMove4(key, value)) {
			filtered[key] = value;
		}
		
		if (hasSpecies(key, value) && hasItem(key, value) && hasMove1(key, value) && hasMove2(key, value) && hasMove3(key, value) && hasMove4(key, value)) {
			for (const [trainerKey, trainerValue] of Object.entries(trainers)) {
				if (trainerValue.Pokemon.includes(key)) {
					trainerSet.add(trainerKey);
				}
			}
		}

		if (hasTrainer(key, value) && hasItem(key, value) && hasMove1(key, value) && hasMove2(key, value) && hasMove3(key, value) && hasMove4(key, value)) {
			monSet.add(value.Species);
		}

		if (hasTrainer(key, value) && hasSpecies(key, value) && hasMove1(key, value) && hasMove2(key, value) && hasMove3(key, value) && hasMove4(key, value)) {
			itemSet.add(value.Item);
		}

		if (hasTrainer(key, value) && hasSpecies(key, value) && hasItem(key, value) && hasMove2(key, value) && hasMove3(key, value) && hasMove4(key, value)) {
			move1Set.add(value["Move 1"]);
			move1Set.add(value["Move 2"]);
			move1Set.add(value["Move 3"]);
			move1Set.add(value["Move 4"]);
		}

		if (hasTrainer(key, value) && hasSpecies(key, value) && hasItem(key, value) && hasMove1(key, value) && hasMove3(key, value) && hasMove4(key, value)) {
			move2Set.add(value["Move 1"]);
			move2Set.add(value["Move 2"]);
			move2Set.add(value["Move 3"]);
			move2Set.add(value["Move 4"]);
		}

		if (hasTrainer(key, value) && hasSpecies(key, value) && hasItem(key, value) && hasMove1(key, value) && hasMove2(key, value) && hasMove4(key, value)) {
			move3Set.add(value["Move 1"]);
			move3Set.add(value["Move 2"]);
			move3Set.add(value["Move 3"]);
			move3Set.add(value["Move 4"]);
		}

		if (hasTrainer(key, value) && hasSpecies(key, value) && hasItem(key, value) && hasMove1(key, value) && hasMove2(key, value) && hasMove3(key, value)) {
			move4Set.add(value["Move 1"]);
			move4Set.add(value["Move 2"]);
			move4Set.add(value["Move 3"]);
			move4Set.add(value["Move 4"]);
		}
	}
	
	updateSel(trainerSelect, trainerSet);
	updateSel(pokemonSelect, monSet);
	updateSel(itemSelect, itemSet);
	updateSel(moveSelect1, move1Set);
	updateSel(moveSelect2, move2Set);
	updateSel(moveSelect3, move3Set);
	updateSel(moveSelect4, move4Set);
	loadPokemon(filtered);
}

function hasTrainer(key, value) {
	return trainerSelect.value === "---" || trainers[trainerSelect.value].Pokemon.includes(key);
}

function hasSpecies(key, value) {
	return pokemonSelect.value === "---" || value.Species === pokemonSelect.value;
}

function hasItem(key, value) {
	return itemSelect.value === "---" || value.Item === itemSelect.value;
} 

function hasMove(key, value, selector) {
	return selector.value === "---" || value["Move 1"] === selector.value || value["Move 2"] === selector.value || value["Move 3"] === selector.value || value["Move 4"] === selector.value;
}

function hasMove1(key, value) {
	return hasMove(key, value, moveSelect1);
}

function hasMove2(key, value) {
	return hasMove(key, value, moveSelect2);
}

function hasMove3(key, value) {
	return hasMove(key, value, moveSelect3);
}

function hasMove4(key, value) {
	return hasMove(key, value, moveSelect4);
}

let myMons = {
	"A": null,
	"B": null,
	"C": null
}
function importPrompt(character, button) {
	let set = prompt("Import " + character + ":", "");
	if (set == null || set == "") {
		button.innerHTML = "Import " + character;
		myMons[character] = null;
	} 
	else {
		myMons[character] = parseSetFromString(set);
		if (myMons[character]) {
			if (myMons[character].name) {
				button.innerHTML = myMons[character].species + " (" + myMons[character].name + ")";
			}
			else {
				button.innerHTML = myMons[character].species;
			}
		}
		else {
			button.innerHTML = "Import " + character;
		}
	}
	filter();
}

function parseSetFromString(showdownStr) {
	let set = {};
	set.evs = {hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0};
	set.ivs = {hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31};
	set.level = parseInt(levelSelect.value);
	let lines = showdownStr.split("\n");
	for (let i = 0; i < lines.length; i++) {
		set = parseExportedTeamLine(lines[i], i===0, set);
	}
	if (!basestats[set.species]) {
		return null;
	}
	return set;
}

// SEE: https://github.com/smogon/pokemon-showdown/blob/master/sim/teams.ts#L448
function parseExportedTeamLine(line, isFirstLine, set) {
	if (isFirstLine) {
		let item;
		[line, item] = line.split(' @ ');
		if (item) {
			set.item = item.trim();
			if (set.item === 'noitem') set.item = '';
		}
		if (line.endsWith(' (M)')) {
			set.gender = 'M';
			line = line.slice(0, -4);
		}
		if (line.endsWith(' (F)')) {
			set.gender = 'F';
			line = line.slice(0, -4);
		}
		if (line.endsWith(')') && line.includes('(')) {
			const [name, species] = line.slice(0, -1).split('(');
			set.species = species;
			set.name = name.trim();
		} else {
			set.species = line;
			set.name = '';
		}
	} else if (line.startsWith('Ability: ')) {
		line = line.slice(9);
		set.ability = line.trim();
	} else if (line.startsWith('Level: ')) {
		line = line.slice(7);
		set.level = +line;
	} else if (line.startsWith('EVs: ')) {
		line = line.slice(5);
		const evLines = line.split('/');
		for (const evLine of evLines) {
			const [statValue, statName] = evLine.trim().split(' ');
			let value = parseInt(statValue);
			set.evs[statName.toLowerCase()] = value;
		}
	} else if (line.startsWith('IVs: ')) {
		line = line.slice(5);
		const ivLines = line.split('/');
		for (const ivLine of ivLines) {
			const [statValue, statName] = ivLine.trim().split(' ');
			let value = parseInt(statValue);
			if (isNaN(value)) value = 31;
			set.ivs[statName.toLowerCase()] = value;
		}
	} else if (/^[A-Za-z]+ (N|n)ature/.test(line)) {
		let natureIndex = line.indexOf(' Nature');
		if (natureIndex === -1) natureIndex = line.indexOf(' nature');
		if (natureIndex === -1) return;
		line = line.substr(0, natureIndex);
		if (line !== 'undefined') set.nature = line;
	} else if (line.startsWith('-') || line.startsWith('~')) {
		line = line.slice(line.charAt(1) === ' ' ? 2 : 1);
		if (set.moves) {
			set.moves.push(line.trim());
		}
		else {
			set.moves = [line.trim()];
		}
	}
	return set;
}