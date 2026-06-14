const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const state = {
  currentQuestion: 0,
  puzzleStage: "moon",
  timerId: null,
  remaining: 30,
  placed: 0,
  dragId: null,
};

const screens = {
  verify: $("#screen-verify"),
  password: $("#screen-password"),
  quizIntro: $("#screen-quiz-intro"),
  quiz: $("#screen-quiz"),
  freeze: $("#screen-freeze"),
  quizEnd: $("#screen-quiz-end"),
  puzzleIntro: $("#screen-puzzle-intro"),
  puzzle: $("#screen-puzzle"),
  puzzleError: $("#screen-puzzle-error"),
  finale: $("#screen-finale"),
  nextPlaceholder: $("#screen-next-placeholder"),
};

// نصوص الاختبار النهائية حسب النسخة التي أرسلها المستخدم.
const questions = [
  {
    text: "متى ناوية تعترفي بحبك لي؟",
    options: [
      { text: "أنت زي أخوي.", correct: false, wrong: "لا لا، هذا الخيار خطر على مستقبل الموقع." },
      { text: "مين قال إني بحبك أصلًا؟", correct: false, wrong: "النظام رفض الإنكار بثقة عالية." },
      { text: "قريبًا حُبي.", correct: true, right: "إجابة صحيحة طبعًا." },
      { text: "مستحيل أعترف.", correct: false, wrong: "مستحيل؟ حتى الزر ما اقتنع." },
    ],
  },
  {
    text: "لو كان عندك زر سحري يحقق أمنية واحدة، شو بتختاري؟",
    options: [
      { text: "نوم طويل بدون إزعاج.", correct: false, wrong: "النوم جميل، بس مش أجمل من الخيار الصح." },
      { text: "تختفي من حياتي يا مريض.", correct: false, wrong: "قاسية شوي، الموقع أخذها على خاطره." },
      { text: "أشوفك وأقضي وقت معك.", correct: true, right: "اختيار منطقي جدًا، لا يحتاج مراجعة." },
      { text: "أنحف لدرجة أختفي.", correct: false, wrong: "مرفوض. الحضور أهم من الاختفاء." },
    ],
  },
  {
    text: "ما أكثر صفة مميزة حبيتيها فيني؟",
    options: [
      { text: "عاق.", correct: false, wrong: "صفة قوية، بس مش هي المطلوبة حاليًا." },
      { text: "مستفز.", correct: false, wrong: "ممكن، لكن خلينا من الصراحة الزائدة." },
      { text: "مريض.", correct: false, wrong: "تشخيص غير معتمد من الموقع." },
      { text: "حنون ولطيف كثير معي.", correct: true, right: "أخيرًا إجابة فيها إنصاف." },
    ],
  },
  {
    text: "هل بتعرفي إنك جميلة؟",
    options: [
      { text: "فلاتر.", correct: false, wrong: "حتى الفلاتر تحتاج إذن منك." },
      { text: "أنت بس بتشوفني هيك.", correct: false, wrong: "المشكلة أن الموقع كمان شايف نفس الشيء." },
      { text: "آه، لأني فعلًا هيك.", correct: true, right: "ثقة في محلها." },
      { text: "مش جميلة.", correct: false, wrong: "هذا الخيار تم حذفه معنويًا قبل الضغط عليه." },
    ],
  },
  {
    text: "هل طبيعي أن أغار عليك من الصغار، خصوصًا إخوان جنى؟",
    options: [
      { text: "جدًا طبيعي لأنك مريض.", correct: false, wrong: "نصفها صحيح، بس مش الإجابة المعتمدة." },
      { text: "جدًا طبيعي، لأنه حتى الصغير آخريته يكبر.", correct: true, right: "بالضبط. رؤية استراتيجية للمستقبل." },
      { text: "مش طبيعي لأنهم صغار.", correct: false, wrong: "الموقع لا يثق بهذا الاطمئنان." },
      { text: "لا، مش طبيعي.", correct: false, wrong: "إجابة عقلانية أكثر من اللازم لهذا الموقع." },
    ],
  },
  {
    text: "لو أنا زعلت منكِ، ما الحل الأفضل؟",
    options: [
      { text: "أزعل أنا كمان وأختفي.", correct: false, wrong: "حل درامي، لكنه يطوّل الحلقة." },
      { text: "أحكيلك: \"مش طبيعي تتحسس على هيك إشي.\"", correct: false, wrong: "هذه العبارة غالبًا تزيد مدة الزعل." },
      { text: "أراضيك بكلام حلو واعتذار لطيف، كالعادة.", correct: true, right: "حل ذكي ومجرّب." },
      { text: "أقولك: \"أنت مكبّر الموضوع.\"", correct: false, wrong: "النظام يتوقع مشكلة أكبر بعد هذا الخيار." },
    ],
  },
  {
    text: "هل طبيعي أنكِ ما زلتِ تشككين بحبي إلك؟",
    options: [
      { text: "لا، بس أنا معاقة عاطفيًا.", correct: true, right: "صراحة نادرة. سيتم تعليق الموقع قليلًا احترامًا للحظة." },
      { text: "ما بشكك، متأكدة إنك ما بتحبني.", correct: false, wrong: "هذه الإجابة سببت ارتفاع حرارة في الخادم." },
      { text: "آه، لأنك أحيانًا بتتغير.", correct: false, wrong: "ملاحظة قيد المراجعة، لكنها ليست الجواب هنا." },
      { text: "آه، حرة.", correct: false, wrong: "حرة طبعًا، بس الخيار غلط." },
    ],
    afterCorrect: "freeze",
  },
  {
    text: "ليش علّق الموقع قبل شوي؟",
    options: [
      { text: "الإنترنت سيئ.", correct: false, wrong: "الإنترنت بريء هذه المرة." },
      { text: "مشكلة في الكود.", correct: false, wrong: "الكود يدافع عن نفسه ويرفض الاتهام." },
      { text: "الحق عليك، عامله بدون نفس.", correct: false, wrong: "اتهام غير لطيف، وسيتم تجاهله بأدب." },
      { text: "انبهر من جمالك.", correct: true, right: "نعم. تفسير تقني دقيق جدًا." },
    ],
  },
  {
    text: "ليش بتكرهيني؟",
    options: [
      { text: "حرة.", correct: false, wrong: "الحرية محفوظة، لكن الجواب غير محفوظ." },
      { text: "لأنك مستفز.", correct: false, wrong: "ممكن أحيانًا، لكن ليس هذا المطلوب." },
      { text: "لأنك مريض ومستفز.", correct: false, wrong: "تم دمج خيارين خاطئين في خيار واحد." },
      { text: "ما بكرهك، ولسا بالسؤال الأول قلتلك إني هعترفلك قريبًا يا حُبي.", correct: true, right: "ذاكرة ممتازة، ومشاعر ممتازة أكثر." },
    ],
  },
  {
    text: "صفة مميزة جدًا فيك أنتِ؟",
    options: [
      { text: "عنيدة.", correct: true, right: "إجابة صحيحة، وكل الخيارات تشهد." },
      { text: "عنيدة.", correct: true, right: "تمام. الموقع ما عنده اعتراض." },
      { text: "عنيدة.", correct: true, right: "واضحة من أول مرة، بس نمشيها." },
      { text: "عنيدة.", correct: true, right: "ختمناها بعناد محترم." },
    ],
  },
];

function switchScreen(screenName) {
  Object.values(screens).forEach(screen => screen.classList.remove("active"));
  screens[screenName].classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function showToast(message, duration = 2100) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), duration);
}

// الصفحة الأولى: شاشة التحقق.
function initializeVerification() {
  const spinner = $("#verify-spinner");
  const title = $("#verify-title");
  const message = $("#verify-message");
  const retry = $("#retry-verify");
  const goPassword = $("#go-password");

  setTimeout(() => {
    spinner.classList.add("hidden");
    title.classList.remove("hidden");
    message.classList.remove("hidden");
    retry.classList.remove("hidden");
  }, 5000);

  retry.addEventListener("click", async () => {
    retry.classList.add("hidden");
    goPassword.classList.add("hidden");
    title.classList.add("hidden");
    message.classList.add("hidden");
    spinner.classList.remove("hidden");

    await wait(2000);

    spinner.classList.add("hidden");
    title.classList.remove("hidden");
    title.textContent = "تعذّر التحقق.";
    message.classList.remove("hidden");
    message.textContent = "عذرًا، لا يمكن للنظام أن يتعامل جيدًا مع هذا القدر من الجمال.";
    goPassword.classList.remove("hidden");
  });

  goPassword.addEventListener("click", () => switchScreen("password"));
}

// الصفحة الثانية: كلمة السر.
function initializePassword() {
  const form = $("#password-form");
  const input = $("#password-input");
  const feedback = $("#password-feedback");

  input.addEventListener("input", () => {
    input.value = input.value.replace(/\D/g, "").slice(0, 6);
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();
    feedback.className = "feedback";

    if (input.value === "230806") {
      feedback.textContent = "تم التحقق بنجاح. أهلًا بفتاتي المميزة جدًا.";
      feedback.classList.add("success");
      await wait(1200);
      switchScreen("quizIntro");
      return;
    }

    feedback.textContent = "كلمة السر غير صحيحة. جرّبي التاريخ الصحيح.";
    feedback.classList.add("error");
    input.classList.remove("shake");
    void input.offsetWidth;
    input.classList.add("shake");
  });
}

// الصفحة الثالثة: الاختبار الفكاهي.
function initializeQuiz() {
  $("#start-quiz").addEventListener("click", () => {
    state.currentQuestion = 0;
    switchScreen("quiz");
    renderQuestion();
  });
}

function renderQuestion() {
  const question = questions[state.currentQuestion];
  const progress = state.currentQuestion + 1;

  $("#quiz-progress").textContent = `السؤال ${progress} من ${questions.length}`;
  $("#progress-bar").style.width = `${(progress / questions.length) * 100}%`;
  $("#question-title").textContent = question.text;
  $("#quiz-feedback").textContent = "";
  $("#quiz-feedback").className = "feedback";

  const answers = $("#answers");
  answers.innerHTML = "";

  question.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.className = "answer-btn";
    button.type = "button";
    button.textContent = option.text;
    button.dataset.index = String(index);
    button.addEventListener("click", () => handleAnswer(option, button, question));
    answers.appendChild(button);
  });
}

async function handleAnswer(option, button, question) {
  const feedback = $("#quiz-feedback");

  if (!option.correct) {
    button.classList.add("wrong");
    feedback.className = "feedback error";
    feedback.textContent = option.wrong;
    await wait(580);
    button.style.visibility = "hidden";
    return;
  }

  $$(".answer-btn").forEach(btn => btn.disabled = true);
  button.classList.add("correct");
  feedback.className = "feedback success";
  feedback.textContent = option.right || "إجابة صحيحة طبعًا.";
  await wait(1150);

  if (question.afterCorrect === "freeze") {
    switchScreen("freeze");
    await wait(6000);
  }

  if (state.currentQuestion < questions.length - 1) {
    state.currentQuestion += 1;
    switchScreen("quiz");
    renderQuestion();
    return;
  }

  switchScreen("quizEnd");
}

// الصفحة الرابعة: لعبة البازل.
function initializePuzzleNavigation() {
  $("#go-puzzle-intro").addEventListener("click", () => switchScreen("puzzleIntro"));
  $("#start-puzzle").addEventListener("click", () => startPuzzle("moon"));
  $("#restart-puzzle").addEventListener("click", () => startPuzzle("her"));
  $("#go-next-placeholder").addEventListener("click", () => switchScreen("nextPlaceholder"));
  $("#back-to-start").addEventListener("click", () => location.reload());
}

function getPuzzleConfig(stage) {
  if (stage === "moon") {
    return {
      stageLabel: "المرحلة الأولى: بازل القمر",
      title: "آر يو ريدي فور بازل قيم؟",
      subtitle: "رتّبي صورة القمر خلال 30 ثانية، أو ما في مفاجأة.",
      image: "assets/images/moon-puzzle.svg",
      timer: true,
    };
  }

  return {
    stageLabel: "المرحلة الثانية: بازل صورتها",
    title: "حسنًا... الآن الصورة الصحيحة.",
    subtitle: "بعينك الله، ارجعي ركّبي القطع كمان مرة، ويمكن تفهمي ليش خسئ القمر.",
    image: "assets/images/her-puzzle.svg",
    timer: false,
  };
}

function startPuzzle(stage) {
  state.puzzleStage = stage;
  state.placed = 0;
  clearInterval(state.timerId);

  const config = getPuzzleConfig(stage);
  $("#puzzle-stage").textContent = config.stageLabel;
  $("#puzzle-title").textContent = config.title;
  $("#puzzle-subtitle").textContent = config.subtitle;
  $("#puzzle-feedback").textContent = "";
  $("#puzzle-feedback").className = "feedback";
  $("#timer-wrap").classList.toggle("hidden", !config.timer);
  $("#timer-wrap").classList.remove("warning");
  $("#timer").textContent = "30";

  buildPuzzle(config.image);
  switchScreen("puzzle");

  if (config.timer) startTimer();
}

function buildPuzzle(imageUrl) {
  const board = $("#puzzle-board");
  const tray = $("#pieces-tray");
  board.innerHTML = "";
  tray.innerHTML = "";

  for (let i = 0; i < 4; i += 1) {
    const zone = document.createElement("div");
    zone.className = "dropzone";
    zone.dataset.slot = String(i);
    zone.addEventListener("dragover", handleDragOver);
    zone.addEventListener("dragleave", () => zone.classList.remove("hover"));
    zone.addEventListener("drop", handleDrop);
    board.appendChild(zone);
  }

  shuffle([0, 1, 2, 3]).forEach(index => {
    const piece = createPiece(index, imageUrl);
    tray.appendChild(piece);
  });
}

function createPiece(index, imageUrl) {
  const piece = document.createElement("div");
  piece.className = "piece";
  piece.draggable = true;
  piece.dataset.piece = String(index);
  piece.style.backgroundImage = `url("${imageUrl}")`;
  piece.style.backgroundPosition = backgroundPositionFor(index);
  piece.setAttribute("role", "button");
  piece.setAttribute("aria-label", `قطعة بازل رقم ${index + 1}`);

  piece.addEventListener("dragstart", event => {
    state.dragId = piece.dataset.piece;
    piece.classList.add("dragging");
    event.dataTransfer.setData("text/plain", piece.dataset.piece);
    event.dataTransfer.effectAllowed = "move";
  });

  piece.addEventListener("dragend", () => piece.classList.remove("dragging"));
  piece.addEventListener("pointerdown", startPointerDrag);

  return piece;
}

function backgroundPositionFor(index) {
  // ترتيب منطقي من اليمين إلى اليسار: أعلى يمين، أعلى يسار، أسفل يمين، أسفل يسار.
  const positions = ["100% 0%", "0% 0%", "100% 100%", "0% 100%"];
  return positions[index];
}

function handleDragOver(event) {
  event.preventDefault();
  if (!event.currentTarget.classList.contains("locked")) {
    event.currentTarget.classList.add("hover");
  }
}

function handleDrop(event) {
  event.preventDefault();
  const zone = event.currentTarget;
  zone.classList.remove("hover");
  if (zone.classList.contains("locked")) return;

  const pieceId = event.dataTransfer.getData("text/plain") || state.dragId;
  const piece = $(`.piece[data-piece="${pieceId}"]`);
  tryPlacePiece(piece, zone);
}

function tryPlacePiece(piece, zone) {
  if (!piece || !zone || zone.classList.contains("locked")) return;

  if (piece.dataset.piece === zone.dataset.slot) {
    piece.classList.remove("dragging");
    piece.classList.add("locked");
    piece.draggable = false;
    zone.classList.add("locked");
    zone.appendChild(piece);
    state.placed += 1;
    $("#puzzle-feedback").className = "feedback success";
    $("#puzzle-feedback").textContent = "تمام، القطعة في مكانها.";

    if (state.placed === 4) completePuzzle();
    return;
  }

  $("#puzzle-feedback").className = "feedback error";
  $("#puzzle-feedback").textContent = "قريبة، بس مش هون مكانها.";
  showToast("القطعة رجعت لأنها في المكان الخطأ.");
  piece.classList.remove("dragging");
}

function startPointerDrag(event) {
  const piece = event.currentTarget;
  if (piece.classList.contains("locked")) return;
  event.preventDefault();

  const rect = piece.getBoundingClientRect();
  const clone = piece.cloneNode(true);
  clone.classList.add("dragging");
  clone.style.position = "fixed";
  clone.style.width = `${rect.width}px`;
  clone.style.height = `${rect.height}px`;
  clone.style.left = `${rect.left}px`;
  clone.style.top = `${rect.top}px`;
  clone.style.pointerEvents = "none";
  clone.style.zIndex = "80";
  document.body.appendChild(clone);
  piece.style.opacity = ".35";

  const offsetX = event.clientX - rect.left;
  const offsetY = event.clientY - rect.top;

  const move = pointerEvent => {
    clone.style.left = `${pointerEvent.clientX - offsetX}px`;
    clone.style.top = `${pointerEvent.clientY - offsetY}px`;
    const el = document.elementFromPoint(pointerEvent.clientX, pointerEvent.clientY);
    $$(".dropzone").forEach(zone => zone.classList.remove("hover"));
    const zone = el?.closest?.(".dropzone");
    if (zone && !zone.classList.contains("locked")) zone.classList.add("hover");
  };

  const up = pointerEvent => {
    document.removeEventListener("pointermove", move);
    document.removeEventListener("pointerup", up);
    const el = document.elementFromPoint(pointerEvent.clientX, pointerEvent.clientY);
    const zone = el?.closest?.(".dropzone");
    $$(".dropzone").forEach(z => z.classList.remove("hover"));
    clone.remove();
    piece.style.opacity = "";
    tryPlacePiece(piece, zone);
  };

  document.addEventListener("pointermove", move);
  document.addEventListener("pointerup", up, { once: true });
}

function startTimer() {
  state.remaining = 30;
  $("#timer").textContent = String(state.remaining);
  clearInterval(state.timerId);

  state.timerId = setInterval(() => {
    state.remaining -= 1;
    $("#timer").textContent = String(state.remaining);
    $("#timer-wrap").classList.toggle("warning", state.remaining <= 7);

    if (state.remaining <= 0) {
      clearInterval(state.timerId);
      showToast("انتهى الوقت. سنعيد بازل القمر من البداية.", 2600);
      startPuzzle("moon");
    }
  }, 1000);
}

async function completePuzzle() {
  clearInterval(state.timerId);
  $("#puzzle-feedback").className = "feedback success";

  if (state.puzzleStage === "moon") {
    $("#puzzle-feedback").textContent = "اكتملت صورة القمر... أو هكذا يظن القمر.";
    await wait(900);
    document.body.classList.add("shake");
    await wait(540);
    document.body.classList.remove("shake");
    await scatterPieces();
    switchScreen("puzzleError");
    return;
  }

  $("#puzzle-feedback").textContent = "اكتملت الصورة الصحيحة.";
  await wait(900);
  switchScreen("finale");
  createStars();
}

function scatterPieces() {
  return new Promise(resolve => {
    const pieces = $$(".piece.locked");
    pieces.forEach((piece, index) => {
      piece.style.setProperty("--fly-x", `${index % 2 === 0 ? -120 : 130}px`);
      piece.style.setProperty("--fly-y", `${index < 2 ? -90 : 120}px`);
      piece.style.setProperty("--fly-rot", `${index % 2 === 0 ? -18 : 21}deg`);
      piece.classList.add("fly-away");
    });
    setTimeout(resolve, 940);
  });
}

function createStars() {
  const finale = $("#screen-finale .card");
  $$(".star", finale).forEach(star => star.remove());

  for (let i = 0; i < 18; i += 1) {
    const star = document.createElement("span");
    star.className = "star";
    star.textContent = "✦";
    star.style.position = "absolute";
    star.style.left = `${8 + Math.random() * 84}%`;
    star.style.top = `${8 + Math.random() * 84}%`;
    star.style.color = i % 2 ? "var(--primary)" : "var(--accent)";
    star.style.opacity = ".72";
    star.style.animation = `pulse ${1.2 + Math.random() * 1.8}s ease-in-out infinite`;
    finale.appendChild(star);
  }
}

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

initializeVerification();
initializePassword();
initializeQuiz();
initializePuzzleNavigation();
