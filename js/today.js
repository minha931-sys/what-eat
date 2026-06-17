const todaySurveyEl = document.querySelector("#todaySurvey");
const todayRecommendBtnEl = document.querySelector("#todayRecommendBtn");
const todayResetBtnEl = document.querySelector("#todayResetBtn");
const todaySelectedCountEl = document.querySelector("#todaySelectedCount");
const todayResultCountEl = document.querySelector("#todayResultCount");
const todayResultLabelEl = document.querySelector("#todayResultLabel");
const todayResultsEl = document.querySelector("#todayResults");
const todayEmptyEl = document.querySelector("#todayEmpty");
const todayRecipeModalEl = document.querySelector("#todayRecipeModal");
const todayModalContentEl = document.querySelector("#todayModalContent");
const todayModalCloseBtnEl = document.querySelector("#todayModalCloseBtn");

const todayOptions = {
  mealTime: [
    { value: "breakfast", label: "아침" },
    { value: "lunch", label: "점심" },
    { value: "dinner", label: "저녁" },
    { value: "lateNight", label: "야식" }
  ],
  mood: [
    { value: "hearty", label: "든든하게" },
    { value: "light", label: "가볍게" },
    { value: "spicy", label: "매콤하게" },
    { value: "homey", label: "집밥처럼" },
    { value: "snack", label: "술안주처럼" }
  ],
  condition: [
    { value: "tenMinute", label: "10분 이내" },
    { value: "noFire", label: "불 안 씀" },
    { value: "microwave", label: "전자레인지 가능" },
    { value: "oneBowl", label: "한 그릇" }
  ],
  recipeType: [
    { value: "all", label: "상관없음" },
    { value: "덮밥/밥", label: "밥" },
    { value: "볶음밥", label: "볶음밥" },
    { value: "국/찌개", label: "국/찌개" },
    { value: "면/파스타", label: "면" },
    { value: "볶음/조림", label: "볶음/조림" },
    { value: "구이/부침", label: "구이/부침" },
    { value: "토스트/빵", label: "토스트/간식" }
  ],
  calorie: [
    { value: "all", label: "상관없음" },
    { value: "light", label: "가볍게" },
    { value: "normal", label: "보통" },
    { value: "heavy", label: "든든하게" }
  ]
};

const todayState = {
  mealTime: "",
  mood: "",
  condition: "",
  recipeType: "all",
  calorie: "all"
};

document.addEventListener("DOMContentLoaded", () => {
  renderTodaySurvey();
  updateTodaySummary();
  todaySurveyEl.addEventListener("click", handleSurveyClick);
  todayRecommendBtnEl.addEventListener("click", recommendTodayMenu);
  todayResetBtnEl.addEventListener("click", resetTodayMenu);
  todayResultsEl.addEventListener("click", handleTodayDetailClick);
  todayModalCloseBtnEl.addEventListener("click", closeTodayModal);
  todayRecipeModalEl.addEventListener("click", (event) => {
    if (event.target === todayRecipeModalEl) {
      closeTodayModal();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !todayRecipeModalEl.hidden) {
      closeTodayModal();
    }
  });
});

function renderTodaySurvey() {
  Object.entries(todayOptions).forEach(([groupName, options]) => {
    const groupEl = todaySurveyEl.querySelector(`[data-group="${groupName}"]`);

    if (!groupEl) {
      return;
    }

    groupEl.innerHTML = options.map((option) => `
      <button
        class="chip today-chip${todayState[groupName] === option.value ? " is-selected" : ""}"
        type="button"
        data-group="${groupName}"
        data-value="${option.value}"
        aria-pressed="${todayState[groupName] === option.value}"
      >${option.label}</button>
    `).join("");
  });
}

function handleSurveyClick(event) {
  const button = event.target.closest("[data-group][data-value]");

  if (!button) {
    return;
  }

  const { group, value } = button.dataset;
  todayState[group] = todayState[group] === value ? (group === "recipeType" || group === "calorie" ? "all" : "") : value;
  renderTodaySurvey();
  updateTodaySummary();
}

function updateTodaySummary() {
  const selectedCount = Object.values(todayState).filter((value) => value && value !== "all").length;
  todaySelectedCountEl.textContent = `${selectedCount}개`;
}

function recommendTodayMenu() {
  const scored = recipeData
    .map((recipe) => scoreRecipe(recipe))
    .sort((a, b) => b.score - a.score || a.recipe.time - b.recipe.time || a.recipe.name.localeCompare(b.recipe.name, "ko"));
  const matches = scored.filter((item) => item.score > 0);
  const displayItems = matches.length > 0
    ? [...matches, ...scored.filter((item) => item.score === 0)].slice(0, 3)
    : scored.slice(0, 3);

  todayResultCountEl.textContent = `${displayItems.length}개`;
  todayResultLabelEl.textContent = displayItems.length;
  todayEmptyEl.hidden = !(matches.length === 0 && hasAnySelection());
  todayResultsEl.innerHTML = displayItems.map(renderTodayCard).join("");

  if (matches.length === 0) {
    todayEmptyEl.textContent = "조건이 조금 빡빡해서 비슷한 메뉴도 함께 보여드려요.";
  } else {
    todayEmptyEl.textContent = "조건을 고른 뒤 메뉴 추천받기를 눌러보세요.";
  }
}

function hasAnySelection() {
  return Object.entries(todayState).some(([, value]) => value && value !== "all");
}

function scoreRecipe(recipe) {
  const reasons = [];
  let score = 0;

  if (todayState.mealTime) {
    const timeMatch = matchMealTime(recipe, todayState.mealTime);
    if (timeMatch.score > 0) {
      score += timeMatch.score;
      reasons.push(timeMatch.reason);
    }
  }

  if (todayState.mood) {
    const moodMatch = matchMood(recipe, todayState.mood);
    if (moodMatch.score > 0) {
      score += moodMatch.score;
      reasons.push(moodMatch.reason);
    }
  }

  if (todayState.condition) {
    const conditionMatch = matchCondition(recipe, todayState.condition);
    if (conditionMatch.score > 0) {
      score += conditionMatch.score;
      reasons.push(conditionMatch.reason);
    }
  }

  if (todayState.recipeType !== "all") {
    const recipeType = getRecipeType(recipe);
    if (recipeType === todayState.recipeType) {
      score += 4;
      reasons.push(`${recipeType} 타입`);
    }
  }

  if (todayState.calorie !== "all") {
    const calorieMatch = matchCalorie(recipe, todayState.calorie);
    if (calorieMatch.score > 0) {
      score += calorieMatch.score;
      reasons.push(calorieMatch.reason);
    }
  }

  if (score === 0 && !hasAnySelection()) {
    score = 1;
  }

  return { recipe, score, reasons: [...new Set(reasons)].slice(0, 3) };
}

function matchMealTime(recipe, value) {
  const name = recipe.name;
  const tags = recipe.tags || [];
  const type = getRecipeType(recipe);

  if (value === "breakfast") {
    if (tags.includes("아침식사") || /계란|토스트|샌드위치|국|죽|샐러드/.test(name) || ["토스트/빵", "샐러드/무침", "국/찌개"].includes(type)) {
      return { score: 5, reason: "아침에 잘 맞는 메뉴" };
    }
    if (recipe.time <= 10) {
      return { score: 2, reason: "빠르게 먹기 좋음" };
    }
  }

  if (value === "lunch") {
    if (tags.includes("한그릇") || /덮밥|볶음밥|국수|라면|파스타|카레/.test(name) || ["덮밥/밥", "볶음밥", "면/파스타"].includes(type)) {
      return { score: 5, reason: "점심에 든든한 한 끼" };
    }
    if (recipe.time <= 25) {
      return { score: 2, reason: "점심시간에 부담이 적음" };
    }
  }

  if (value === "dinner") {
    if (tags.includes("집밥") || /찌개|조림|찜|볶음|구이|무국|갈비|불고기/.test(name) || ["국/찌개", "볶음/조림", "구이/부침"].includes(type)) {
      return { score: 5, reason: "저녁 집밥 느낌" };
    }
    if (recipe.calories >= 500) {
      return { score: 2, reason: "저녁에 든든함" };
    }
  }

  if (value === "lateNight") {
    if (tags.includes("야식") || tags.includes("술안주") || /라면|비빔면|치즈|볶음|구이|토스트|삼겹살/.test(name) || ["면/파스타", "볶음/조림", "구이/부침", "토스트/빵"].includes(type)) {
      return { score: 5, reason: "야식으로 잘 어울림" };
    }
    if (recipe.time <= 15) {
      return { score: 2, reason: "늦은 시간에 빠름" };
    }
  }

  return { score: 0, reason: "" };
}

function matchMood(recipe, value) {
  const name = recipe.name;
  const tags = recipe.tags || [];

  if (value === "hearty") {
    if (recipe.calories >= 600 || /덮밥|찌개|볶음|갈비|불고기|제육|카레/.test(name)) {
      return { score: 4, reason: "든든하게 먹기 좋음" };
    }
  }

  if (value === "light") {
    if (recipe.calories <= 450 || /샐러드|국|두부|계란|토스트/.test(name)) {
      return { score: 4, reason: "가볍게 먹기 좋음" };
    }
  }

  if (value === "spicy") {
    if (tags.includes("술안주") || /김치|고추장|매콤|제육|볶음|찌개/.test(name)) {
      return { score: 4, reason: "매콤한 맛이 잘 맞음" };
    }
  }

  if (value === "homey") {
    if (tags.includes("집밥") || ["국/찌개", "볶음/조림", "구이/부침"].includes(getRecipeType(recipe))) {
      return { score: 4, reason: "집밥 느낌이 강함" };
    }
  }

  if (value === "snack") {
    if (tags.includes("술안주") || ["구이/부침", "볶음/조림"].includes(getRecipeType(recipe))) {
      return { score: 4, reason: "안주처럼 먹기 좋음" };
    }
  }

  return { score: 0, reason: "" };
}

function matchCondition(recipe, value) {
  const tags = recipe.tags || [];
  const tools = recipe.tools || [];

  if (value === "tenMinute" && (recipe.time <= 10 || tags.includes("10분이내"))) {
    return { score: 4, reason: "10분 안에 가능" };
  }

  if (value === "noFire" && tags.includes("불안씀")) {
    return { score: 4, reason: "불을 쓰지 않음" };
  }

  if (value === "microwave" && (tags.includes("전자레인지가능") || tools.includes("전자레인지"))) {
    return { score: 4, reason: "전자레인지로 가능" };
  }

  if (value === "oneBowl" && tags.includes("한그릇")) {
    return { score: 4, reason: "한 그릇으로 끝남" };
  }

  return { score: 0, reason: "" };
}

function matchCalorie(recipe, value) {
  if (value === "light" && recipe.calories <= 450) {
    return { score: 3, reason: "가벼운 칼로리" };
  }

  if (value === "normal" && recipe.calories > 450 && recipe.calories < 650) {
    return { score: 3, reason: "보통 칼로리" };
  }

  if (value === "heavy" && recipe.calories >= 650) {
    return { score: 3, reason: "든든한 칼로리" };
  }

  return { score: 0, reason: "" };
}

function renderTodayCard(item) {
  const { recipe, score, reasons } = item;
  const type = getRecipeType(recipe);

  return `
    <article class="recipe-card today-card">
      <div class="recipe-top">
        <h3>${recipe.name}</h3>
        <span class="badge ready">${score}점</span>
      </div>
      <div class="meta-list">
        <span>${type}</span>
        <span>${recipe.time}분</span>
        <span>약 ${recipe.calories}kcal</span>
      </div>
      <div class="recipe-detail">
        <p><strong>추천 이유</strong> ${reasons.join(", ") || "현재 선택과 잘 맞는 메뉴"}</p>
        <p><strong>필수 재료</strong> ${recipe.ingredients.join(", ")}</p>
        <div class="button-cloud">${recipe.tags.map((tag) => `<span class="tag">#${tag}</span>`).join("")}</div>
        <button class="utility-button recipe-detail-button" type="button" data-today-recipe-id="${recipe.id}">상세 보기</button>
      </div>
    </article>
  `;
}

function handleTodayDetailClick(event) {
  const button = event.target.closest("[data-today-recipe-id]");

  if (button) {
    openTodayModal(button.dataset.todayRecipeId);
  }
}

function openTodayModal(recipeId) {
  const recipe = recipeData.find((item) => item.id === recipeId);

  if (!recipe) {
    return;
  }

  todayModalContentEl.innerHTML = `
    <div class="modal-recipe-head">
      <span class="eyebrow">${getRecipeType(recipe)}</span>
      <h2 id="todayModalTitle">${recipe.name}</h2>
      <div class="meta-list">
        <span>${recipe.time}분</span>
        <span>약 ${recipe.calories}kcal</span>
        <span>${recipe.difficulty}</span>
        <span>설거지 ${recipe.dishLevel}</span>
      </div>
    </div>
    <div class="recipe-detail modal-recipe-detail">
      <p><strong>필수 재료</strong> ${recipe.ingredients.join(", ")}</p>
      <p><strong>선택 재료</strong> ${recipe.optional.join(", ") || "없음"}</p>
      <p><strong>사용 도구</strong> ${recipe.tools.join(", ")}</p>
      <div class="button-cloud">${recipe.tags.map((tag) => `<span class="tag">#${tag}</span>`).join("")}</div>
      <div>
        <strong>조리법</strong>
        <ol class="steps">
          ${recipe.steps.map((step) => `<li>${step}</li>`).join("")}
        </ol>
      </div>
    </div>
  `;

  todayRecipeModalEl.hidden = false;
  document.body.classList.add("is-modal-open");
  todayModalCloseBtnEl.focus();
}

function closeTodayModal() {
  todayRecipeModalEl.hidden = true;
  document.body.classList.remove("is-modal-open");
}

function resetTodayMenu() {
  todayState.mealTime = "";
  todayState.mood = "";
  todayState.condition = "";
  todayState.recipeType = "all";
  todayState.calorie = "all";
  renderTodaySurvey();
  updateTodaySummary();
  todayResultCountEl.textContent = "0개";
  todayResultLabelEl.textContent = "0";
  todayResultsEl.innerHTML = "";
  todayEmptyEl.hidden = false;
  todayEmptyEl.textContent = "조건을 고른 뒤 메뉴 추천받기를 눌러보세요.";
}
