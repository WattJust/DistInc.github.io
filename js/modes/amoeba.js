function getAmoebaGain() {
	gain=tmp.maxVel.plus(1).logBase(10).pow(0.25).div(tmp.ach[28].has ? 1 : 5).plus(1).pow(getAmoebaUpgEffect(0, 0)).minus(1)
	if (player.tr.upgrades.includes(36) && !HCCBA("noTRU")) gain=gain.times(player.tr.cubes.plus(1))
	if (player.tr.upgrades.includes(40) && !HCCBA("noTRU")) gain=gain.times(tmp.timeSpeed.plus(1).pow(tmp.ach[74].has ? 0.6 : 0.4))	
		gain=gain.times(getAmoebaUpgEffect(2, 2))
	if (player.tr.upgrades.includes(49) && !HCCBA("noTRU")) gain=gain.times(player.amoebas.amount.plus(1).times(10).logBase(10).pow(player.dc.matter.plus(1).times(10).log(10).pow(0.7).max(1)))
	if (player.tr.upgrades.includes(41) && !HCCBA("noTRU")) gain=gain.pow(1.1)
	if (player.tr.upgrades.includes(46) && !HCCBA("noTRU")) gain=gain.pow(tmp.dc.flow.max(1).times(10).slog(10).pow(1.5).div(10).plus(1))
	 return gain
}

function initAmoebaUpgrades() {
    if (player.amoebas.upgrades === undefined) {
        player.amoebas.upgrades = {};
    }

    for (let i = 0; i <= 5; i++) {
        if (player.amoebas.upgrades[i] === undefined) {
            player.amoebas.upgrades[i] = new ExpantaNum(0);
        } else if (!(player.amoebas.upgrades[i] instanceof ExpantaNum)) {
            player.amoebas.upgrades[i] = new ExpantaNum(player.amoebas.upgrades[i]);
        }
    }
}

function getAmoebaUpgCost(id, level) {
	if (!(level instanceof ExpantaNum)) {
        level = new ExpantaNum(level || 0);
    }
	switch (id) {
		case 0:
			return ExpantaNum.pow(10, ExpantaNum.pow(2, level)).times(5)
		case 1:
			return ExpantaNum.pow(10, level.pow(2)).times(25)
		case 2:
			return ExpantaNum.pow(10, level.pow(2)).times(25)
		case 3:
			return ExpantaNum.pow(10, level.pow(1.5)).times(1e6)
		case 4:
			return ExpantaNum.pow(10, level.pow(2)).times(1e9)
		case 5:
			return ExpantaNum.pow(2, level.pow(2.5)).times(1e20)			
	}
}

function buyAmoebaUpg(row, col) {
	initAmoebaUpgrades();
	const id = AMOEBA_UPGRADE_DATA[row][col].id
	const cost = getAmoebaUpgCost(id, player.amoebas.upgrades[id])

	if (player.amoebas.amount.gte(cost)) {
		player.amoebas.upgrades[id] = player.amoebas.upgrades[id].plus(1)
		player.amoebas.amount = player.amoebas.amount.minus(cost)
	}
}

function amoebaUpgradeEffect(id, level) {
	if (!(level instanceof ExpantaNum)) {
        level = new ExpantaNum(level || 0);
    }
	
	let effectiveLevel = level.times(tmp.amoebas.upgPow || 1);
	
	switch (id) {
		case 0:
			return ExpantaNum(effectiveLevel.times(0.25).plus(1))
		case 1:
			return ExpantaNum.pow(effectiveLevel.div(5).plus(1), player.amoebas.upgrades[2].div(1.5).mul(player.tr.upgrades.includes(37) && !HCCBA("noTRU") ? (player.tr.cubes.plus(1).times(10).slog(2)) : 1))
		case 2:
			return ExpantaNum.pow(effectiveLevel.div(15).plus(1), player.amoebas.upgrades[1].times(1.25).mul(player.tr.upgrades.includes(37) && !HCCBA("noTRU") ? (player.tr.cubes.plus(1).times(10).slog(2)) : 1))
		case 3:
			return effectiveLevel.pow(1.25).plus(1).pow(player.tr.upgrades.includes(37) && player.tr.upgrades.includes(42) && !HCCBA("noTRU") ? (player.tr.cubes.plus(1).times(10).slog(2)) : 1)
		case 4:
			return effectiveLevel.root(1.333).mul(0.15).plus(1)
		case 5:
			return ExpantaNum.pow(player.amoebas.amount.logBase(10), effectiveLevel)
	}
}

const getAmoebaUpgEffect = (row, col) => {
    if (!tmp.amoebas || !tmp.amoebas.upgrades || !tmp.amoebas.upgrades[row] || !tmp.amoebas.upgrades[row][col]) {
        return new ExpantaNum(1); 
    }
    return tmp.amoebas.upgrades[row][col].effect;
}

function updateAmoebaMaxAll() {
    const container = document.getElementById("maxAllAmoebaContainer");
    if (container) {
        if (tmp.ach[61].has) {
            container.style.display = "block";
        } else {
            container.style.display = "none";
        }
    }
}

function updateAmoebaTemp() {
	tmp.amoebas = {}
	tmp.amoebas.upgrades = {}
	tmp.amoebas.thirdRowUnlocked = player.tr.upgrades.includes(39)
	
	tmp.amoebas.upgPow = new ExpantaNum(1); 
	if (player.tr.upgrades.includes(50) && !HCCBA("noTRU")) tmp.amoebas.upgPow = tmp.amoebas.upgPow.plus(player.amoebas.amount.plus(1).logBase(2).pow(player.pathogens.amount.plus(1).times(10).log(2).max(1)).slog(4).sub(1).div(4.75).max(0));
    if (tmp.dc && tmp.ach[77].has) tmp.amoebas.upgPow = tmp.amoebas.upgPow.plus(tmp.dc.coreEff.max(0));

	if (tmp.amoebas.upgPow.gte(10)) 
		tmp.amoebas.upgPow = tmp.amoebas.upgPow.sqrt().times(Math.sqrt(10));

	if (amoebasUnlocked()) {
		let upgPowElem = document.getElementById("amoebaUpgPow");
		if (upgPowElem) upgPowElem.textContent = showNum(tmp.amoebas.upgPow);
	}

	initAmoebaUpgrades();
	if (player.amoebas.upgrades === undefined) {
        player.amoebas.upgrades = {}
	}
  
	for (const i in AMOEBA_UPGRADE_DATA) {
		if (i == 2 && !tmp.amoebas.thirdRowUnlocked) continue;
		
		const row = AMOEBA_UPGRADE_DATA[i]
		tmp.amoebas.upgrades[i] = {}
		const tmpRow = tmp.amoebas.upgrades[i]
		
		for (const j in row) {
			const upgrade = row[j]
			let level = player.amoebas.upgrades[upgrade.id]
            if (level === undefined) level = new ExpantaNum(0)
			tmpRow[j] = {}
			tmpUpg = tmpRow[j]
			
			tmpUpg.cost = getAmoebaUpgCost(upgrade.id, level)
			tmpUpg.effect = amoebaUpgradeEffect(upgrade.id, level)
			tmpUpg.desc = `${upgrade.desc(tmpUpg.effect)}<br>Level: ${showNum(level)}<br>Cost: ${showNum(tmpUpg.cost)} amoebas`
		}
	}

	if (!tmp.amoebas.maxAll) tmp.amoebas.maxAll = function () {
		let boughtAnything = false;
		
		for (let pass = 0; pass < 100; pass++) { 
			let boughtThisPass = false;
			
			for (let row = 0; row < AMOEBA_UPGRADE_DATA.length; row++) {
				if (row == 2 && !tmp.amoebas.thirdRowUnlocked) continue;
				
				for (let col = 0; col < AMOEBA_UPGRADE_DATA[row].length; col++) {
					const upgrade = AMOEBA_UPGRADE_DATA[row][col];
					const id = upgrade.id;
					const currentLevel = player.amoebas.upgrades[id] || new ExpantaNum(0);
					
					const nextCost = getAmoebaUpgCost(id, currentLevel);
					
					if (player.amoebas.amount.gte(nextCost)) {
						player.amoebas.upgrades[id] = currentLevel.plus(1);
						player.amoebas.amount = player.amoebas.amount.sub(nextCost);
						boughtThisPass = true;
						boughtAnything = true;
					}
				}
			}
			
			if (!boughtThisPass) break;
		}
		
		return boughtAnything;
	};
	
	if (typeof updateAmoebaMaxAll === 'function') {
		updateAmoebaMaxAll();
	}
}

function amoebasUnlocked() {
	return getMinusId() > 0.5
}