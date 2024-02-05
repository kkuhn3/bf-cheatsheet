import re
import json
import math
import csv

with open('../json/pokemon.json', 'w') as pokeOut:
	with open('../csv/pokemon.csv') as pokeIn:
		reader = csv.reader(pokeIn, delimiter=',', quotechar='"')
		pokeJson = {}
		for line in reader:
			if not (line[0] == "Entry" or line[0] == "" or "instances" in line[0] or "Placeholder" in line[0]):
				ability1 = ""
				ability2 = ""
				if " / " in line[9]:
					ability1 = line[9].split(" / ")[0]
					ability2 = line[9].split(" / ")[1]
				else:
					ability1 = line[9]
					ability2 = "---"

				pokeJson[line[1] + " " + str(line[2])] = {
					"Species": line[1],
					"Instance": line[2],
					"Nature": line[3],
					"Item": line[4],
					"Move 1": line[5],
					"Move 2": line[6],
					"Move 3": line[7],
					"Move 4": line[8],
					"Ability 1": ability1,
					"Ability 2": ability2,
					"EVs": line[10]
				}
		asJson = json.dumps(pokeJson, indent=4, sort_keys=False)
		pokeOut.write(asJson)

with open('../json/trainers.json', 'w') as trainOut:
	with open('../csv/trainers.csv') as trainIn:
		reader = csv.reader(trainIn, delimiter=',', quotechar='"')
		trainJson = {}
		for line in reader:
			if line[0] != "Name":
				mons = []
				for i in range(103):
					if i > 2:
						if line[i] != "":
							mons.append(line[i])

				trainJson[line[0]] = {
					"Class": line[1],
					"IVs": int(line[2]),
					"Pokemon": mons
				}
		asJson = json.dumps(trainJson, indent=4, sort_keys=False)
		trainOut.write(asJson)

with open('../json/basestats.json', 'w') as statsOut:
	with open('../csv/basestats.csv') as statsIn:
		reader = csv.reader(statsIn, delimiter=',', quotechar='"')
		statsJson = {}
		for line in reader:
			if line[0] != "ID":
				statsJson[line[1]] = {
					"HP": int(line[2]),
					"Attack": int(line[3]),
					"Defense": int(line[4]),
					"Special Attack": int(line[5]),
					"Special Defense": int(line[6]),
					"Speed": int(line[7]),
					"Total": int(line[8]),
					"Average": float(line[9])
				}
		asJson = json.dumps(statsJson, indent=4, sort_keys=False)
		statsOut.write(asJson)