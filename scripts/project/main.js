const GAME_WIDTH = 1920;
const GAME_HEIGHT = 1080;
const CELL_SIZE = 64;
const BOARD_INSET = 6;
const BOARD_SIDE_GUTTER = 300;

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
		values: new Map(),
		secretKeys: new Set(),
		selectedKey: "",
		zoom: 1,
		manualZoom: false,
		boardCols: 0,
		boardRows: 0
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
				<section class="bio-board-viewport" aria-label="Kaydırılabilir cevap alanı">
					<section class="bio-board-canvas">
						<section class="bio-board" aria-label="Biyoloji bulmacası"></section>
					</section>
					<div class="bio-zoom-controls" aria-label="Cevap alanı yakınlaştırma">
						<button class="bio-zoom" type="button" data-zoom="in" aria-label="Yakınlaştır">+</button>
						<button class="bio-zoom" type="button" data-zoom="out" aria-label="Uzaklaştır">-</button>
					</div>
				</section>
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
		<div class="bio-keyboard" aria-label="Türkçe Q klavye"></div>
	`;

	document.body.appendChild(host);

	state.host = host;
	state.stage = host.querySelector(".bio-stage");
	state.board = host.querySelector(".bio-board");
	state.canvas = host.querySelector(".bio-board-canvas");
	state.viewport = host.querySelector(".bio-board-viewport");
	state.question = host.querySelector(".bio-question-text");
	state.secret = host.querySelector(".bio-secret-boxes");
	state.feedback = host.querySelector(".bio-feedback");
	state.keyboard = host.querySelector(".bio-keyboard");

	for (const word of WORDS)
		word.cells = getWordCells(word);

	renderBoard(state);
	renderSecretBoxes(state);
	renderKeyboard(state);
	bindBoardPan(state);
	bindZoomControls(state);
	updateScale(state);
	renderState(state);
	focusActiveWord(state);
	panToActiveWord(state, false);

	host.querySelector('[data-action="prev"]').addEventListener("click", () =>
	{
		state.activeIndex = (state.activeIndex + WORDS.length - 1) % WORDS.length;
		state.mode = "play";
		state.manualZoom = false;
		renderState(state);
		focusActiveWord(state);
		panToActiveWord(state);
	});

	host.querySelector('[data-action="next"]').addEventListener("click", () =>
	{
		state.activeIndex = (state.activeIndex + 1) % WORDS.length;
		state.mode = "play";
		state.manualZoom = false;
		renderState(state);
		focusActiveWord(state);
		panToActiveWord(state);
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
		for (const key of state.inputs.keys())
			state.values.set(key, state.cells.get(key).letter);

		state.mode = "result";
		renderState(state);
	});

	host.querySelector(".bio-clear").addEventListener("click", () =>
	{
		state.values.clear();

		state.mode = "play";
		state.manualZoom = false;
		renderState(state);
		focusActiveWord(state);
		panToActiveWord(state);
	});

	for (const button of host.querySelectorAll(".bio-action"))
	{
		button.addEventListener("touchstart", () =>
		{
			button.classList.add("show-tip");
			setTimeout(() => button.classList.remove("show-tip"), 1600);
		}, { passive: true });
	}

	if (window.bioCrosswordKeyHandler)
		document.removeEventListener("keydown", window.bioCrosswordKeyHandler);

	window.bioCrosswordKeyHandler = event => onPhysicalKeydown(state, event);
	document.addEventListener("keydown", window.bioCrosswordKeyHandler);
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

	state.boardCols = cols;
	state.boardRows = rows;
	state.board.style.gridTemplateColumns = `repeat(${cols}, ${CELL_SIZE}px)`;
	state.board.style.gridTemplateRows = `repeat(${rows}, ${CELL_SIZE}px)`;
	updateBoardZoom(state);

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

		const letter = document.createElement("div");
		letter.className = "bio-letter";
		letter.setAttribute("role", "button");
		letter.setAttribute("tabindex", "0");
		letter.setAttribute("aria-label", "Bulmaca harfi");
		letter.addEventListener("pointerdown", () =>
		{
			showKeyboard(state);
			activateFromCell(state, wrap.dataset.key);
			revealSelectedCell(state);
		});
		letter.addEventListener("keydown", e =>
		{
			if (e.key === "Enter" || e.key === " ")
			{
				e.preventDefault();
				activateFromCell(state, wrap.dataset.key);
			}
		});
		wrap.appendChild(letter);

		state.inputs.set(wrap.dataset.key, letter);
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

function renderKeyboard(state)
{
	const leftRows = [
		["Q", "W", "E", "R", "T", "Y"],
		["A", "S", "D", "F", "G", "H"],
		["Z", "X", "C", "V", "B"]
	];
	const rightRows = [
		["U", "I", "O", "P", "Ğ", "Ü"],
		["J", "K", "L", "Ş", "İ"],
		["N", "M", "Ö", "Ç"]
	];
	const renderRows = rows => rows.map(row => `
		<div class="bio-key-row">
			${row.map(letter => `<button class="bio-key" type="button" data-letter="${letter}">${letter}</button>`).join("")}
		</div>
	`).join("");

	state.keyboard.innerHTML = `
		<div class="bio-key-half bio-key-half-left">
			${renderRows(leftRows)}
			<div class="bio-key-row bio-key-row-bottom">
				<button class="bio-key bio-key-wide" type="button" data-action="backspace">Sil</button>
			</div>
		</div>
		<div class="bio-key-half bio-key-half-right">
			${renderRows(rightRows)}
			<div class="bio-key-row bio-key-row-bottom">
				<button class="bio-key bio-key-wide" type="button" data-action="enter">Enter</button>
			</div>
		</div>
	`;

	state.keyboard.addEventListener("pointerdown", event => event.preventDefault());
	state.keyboard.addEventListener("click", event =>
	{
		const key = event.target.closest(".bio-key");

		if (!key)
			return;

		if (key.dataset.letter)
			enterLetter(state, key.dataset.letter);
		else if (key.dataset.action === "backspace")
			deleteLetter(state);
		else if (key.dataset.action === "enter")
			hideKeyboard(state);
	});
}

function bindBoardPan(state)
{
	let startX = 0;
	let startY = 0;
	let startScrollX = 0;
	let startScrollY = 0;
	let dragging = false;
	let scrollTimer = 0;

	state.viewport.addEventListener("scroll", () =>
	{
		state.viewport.classList.add("is-scrolling");
		clearTimeout(scrollTimer);
		scrollTimer = setTimeout(() => state.viewport.classList.remove("is-scrolling"), 900);
	}, { passive: true });

	state.viewport.addEventListener("pointerdown", event =>
	{
		dragging = true;
		startX = event.clientX;
		startY = event.clientY;
		startScrollX = state.viewport.scrollLeft;
		startScrollY = state.viewport.scrollTop;
		state.viewport.setPointerCapture(event.pointerId);
		state.viewport.classList.add("is-dragging");
	});

	state.viewport.addEventListener("pointermove", event =>
	{
		if (!dragging)
			return;

		state.viewport.scrollLeft = startScrollX - (event.clientX - startX);
		state.viewport.scrollTop = startScrollY - (event.clientY - startY);
	});

	state.viewport.addEventListener("pointerup", event =>
	{
		dragging = false;
		state.viewport.releasePointerCapture(event.pointerId);
		state.viewport.classList.remove("is-dragging");
	});

	state.viewport.addEventListener("pointercancel", () =>
	{
		dragging = false;
		state.viewport.classList.remove("is-dragging");
	});
}

function bindZoomControls(state)
{
	for (const button of state.host.querySelectorAll(".bio-zoom"))
	{
		button.addEventListener("pointerdown", event =>
		{
			event.stopPropagation();
		});

		button.addEventListener("click", event =>
		{
			event.preventDefault();
			event.stopPropagation();
			const delta = button.dataset.zoom === "in" ? 0.12 : -0.12;
			setBoardZoom(state, state.zoom + delta);
		});
	}
}

function showKeyboard(state)
{
	state.keyboard.classList.add("is-open");

	if (state.zoom < 1)
	{
		state.manualZoom = true;
		state.zoom = 1;
		updateBoardZoom(state);
	}
}

function hideKeyboard(state)
{
	state.keyboard.classList.remove("is-open");
}

function setBoardZoom(state, zoom)
{
	const viewport = state.viewport.getBoundingClientRect();
	const centerX = state.viewport.scrollLeft + viewport.width / 2;
	const centerY = state.viewport.scrollTop + viewport.height / 2;
	const oldZoom = state.zoom;

	state.manualZoom = true;
	state.zoom = Math.max(0.7, Math.min(1.35, zoom));
	updateBoardZoom(state);

	state.viewport.scrollLeft = centerX * (state.zoom / oldZoom) - viewport.width / 2;
	state.viewport.scrollTop = centerY * (state.zoom / oldZoom) - viewport.height / 2;
}

function updateBoardZoom(state)
{
	if (!state.canvas)
		return;

	const width = state.boardCols * CELL_SIZE;
	const height = state.boardRows * CELL_SIZE;

	state.canvas.style.width = `${(width * state.zoom) + (BOARD_INSET * 2) + (BOARD_SIDE_GUTTER * 2)}px`;
	state.canvas.style.height = `${(height * state.zoom) + (BOARD_INSET * 2)}px`;
	state.board.style.width = `${width}px`;
	state.board.style.height = `${height}px`;
	state.board.style.transform = `scale(${state.zoom})`;
}

function panToActiveWord(state, smooth = true)
{
	const activeWord = WORDS[state.activeIndex];
	const rect = getWordRect(activeWord);
	const viewportWidth = state.viewport.clientWidth;
	const viewportHeight = state.viewport.clientHeight;
	const padding = 28;

	if (!state.manualZoom)
	{
		const fitZoom = Math.min(
			1,
			(viewportWidth - (padding * 2)) / rect.width,
			(viewportHeight - (padding * 2)) / rect.height
		);
		const nextZoom = Math.max(0.7, Math.min(1, fitZoom));

		if (Math.abs(nextZoom - state.zoom) > 0.001)
		{
			state.zoom = nextZoom;
			updateBoardZoom(state);
		}
	}

	const scaledLeft = BOARD_SIDE_GUTTER + BOARD_INSET + (rect.x * state.zoom);
	const scaledTop = BOARD_INSET + (rect.y * state.zoom);
	const scaledRight = BOARD_SIDE_GUTTER + BOARD_INSET + ((rect.x + rect.width) * state.zoom);
	const scaledBottom = BOARD_INSET + ((rect.y + rect.height) * state.zoom);
	const scaledWidth = scaledRight - scaledLeft;
	const scaledHeight = scaledBottom - scaledTop;
	const maxLeft = Math.max(0, state.canvas.offsetWidth - viewportWidth);
	const maxTop = Math.max(0, state.canvas.offsetHeight - viewportHeight);
	let left = scaledLeft + (scaledWidth / 2) - (viewportWidth / 2);
	let top = scaledTop + (scaledHeight / 2) - (viewportHeight / 2);

	if (scaledWidth + (padding * 2) <= viewportWidth)
	{
		if (scaledLeft - padding < left)
			left = scaledLeft - padding;
		if (scaledRight + padding > left + viewportWidth)
			left = scaledRight + padding - viewportWidth;
	}

	if (scaledHeight + (padding * 2) <= viewportHeight)
	{
		if (scaledTop - padding < top)
			top = scaledTop - padding;
		if (scaledBottom + padding > top + viewportHeight)
			top = scaledBottom + padding - viewportHeight;
	}

	left = Math.min(maxLeft, Math.max(0, left));
	top = Math.min(maxTop, Math.max(0, top));

	state.viewport.scrollTo({
		left,
		top,
		behavior: smooth ? "smooth" : "auto"
	});
}

function getWordRect(word)
{
	const rows = word.cells.map(key => Number(key.split(",")[0]));
	const cols = word.cells.map(key => Number(key.split(",")[1]));
	const minRow = Math.min(...rows);
	const maxRow = Math.max(...rows);
	const minCol = Math.min(...cols);
	const maxCol = Math.max(...cols);

	return {
		x: minCol * CELL_SIZE,
		y: minRow * CELL_SIZE,
		width: (maxCol - minCol + 1) * CELL_SIZE,
		height: (maxRow - minRow + 1) * CELL_SIZE
	};
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
		const value = normalizeLetter(state.values.get(key) || "");
		const expected = state.cells.get(key).letter;

		input.textContent = value;
		wrap.classList.toggle("is-active", isActive);
		wrap.classList.toggle("is-selected", state.selectedKey === key);
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
		const correctCount = [...state.inputs].filter(([key]) => normalizeLetter(state.values.get(key) || "") === state.cells.get(key).letter).length;
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
	state.selectedKey = key;

	if (currentWord.cells.includes(key))
	{
		renderState(state);
		return;
	}

	const nextWordId = cell.words[0];
	const nextIndex = WORDS.findIndex(word => word.id === nextWordId);

	if (nextIndex !== -1)
	{
		state.activeIndex = nextIndex;
		state.mode = "play";
		state.manualZoom = false;
		renderState(state);
		panToActiveWord(state);
	}
}

function enterLetter(state, letter)
{
	const activeWord = WORDS[state.activeIndex];
	const key = state.selectedKey || activeWord.cells[0];

	if (!activeWord.cells.includes(key))
		state.selectedKey = activeWord.cells[0];
	else
		state.selectedKey = key;

	state.values.set(state.selectedKey, normalizeLetter(letter).slice(-1));
	state.mode = "play";
	renderState(state);
	focusNeighbor(state, state.selectedKey, 1);
	revealSelectedCell(state);
}

function deleteLetter(state)
{
	const activeWord = WORDS[state.activeIndex];
	const key = state.selectedKey || activeWord.cells[0];

	state.values.delete(key);
	state.mode = "play";
	renderState(state);
	focusNeighbor(state, key, -1);
	revealSelectedCell(state);
}

function onPhysicalKeydown(state, event)
{
	if (!state.selectedKey)
		return;

	if (event.key === "Backspace")
	{
		event.preventDefault();
		deleteLetter(state);
		return;
	}

	if (event.key === "Enter")
	{
		event.preventDefault();
		hideKeyboard(state);
		return;
	}

	if (event.key === "ArrowRight" || event.key === "ArrowDown")
	{
		event.preventDefault();
		focusNeighbor(state, state.selectedKey, 1);
		return;
	}

	if (event.key === "ArrowLeft" || event.key === "ArrowUp")
	{
		event.preventDefault();
		focusNeighbor(state, state.selectedKey, -1);
		return;
	}

	if (event.key.length === 1)
	{
		const letter = normalizeLetter(event.key);

		if (letter)
		{
			event.preventDefault();
			enterLetter(state, letter);
		}
	}
}

function focusNeighbor(state, key, offset, clear)
{
	const activeWord = WORDS[state.activeIndex];
	const currentIndex = activeWord.cells.indexOf(key);
	const nextIndex = Math.max(0, Math.min(activeWord.cells.length - 1, currentIndex + offset));
	const nextKey = activeWord.cells[nextIndex];
	if (clear)
		state.values.delete(nextKey);

	state.selectedKey = nextKey;
	renderState(state);
	updateSecret(state);
}

function revealSelectedCell(state)
{
	const target = state.inputs.get(state.selectedKey);

	if (!target)
		return;

	requestAnimationFrame(() =>
	{
		const cellRect = target.closest(".bio-cell").getBoundingClientRect();
		const viewportRect = state.viewport.getBoundingClientRect();
		const keyboardPanels = state.keyboard.classList.contains("is-open")
			? [...state.keyboard.querySelectorAll(".bio-key-half")].map(panel => panel.getBoundingClientRect())
			: [];
		const blockingPanel = keyboardPanels.find(panel =>
			cellRect.right > panel.left &&
			cellRect.left < panel.right &&
			cellRect.bottom > panel.top &&
			cellRect.top < panel.bottom
		);
		const visibleBottom = blockingPanel
			? Math.min(viewportRect.bottom, blockingPanel.top - 18)
			: viewportRect.bottom;
		const margin = 34;
		let dx = 0;
		let dy = 0;

		if (cellRect.left < viewportRect.left + margin)
			dx = cellRect.left - viewportRect.left - margin;
		else if (cellRect.right > viewportRect.right - margin)
			dx = cellRect.right - viewportRect.right + margin;

		if (cellRect.top < viewportRect.top + margin)
			dy = cellRect.top - viewportRect.top - margin;
		else if (cellRect.bottom > visibleBottom - margin)
			dy = cellRect.bottom - visibleBottom + margin;

		if (dx || dy)
		{
			state.viewport.scrollBy({
				left: dx,
				top: dy,
				behavior: "smooth"
			});
		}
	});
}

function focusActiveWord(state)
{
	const activeWord = WORDS[state.activeIndex];
	const key = activeWord.cells.find(cellKey => !state.values.get(cellKey)) || activeWord.cells[0];
	state.selectedKey = key;
	renderState(state);
}

function updateSecret(state)
{
	for (const box of state.secret.querySelectorAll(".bio-secret-box"))
	{
		const letter = normalizeLetter(state.values.get(box.dataset.key) || "");
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
			left: 220px;
			top: 128px;
			width: 1480px;
			height: 124px;
			display: grid;
			grid-template-columns: 76px 1fr 76px;
			gap: 14px;
			align-items: center;
			pointer-events: auto;
		}

		.bio-question {
			height: 100%;
			padding: 8px 28px;
			border: 2px solid rgba(40, 73, 108, 0.22);
			border-radius: 25px;
			box-sizing: border-box;
			background: rgba(255, 255, 255, 0.96);
			box-shadow: 0 16px 36px rgba(50, 79, 105, 0.14);
			display: flex;
			flex-direction: column;
			justify-content: center;
			overflow: hidden;
		}

		.bio-question-text {
			font-size: 35px;
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
			left: 220px;
			right: 220px;
			top: 330px;
			height: 700px;
			display: block;
		}

		.bio-board-viewport {
			position: relative;
			width: 100%;
			height: 100%;
			overflow: auto;
			touch-action: none;
			cursor: grab;
			pointer-events: auto;
			scrollbar-width: thin;
			scrollbar-color: rgba(65, 78, 94, 0.2) rgba(255, 255, 255, 0.08);
		}

		.bio-board-viewport::-webkit-scrollbar {
			width: 14px;
			height: 14px;
		}

		.bio-board-viewport::-webkit-scrollbar-thumb {
			border-radius: 8px;
			background: rgba(65, 78, 94, 0.2);
			border: 3px solid rgba(220, 229, 238, 0.22);
		}

		.bio-board-viewport::-webkit-scrollbar-track {
			background: rgba(255, 255, 255, 0.08);
		}

		.bio-board-viewport:hover,
		.bio-board-viewport.is-dragging,
		.bio-board-viewport.is-scrolling {
			scrollbar-color: rgba(65, 78, 94, 0.9) rgba(255, 255, 255, 0.38);
		}

		.bio-board-viewport:hover::-webkit-scrollbar-thumb,
		.bio-board-viewport.is-dragging::-webkit-scrollbar-thumb,
		.bio-board-viewport.is-scrolling::-webkit-scrollbar-thumb {
			background: rgba(65, 78, 94, 0.9);
			border-color: rgba(220, 229, 238, 0.9);
		}

		.bio-board-viewport:hover::-webkit-scrollbar-track,
		.bio-board-viewport.is-dragging::-webkit-scrollbar-track,
		.bio-board-viewport.is-scrolling::-webkit-scrollbar-track {
			background: rgba(255, 255, 255, 0.38);
		}

		.bio-board-viewport.is-dragging {
			cursor: grabbing;
		}

		.bio-board-canvas {
			position: relative;
			min-width: 100%;
			min-height: 100%;
		}

		.bio-board {
			position: absolute;
			left: ${BOARD_SIDE_GUTTER + BOARD_INSET}px;
			top: ${BOARD_INSET}px;
			display: grid;
			gap: 0;
			padding: 0;
			background: transparent;
			pointer-events: auto;
			will-change: transform;
			transform-origin: 0 0;
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

		.bio-letter {
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
			font: 800 34px/1 Calibri, Arial, sans-serif;
			color: #101820;
			text-transform: uppercase;
			caret-color: #315c85;
			display: grid;
			place-items: center;
			user-select: none;
			touch-action: none;
		}

		.bio-cell.is-selected {
			box-shadow: inset 0 0 0 4px #315c85;
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
			right: 24px;
			top: 350px;
			width: 99px;
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
			width: 99px;
			height: 99px;
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
			width: 44px;
			height: 44px;
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

		.bio-zoom-controls {
			position: absolute;
			right: 14px;
			bottom: 14px;
			display: flex;
			gap: 8px;
			padding: 8px;
			pointer-events: auto;
			z-index: 30;
		}

		.bio-zoom {
			width: 44px;
			height: 44px;
			border: 0;
			border-radius: 50%;
			cursor: pointer;
			background: rgba(255, 255, 255, 0.92);
			box-shadow: 0 5px 14px rgba(30, 38, 48, 0.22);
			color: #111820;
			font: 900 26px/1 Calibri, Arial, sans-serif;
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

		.bio-keyboard {
			position: fixed;
			left: 0;
			right: 0;
			bottom: 10px;
			z-index: 2147483647;
			display: none;
			justify-content: space-between;
			align-items: flex-end;
			gap: 18px;
			padding: 0 18px;
			background: transparent;
			box-shadow: none;
			pointer-events: none;
			touch-action: manipulation;
		}

		.bio-key-half {
			padding: 8px 10px 10px;
			border-radius: 18px;
			background: rgba(245, 247, 250, 0.72);
			box-shadow: 0 10px 24px rgba(31, 40, 52, 0.14);
			pointer-events: auto;
			backdrop-filter: blur(4px);
		}

		.bio-key-row {
			display: flex;
			justify-content: center;
			gap: 5px;
			margin-top: 5px;
		}

		.bio-key {
			min-width: 44px;
			height: 46px;
			border: 0;
			border-radius: 9px;
			background: #ffffff;
			box-shadow: 0 2px 5px rgba(25, 35, 48, 0.22);
			color: #111820;
			font: 800 24px/1 Calibri, Arial, sans-serif;
		}

		.bio-key-wide {
			min-width: 134px;
			font-size: 21px;
		}

		@media (pointer: coarse), (max-width: 900px) {
			.bio-keyboard.is-open {
				display: flex;
			}
		}

		@media (max-width: 760px) {
			.bio-keyboard {
				padding: 0 8px;
				gap: 8px;
			}

			.bio-key-half {
				padding: 6px;
			}

			.bio-key {
				min-width: 34px;
				height: 40px;
				font-size: 20px;
				border-radius: 8px;
			}

			.bio-key-wide {
				min-width: 104px;
				font-size: 18px;
			}
		}
	`;
	document.head.appendChild(style);
}
