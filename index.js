let pokemon = {};
let trainers = {}
let basestats = {};
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
	filter();
}

function loadPokemon(json) {
	let innertable = `<tr>
						<th>Species</th>
						<th>Instance</th>
						<th>Item</th>
						<th>Move 1</th>
						<th>Move 2</th>
						<th>Move 3</th>
						<th>Move 4</th>
						<th>Ability 1</th>
						<th>Ability 2</th>
						<th>Nature</th>
						<th>EVs</th>
						<th>Speed</th>
					</tr>`;

	for (const [key, value] of Object.entries(json)) {
		innertable = innertable + "<tr>";
		innertable = innertable + "<td>" + value.Species + "</td>";
		innertable = innertable + "<td>" + value.Instance + "</td>";
		innertable = innertable + "<td>" + value.Item + "</td>";
		innertable = innertable + "<td>" + value["Move 1"] + "</td>";
		innertable = innertable + "<td>" + value["Move 2"] + "</td>";
		innertable = innertable + "<td>" + value["Move 3"] + "</td>";
		innertable = innertable + "<td>" + value["Move 4"] + "</td>";
		innertable = innertable + "<td>" + value["Ability 1"] + "</td>";
		innertable = innertable + "<td>" + value["Ability 2"] + "</td>";
		innertable = innertable + "<td>" + value.Nature + "</td>";
		innertable = innertable + "<td>" + value.EVs + "</td>";
		innertable = innertable + "<td>" + getSpeed(key, value) + "</td>";
		innertable = innertable + "</tr>";
	}

	pokemonTable.innerHTML = innertable;
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

function getNature(natureString) {
	if (natureString === "Timid" || natureString === "Hasty" || natureString === "Jolly" || natureString === "Naive") {
		return 1.1;
	}
	if (natureString === "Brave" || natureString === "Relaxed" || natureString === "Quiet" || natureString === "Sassy") {
		return .9;
	}
	return 1;
}

function getSpeed(key, value) {
	const ivs = getIvs(key);
	const evs = parseInt(value.EVs.split("/")[5]);
	const level = levelSelect.value;
	const base = basestats[value.Species].Speed;
	const nature = getNature(value.Nature);
	return Math.floor((Math.floor(((base * 2 + ivs + Math.floor(evs / 4)) * level) / 100) + 5) * nature);
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