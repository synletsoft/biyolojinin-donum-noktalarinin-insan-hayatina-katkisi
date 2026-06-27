const GAME_WIDTH = 1920;
const GAME_HEIGHT = 1080;
const CELL_SIZE = 45;

const WORDS = [
	{
		id: 1,
		direction: "across",
		row: 0,
		col: 4,
		answer: "ROBERTHOOKE",
		clue: "Gelistirdiği mikroskobu kullanarak binlerce canlıyı inceleyen, gözlemlediği canlıların çizimlerini içeren Micrographia adlı eserini 1665 yılında yayımlayan kişi."
	},
	{
		id: 2,
		direction: "down",
		row: 0,
		col: 7,
		answer: "EDWARDJENNER",
		clue: "Çiçek hastalığına karşı ilk başarılı aşıyı geliştiren kişi."
	},
	{
		id: 3,
		direction: "down",
		row: 1,
		col: 1,
		answer: "REKOMBİNANTDNA",
		clue: "1973 yılında Cohen ve Boyer tarafından geliştirilen, birçok canlının genetik yapısını yeniden düzenlemeye yarayan teknolojinin adı."
	},
	{
		id: 4,
		direction: "across",
		row: 2,
		col: 13,
		answer: "MRNAAŞISI",
		clue: "Virüsün bir parçasının üretilmesini sağlayacak yapıları bulunduran aşı çeşidi."
	},
	{
		id: 5,
		direction: "down",
		row: 2,
		col: 16,
		answer: "AKŞEMSEDDİN",
		clue: "Bulaşıcı hastalıklar üzerinde önemli çalışmalar yaparak ilk defa mikrop ve bulaşma tezini ortaya atan bilim insanı."
	},
	{
		id: 6,
		direction: "down",
		row: 2,
		col: 21,
		answer: "IANWILMUT",
		clue: "Bir koyunun vücut hücresini kullanarak Dolly ismini verdikleri koyunu klonlayan bilim insanlarından biri."
	},
	{
		id: 7,
		direction: "across",
		row: 2,
		col: 0,
		answer: "MENDEL",
		clue: "Kalıtım biliminin öncüsü."
	},
	{
		id: 8,
		direction: "down",
		row: 4,
		col: 13,
		answer: "BİYOLOJİ",
		clue: "Yaşamın ve insan sağlığının anlaşılması, hastalıkların kökenlerinin incelenmesi, tedavi yöntemlerinin geliştirilmesi ve genetik araştırmalar gibi sağlık bilimleri alanındaki önemli çalışmaların temelini oluşturan bilim dalı."
	},
	{
		id: 9,
		direction: "down",
		row: 4,
		col: 10,
		answer: "FLEMING",
		clue: "Bakteriyel enfeksiyonların tedavisinde çığır açan antibiyotiklerin ilk örneği olan penisilini bulan bilim insanı."
	},
	{
		id: 10,
		direction: "down",
		row: 0,
		col: 19,
		answer: "CRISPRCAS",
		clue: "Araştırmacıların DNA üzerinde ekleme, çıkarma ya da dizilim değiştirme yapmalarına olanak tanıyan özgün teknolojinin adı."
	},
	{
		id: 11,
		direction: "across",
		row: 7,
		col: 1,
		answer: "İNSANGENOMPROJESİ",
		clue: "İnsan DNA'sının ortaya çıkarılmasını ve haritalanmasını amaçlayan bilimsel gelişme."
	},
	{
		id: 12,
		direction: "across",
		row: 14,
		col: 0,
		answer: "WATSONCRICK",
		clue: "Günümüzde güncelliğini koruyan çift sarmal DNA modelini öne süren bilim insanları."
	}
];

const SECRET_CELLS = [
	{ word: 8, index: 0, label: "8" },
	{ word: 5, index: 9, label: "5" },
	{ word: 9, index: 1, label: "9" },
	{ word: 11, index: 0, label: "11" },
	{ word: 7, index: 0, label: "7" }
];

runOnStartup(runtime =>
{
	runtime.addEventListener("afteranylayoutstart", e =>
	{
		if (e.layout.name === "game")
			createCrossword();
		else
			removeCrossword();
	});
});

function createCrossword()
{
	removeCrossword();
	injectStyles();

	const state = {
		activeIndex: 0,
		mode: "play",
		cells: buildCells(),
		inputs: new Map(),
		secretKeys: new Set()
	};

	for (const item of SECRET_CELLS)
	{
		const word = WORDS.find(w => w.id === item.word);
		state.secretKeys.add(word.cells[item.index]);
	}

	const host = document.createElement("div");
	host.id = "bio-crossword-host";
	host.innerHTML = `
		<div class="bio-stage">
			<header class="bio-topbar">
				<button class="bio-arrow" type="button" data-action="prev" aria-label="Önceki soru">‹</button>
				<div class="bio-question">
					<div class="bio-question-text"></div>
				</div>
				<button class="bio-arrow" type="button" data-action="next" aria-label="Sonraki soru">›</button>
			</header>
			<main class="bio-main">
				<section class="bio-board" aria-label="Biyoloji bulmacası"></section>
			</main>
			<section class="bio-secret" aria-label="Şifre">
				<strong>Şifre</strong>
				<div class="bio-secret-boxes"></div>
			</section>
			<div class="bio-actions">
				<div class="bio-feedback" aria-live="polite"></div>
				<button class="bio-action bio-hint" type="button" aria-label="İpucu Ver" data-tooltip="İpucu Ver">
					<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M8 14c-1.3-1.1-2-2.6-2-4.2C6 6.1 8.7 3.5 12 3.5s6 2.6 6 6.3c0 1.6-.7 3.1-2 4.2-.9.8-1.2 1.5-1.2 2.5H9.2c0-1-.3-1.7-1.2-2.5Z"/></svg>
				</button>
				<button class="bio-action bio-result" type="button" aria-label="Sonuç" data-tooltip="Sonuç">
					<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
				</button>
				<button class="bio-action bio-answers" type="button" aria-label="Cevaplar" data-tooltip="Cevaplar">
					<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>
				</button>
				<button class="bio-action bio-clear" type="button" aria-label="Temizle" data-tooltip="Temizle">
					<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M6 6l1 16h10l1-16"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
				</button>
			</div>
		</div>
	`;

	document.body.appendChild(host);

	state.host = host;
	state.stage = host.querySelector(".bio-stage");
	state.board = host.querySelector(".bio-board");
	state.question = host.querySelector(".bio-question-text");
	state.secret = host.querySelector(".bio-secret-boxes");
	state.feedback = host.querySelector(".bio-feedback");

	for (const word of WORDS)
		word.cells = getWordCells(word);

	renderBoard(state);
	renderSecretBoxes(state);
	updateScale(state);
	renderState(state);

	host.querySelector('[data-action="prev"]').addEventListener("click", () =>
	{
		state.activeIndex = (state.activeIndex + WORDS.length - 1) % WORDS.length;
		state.mode = "play";
		renderState(state);
		focusActiveWord(state);
	});

	host.querySelector('[data-action="next"]').addEventListener("click", () =>
	{
		state.activeIndex = (state.activeIndex + 1) % WORDS.length;
		state.mode = "play";
		renderState(state);
		focusActiveWord(state);
	});

	host.querySelector(".bio-hint").addEventListener("click", () =>
	{
		state.mode = "hint";
		renderState(state);
	});

	host.querySelector(".bio-result").addEventListener("click", () =>
	{
		state.mode = "result";
		renderState(state);
	});

	host.querySelector(".bio-answers").addEventListener("click", () =>
	{
		for (const [key, input] of state.inputs)
			input.value = state.cells.get(key).letter;

		state.mode = "result";
		renderState(state);
	});

	host.querySelector(".bio-clear").addEventListener("click", () =>
	{
		for (const input of state.inputs.values())
			input.value = "";

		state.mode = "play";
		renderState(state);
		focusActiveWord(state);
	});

	for (const button of host.querySelectorAll(".bio-action"))
	{
		button.addEventListener("touchstart", () =>
		{
			button.classList.add("show-tip");
			setTimeout(() => button.classList.remove("show-tip"), 1600);
		}, { passive: true });
	}

	window.addEventListener("resize", () => updateScale(state), { passive: true });
}

function removeCrossword()
{
	document.getElementById("bio-crossword-host")?.remove();
}

function buildCells()
{
	const cells = new Map();

	for (const word of WORDS)
	{
		word.cells = getWordCells(word);

		word.cells.forEach((key, index) =>
		{
			const [row, col] = key.split(",").map(Number);
			const letter = word.answer[index];
			const existing = cells.get(key);

			if (existing && existing.letter !== letter)
				throw new Error(`Bulmaca çakışması: ${key} hücresinde ${existing.letter}/${letter}`);

			if (!existing)
			{
				cells.set(key, {
					row,
					col,
					letter,
					words: [word.id],
					startIds: index === 0 ? [word.id] : []
				});
			}
			else
			{
				existing.words.push(word.id);

				if (index === 0)
					existing.startIds.push(word.id);
			}
		});
	}

	return cells;
}

function getWordCells(word)
{
	return [...word.answer].map((_, index) =>
	{
		const row = word.row + (word.direction === "down" ? index : 0);
		const col = word.col + (word.direction === "across" ? index : 0);
		return `${row},${col}`;
	});
}

function renderBoard(state)
{
	const rows = Math.max(...[...state.cells.values()].map(cell => cell.row)) + 1;
	const cols = Math.max(...[...state.cells.values()].map(cell => cell.col)) + 1;

	state.board.style.gridTemplateColumns = `repeat(${cols}, ${CELL_SIZE}px)`;
	state.board.style.gridTemplateRows = `repeat(${rows}, ${CELL_SIZE}px)`;

	for (const cell of state.cells.values())
	{
		const wrap = document.createElement("div");
		wrap.className = "bio-cell";
		wrap.dataset.key = `${cell.row},${cell.col}`;
		wrap.style.gridColumn = `${cell.col + 1}`;
		wrap.style.gridRow = `${cell.row + 1}`;

		if (cell.startIds.length)
		{
			const number = document.createElement("span");
			number.className = "bio-number";
			number.textContent = cell.startIds.join("/");
			wrap.appendChild(number);
		}

		if (state.secretKeys.has(wrap.dataset.key))
		{
			const mark = document.createElement("span");
			mark.className = "bio-cipher-mark";
			wrap.appendChild(mark);
		}

		const input = document.createElement("input");
		input.type = "text";
		input.maxLength = 1;
		input.autocomplete = "off";
		input.inputMode = "text";
		input.ariaLabel = "Bulmaca harfi";
		input.addEventListener("focus", () => activateFromCell(state, wrap.dataset.key));
		input.addEventListener("click", () => activateFromCell(state, wrap.dataset.key));
		input.addEventListener("input", () => onCellInput(state, input, wrap.dataset.key));
		input.addEventListener("keydown", e => onCellKeydown(state, e, wrap.dataset.key));
		wrap.appendChild(input);

		state.inputs.set(wrap.dataset.key, input);
		state.board.appendChild(wrap);
	}
}

function renderSecretBoxes(state)
{
	state.secret.innerHTML = "";

	for (const item of SECRET_CELLS)
	{
		const word = WORDS.find(w => w.id === item.word);
		const key = word.cells[item.index];
		const box = document.createElement("div");
		box.className = "bio-secret-box";
		box.dataset.key = key;
		box.innerHTML = `<span></span><small>${item.label}</small>`;
		state.secret.appendChild(box);
	}
}

function renderState(state)
{
	const activeWord = WORDS[state.activeIndex];
	const activeCells = new Set(activeWord.cells);

	state.question.innerHTML = `<strong>${activeWord.id}.</strong> ${escapeHtml(activeWord.clue)}`;
	state.feedback.textContent = "";

	for (const [key, input] of state.inputs)
	{
		const wrap = input.closest(".bio-cell");
		const isActive = activeCells.has(key);
		const value = normalizeLetter(input.value);
		const expected = state.cells.get(key).letter;

		input.value = value;
		input.readOnly = !isActive;
		wrap.classList.toggle("is-active", isActive);
		wrap.classList.toggle("is-secret", state.secretKeys.has(key));
		wrap.classList.remove("is-correct", "is-wrong", "has-good-border", "has-bad-border");

		if (state.mode === "result")
		{
			if (value === expected)
				wrap.classList.add("is-correct");
			else
				wrap.classList.add("is-wrong");
		}
		else if (state.mode === "hint" && value)
		{
			if (value === expected)
				wrap.classList.add("has-good-border");
			else
				wrap.classList.add("has-bad-border");
		}
	}

	updateSecret(state);

	if (state.mode === "result")
	{
		const correctCount = [...state.inputs].filter(([key, input]) => normalizeLetter(input.value) === state.cells.get(key).letter).length;
		state.feedback.textContent = `${correctCount}/${state.inputs.size} harf doğru`;
	}
	else if (state.mode === "hint")
	{
		state.feedback.textContent = "Harf kenarları güncellendi";
	}
}

function activateFromCell(state, key)
{
	const cell = state.cells.get(key);
	const currentWord = WORDS[state.activeIndex];

	if (currentWord.cells.includes(key))
		return;

	const nextWordId = cell.words[0];
	const nextIndex = WORDS.findIndex(word => word.id === nextWordId);

	if (nextIndex !== -1)
	{
		state.activeIndex = nextIndex;
		state.mode = "play";
		renderState(state);
		setTimeout(() => state.inputs.get(key)?.focus(), 0);
	}
}

function onCellInput(state, input, key)
{
	input.value = normalizeLetter(input.value).slice(-1);
	state.mode = "play";
	renderState(state);

	if (input.value)
		focusNeighbor(state, key, 1);
}

function onCellKeydown(state, event, key)
{
	const activeWord = WORDS[state.activeIndex];

	if (event.key === "Backspace" && !state.inputs.get(key).value)
	{
		event.preventDefault();
		focusNeighbor(state, key, -1, true);
	}
	else if (event.key === "ArrowRight" || event.key === "ArrowDown")
	{
		event.preventDefault();
		focusNeighbor(state, key, 1);
	}
	else if (event.key === "ArrowLeft" || event.key === "ArrowUp")
	{
		event.preventDefault();
		focusNeighbor(state, key, -1);
	}
	else if (event.key === "Enter")
	{
		event.preventDefault();
		state.activeIndex = (state.activeIndex + 1) % WORDS.length;
		state.mode = "play";
		renderState(state);
		focusActiveWord(state);
	}
	else if (event.key.length === 1 && !activeWord.cells.includes(key))
	{
		event.preventDefault();
	}
}

function focusNeighbor(state, key, offset, clear)
{
	const activeWord = WORDS[state.activeIndex];
	const currentIndex = activeWord.cells.indexOf(key);
	const nextIndex = Math.max(0, Math.min(activeWord.cells.length - 1, currentIndex + offset));
	const nextKey = activeWord.cells[nextIndex];
	const nextInput = state.inputs.get(nextKey);

	if (clear)
		nextInput.value = "";

	nextInput.focus();
	nextInput.select();
	updateSecret(state);
}

function focusActiveWord(state)
{
	const activeWord = WORDS[state.activeIndex];
	const key = activeWord.cells.find(cellKey => !state.inputs.get(cellKey).value) || activeWord.cells[0];
	const input = state.inputs.get(key);
	input.focus();
	input.select();
}

function updateSecret(state)
{
	for (const box of state.secret.querySelectorAll(".bio-secret-box"))
	{
		const letter = normalizeLetter(state.inputs.get(box.dataset.key)?.value || "");
		box.querySelector("span").textContent = letter;
		box.classList.toggle("is-filled", Boolean(letter));
	}
}

function normalizeLetter(value)
{
	return value
		.trim()
		.replace(/\s+/g, "")
		.toLocaleUpperCase("tr-TR")
		.replace(/[^A-ZÇĞİÖŞÜ]/g, "");
}

function escapeHtml(value)
{
	return value.replace(/[&<>"']/g, character => ({
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		"\"": "&quot;",
		"'": "&#39;"
	}[character]));
}

function updateScale(state)
{
	const scale = Math.min(window.innerWidth / GAME_WIDTH, window.innerHeight / GAME_HEIGHT);
	state.stage.style.transform = `translate(-50%, -50%) scale(${scale})`;
}

function injectStyles()
{
	if (document.getElementById("bio-crossword-style"))
		return;

	const style = document.createElement("style");
	style.id = "bio-crossword-style";
	style.textContent = `
		#bio-crossword-host {
			position: fixed;
			inset: 0;
			z-index: 2147483647;
			overflow: hidden;
			background: transparent;
			font-family: Calibri, Arial, sans-serif;
			color: #172033;
			pointer-events: none;
		}

		.bio-stage {
			position: absolute;
			left: 50%;
			top: 50%;
			width: ${GAME_WIDTH}px;
			height: ${GAME_HEIGHT}px;
			transform-origin: center center;
			pointer-events: none;
		}

		.bio-topbar {
			position: absolute;
			left: 78px;
			top: 128px;
			width: 1368px;
			height: 112px;
			display: grid;
			grid-template-columns: 76px 1fr 76px;
			gap: 14px;
			align-items: center;
			pointer-events: auto;
		}

		.bio-question {
			height: 100%;
			padding: 18px 28px;
			border: 2px solid rgba(40, 73, 108, 0.22);
			border-radius: 25px;
			background: rgba(255, 255, 255, 0.96);
			box-shadow: 0 16px 36px rgba(50, 79, 105, 0.14);
			display: flex;
			flex-direction: column;
			justify-content: center;
			overflow: hidden;
		}

		.bio-question-text {
			font-size: 29px;
			font-weight: 400;
			line-height: 1.12;
		}

		.bio-question-text strong {
			font-weight: 900;
			color: #000000;
			margin-right: 8px;
		}

		.bio-arrow,
		.bio-action {
			border: 0;
			border-radius: 8px;
			cursor: pointer;
			font-family: inherit;
			font-weight: 800;
			color: #ffffff;
			background: #315c85;
			box-shadow: 0 12px 22px rgba(31, 72, 112, 0.24);
		}

		.bio-arrow {
			width: 76px;
			height: 96px;
			background: transparent;
			box-shadow: none;
			color: transparent;
			font-size: 0;
			padding: 0;
		}

		.bio-arrow:active,
		.bio-action:active {
			transform: translateY(2px);
		}

		.bio-main {
			position: absolute;
			left: 0;
			right: 0;
			top: 330px;
			display: flex;
			justify-content: center;
		}

		.bio-board {
			display: grid;
			gap: 0;
			padding: 0;
			background: transparent;
			pointer-events: auto;
		}

		.bio-cell {
			position: relative;
			width: ${CELL_SIZE}px;
			height: ${CELL_SIZE}px;
			margin: -1px 0 0 -1px;
			background: #ffffff;
			border: 1px solid #303030;
			box-sizing: border-box;
		}

		.bio-cell.is-active {
			background: #fff0a6;
		}

		.bio-cell.is-correct {
			background: #c9f0cf;
		}

		.bio-cell.is-wrong {
			background: #f7caca;
		}

		.bio-cell.has-good-border {
			box-shadow: inset 0 0 0 4px #39a66a;
		}

		.bio-cell.has-bad-border {
			box-shadow: inset 0 0 0 4px #d94c4c;
		}

		.bio-cell input {
			position: relative;
			z-index: 2;
			width: 100%;
			height: 100%;
			border: 0;
			outline: 0;
			padding: 8px 2px 2px;
			box-sizing: border-box;
			background: transparent;
			text-align: center;
			font: 800 24px/1 Calibri, Arial, sans-serif;
			color: #101820;
			text-transform: uppercase;
			caret-color: #315c85;
		}

		.bio-number {
			position: absolute;
			z-index: 3;
			left: 3px;
			top: 1px;
			font-size: 12px;
			font-weight: 800;
			color: #27313b;
			pointer-events: none;
		}

		.bio-cipher-mark {
			position: absolute;
			z-index: 1;
			left: 50%;
			top: 50%;
			width: 32px;
			height: 32px;
			border-radius: 50%;
			background: rgba(244, 170, 75, 0.68);
			transform: translate(-50%, -50%);
			pointer-events: none;
		}

		.bio-secret {
			position: absolute;
			left: 52px;
			top: 330px;
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 12px;
			font-size: 26px;
		}

		.bio-secret-boxes {
			display: flex;
			flex-direction: column;
			gap: 6px;
		}

		.bio-secret-box {
			position: relative;
			width: 70px;
			height: 70px;
			border: 2px solid #1e2630;
			background: rgba(255, 255, 255, 0.94);
			display: grid;
			place-items: center;
			font-size: 34px;
			font-weight: 900;
		}

		.bio-secret-box small {
			position: absolute;
			left: calc(100% + 8px);
			top: 50%;
			transform: translateY(-50%);
			text-align: center;
			font-size: 18px;
			font-weight: 800;
			color: #2b3440;
		}

		.bio-secret-box.is-filled {
			background: #ffe7b8;
		}

		.bio-actions {
			position: absolute;
			right: 28px;
			top: 350px;
			width: 96px;
			display: flex;
			flex-direction: column;
			gap: 18px;
			pointer-events: auto;
		}

		.bio-feedback {
			min-height: 32px;
			text-align: center;
			font-size: 18px;
			font-weight: 800;
			color: #315c85;
			width: 220px;
			margin-left: -124px;
		}

		.bio-action {
			position: relative;
			width: 91px;
			height: 91px;
			border-radius: 50%;
			display: grid;
			place-items: center;
			padding: 0;
			color: #111111;
			background:
				radial-gradient(circle at 35% 28%, #ffffff 0%, #f9fafb 34%, #d9dce1 62%, #afb5bd 100%);
			border: 1px solid rgba(255, 255, 255, 0.85);
			box-shadow:
				inset 0 2px 5px rgba(255, 255, 255, 0.95),
				inset 0 -7px 13px rgba(89, 96, 106, 0.26),
				0 10px 18px rgba(45, 54, 66, 0.22);
		}

		.bio-action svg {
			width: 41px;
			height: 41px;
			fill: none;
			stroke: currentColor;
			stroke-width: 2.4;
			stroke-linecap: round;
			stroke-linejoin: round;
		}

		.bio-action::before {
			content: attr(data-tooltip);
			position: absolute;
			right: calc(100% + 14px);
			top: 50%;
			transform: translateY(-50%);
			min-width: 126px;
			padding: 10px 14px;
			border-radius: 8px;
			background: rgba(21, 30, 42, 0.92);
			color: #ffffff;
			font-size: 20px;
			font-weight: 800;
			text-align: center;
			opacity: 0;
			pointer-events: none;
			transition: opacity 120ms ease, transform 120ms ease;
		}

		.bio-action:hover::before,
		.bio-action:focus-visible::before,
		.bio-action.show-tip::before {
			opacity: 1;
			transform: translate(-4px, -50%);
		}

		.bio-hint {
			background:
				radial-gradient(circle at 35% 28%, #ffffff 0%, #f9fafb 34%, #d9dce1 62%, #afb5bd 100%);
		}

		.bio-result {
			background:
				radial-gradient(circle at 35% 28%, #ffffff 0%, #f9fafb 34%, #d9dce1 62%, #afb5bd 100%);
		}

		.bio-answers {
			background:
				radial-gradient(circle at 35% 28%, #ffffff 0%, #f9fafb 34%, #d9dce1 62%, #afb5bd 100%);
		}

		.bio-clear {
			background:
				radial-gradient(circle at 35% 28%, #ffffff 0%, #f9fafb 34%, #d9dce1 62%, #afb5bd 100%);
		}
	`;
	document.head.appendChild(style);
}
