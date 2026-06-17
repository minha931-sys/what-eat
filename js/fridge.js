const storageKey = "whateat-selected-ingredients";
const legacyStorageKey = "naengteol-selected-ingredients";

const ingredientGroups = [
  {
    title: "기본 재료",
    items: ["밥", "냉동밥", "라면", "국수", "파스타면", "계란", "김치", "두부", "순두부", "참치캔", "고등어캔", "꽁치캔", "골뱅이캔", "스팸", "햄", "소시지", "식빵", "또띠아", "떡", "만두", "우유", "치즈", "피자치즈", "김", "미역", "버터"]
  },
  {
    title: "채소",
    items: ["양파", "대파", "마늘", "감자", "고구마", "당근", "무", "양배추", "애호박", "버섯", "콩나물", "숙주", "상추", "깻잎", "오이", "토마토", "시금치", "브로콜리", "파프리카", "부추", "청양고추"]
  },
  {
    title: "육류/해산물",
    items: ["삼겹살", "대패삼겹살", "목살", "돼지고기", "앞다리살", "돼지갈비", "소고기", "차돌박이", "우삼겹", "다짐육", "닭고기", "닭다리살", "닭안심", "고등어", "갈치", "오징어"]
  },
  {
    title: "양념",
    items: ["간장", "고추장", "된장", "쌈장", "카레가루", "부침가루", "설탕", "소금", "후추", "식용유", "참기름", "마요네즈", "케첩", "머스타드", "칠리소스", "토마토소스", "굴소스", "고춧가루", "식초", "물엿", "깨"]
  },
  {
    title: "냉동/가공식품",
    items: ["냉동만두", "냉동새우", "냉동감자", "베이컨", "어묵", "맛살", "닭가슴살", "훈제오리", "냉동치킨", "냉동볶음밥", "옥수수콘", "콩"]
  }
];

const filters = [
  { label: "10분 이내", tag: "10분이내" },
  { label: "불 안 씀", tag: "불안씀" },
  { label: "전자레인지 가능", tag: "전자레인지가능" },
  { label: "설거지 적음", tag: "설거지적음" },
  { label: "한 그릇 요리", tag: "한그릇" },
  { label: "야식", tag: "야식" },
  { label: "아침식사", tag: "아침식사" },
  { label: "술안주", tag: "술안주" },
  { label: "초보자 가능", tag: "초보자가능" }
];

const calorieFilters = [
  { label: "300kcal 이하", value: "under300", test: (recipe) => recipe.calories <= 300 },
  { label: "500kcal 이하", value: "under500", test: (recipe) => recipe.calories <= 500 },
  { label: "든든한 메뉴", value: "hearty", test: (recipe) => recipe.calories >= 600 }
];

const recipeTypeFilters = recipeTypeOrder.map((type) => ({ label: type, value: type }));
const selectedIngredients = new Set(loadSavedIngredients());
const selectedFilters = new Set();
const collapsedGroups = new Set();
let selectedCalorieFilter = "";
let selectedRecipeType = "all";
let selectedSort = "default";
let ingredientSearchQuery = "";
let isShoppingListVisible = false;

const ingredientAliasGroups = [
  ["밥", "냉동밥"],
  ["만두", "냉동만두"],
  ["치즈", "피자치즈"],
  ["햄", "스팸"],
  ["토마토소스", "케첩"],
  ["고추장", "쌈장"],
  ["설탕", "물엿"],
  ["참기름", "식용유"]
];

const ingredientAliases = ingredientAliasGroups.reduce((aliases, group) => {
  group.forEach((ingredient) => {
    aliases[ingredient] = [
      ...(aliases[ingredient] || []),
      ...group.filter((alias) => alias !== ingredient)
    ];
  });

  return aliases;
}, {});

const ingredientGroupsEl = document.querySelector("#ingredientGroups");
const filterButtonsEl = document.querySelector("#filterButtons");
const calorieFilterButtonsEl = document.querySelector("#calorieFilterButtons");
const recipeTypeButtonsEl = document.querySelector("#recipeTypeButtons");
const sortSelectEl = document.querySelector("#sortSelect");
const selectedCountEl = document.querySelector("#selectedCount");
const readyCountEl = document.querySelector("#readyCount");
const almostCountEl = document.querySelector("#almostCount");
const readyLabelEl = document.querySelector("#readyLabel");
const almostLabelEl = document.querySelector("#almostLabel");
const readyResultsEl = document.querySelector("#readyResults");
const almostResultsEl = document.querySelector("#almostResults");
const emptyMessageEl = document.querySelector("#emptyMessage");
const ingredientSearchEl = document.querySelector("#ingredientSearch");
const selectedInlineCountEl = document.querySelector("#selectedInlineCount");
const selectedIngredientListEl = document.querySelector("#selectedIngredientList");
const selectedEmptyTextEl = document.querySelector("#selectedEmptyText");
const shoppingListPanelEl = document.querySelector("#shoppingListPanel");
const shoppingListCountEl = document.querySelector("#shoppingListCount");
const shoppingListEl = document.querySelector("#shoppingList");
const shoppingRecommendBtnEl = document.querySelector("#shoppingRecommendBtn");
const recipeModalEl = document.querySelector("#recipeModal");
const modalRecipeContentEl = document.querySelector("#modalRecipeContent");
const modalCloseBtnEl = document.querySelector("#modalCloseBtn");

document.addEventListener("DOMContentLoaded", () => {
  renderIngredientButtons();
  renderSelectedIngredients();
  renderFilterButtons();
  renderCalorieFilterButtons();
  renderRecipeTypeButtons();
  bindFridgeActions();
  updateResults();
});

function loadSavedIngredients() {
  try {
    const savedIngredients = localStorage.getItem(storageKey) || localStorage.getItem(legacyStorageKey);

    return (JSON.parse(savedIngredients) || [])
      .filter((ingredient) => !["물", "냉동야채"].includes(ingredient));
  } catch (error) {
    return [];
  }
}

function saveIngredients() {
  localStorage.setItem(storageKey, JSON.stringify([...selectedIngredients]));
  localStorage.removeItem(legacyStorageKey);
}

function renderIngredientButtons() {
  ingredientGroupsEl.innerHTML = ingredientGroups.map((group) => `
    ${renderIngredientGroup(group)}
  `).join("");

  ingredientGroupsEl.querySelectorAll("[data-ingredient]").forEach((button) => {
    button.addEventListener("click", () => toggleIngredient(button.dataset.ingredient, button));
  });

  ingredientGroupsEl.querySelectorAll("[data-toggle-group]").forEach((button) => {
    button.addEventListener("click", () => toggleIngredientGroup(button.dataset.toggleGroup));
  });
}

function renderIngredientGroup(group) {
  const query = ingredientSearchQuery.trim().toLowerCase();
  const filteredItems = query
    ? group.items.filter((item) => item.toLowerCase().includes(query))
    : group.items;
  const isCollapsed = collapsedGroups.has(group.title) && query === "";

  if (filteredItems.length === 0) {
    return "";
  }

  return `
    <article class="ingredient-group${isCollapsed ? " is-collapsed" : ""}">
      <button
        class="group-toggle"
        type="button"
        data-toggle-group="${group.title}"
        aria-expanded="${!isCollapsed}"
      >
        <span>${group.title}</span>
        <b>${filteredItems.length}개</b>
      </button>
      <div class="button-cloud">
        ${filteredItems.map((item) => `
          <button
            class="chip ingredient-chip${selectedIngredients.has(item) ? " is-selected" : ""}"
            type="button"
            data-ingredient="${item}"
            aria-pressed="${selectedIngredients.has(item)}"
          >${item}</button>
        `).join("")}
      </div>
    </article>
  `;
}

function toggleIngredientGroup(title) {
  if (collapsedGroups.has(title)) {
    collapsedGroups.delete(title);
  } else {
    collapsedGroups.add(title);
  }

  renderIngredientButtons();
}

function renderFilterButtons() {
  filterButtonsEl.innerHTML = filters.map((filter) => `
    <button
      class="chip filter-chip"
      type="button"
      data-filter="${filter.tag}"
      aria-pressed="false"
    >${filter.label}</button>
  `).join("");

  filterButtonsEl.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => toggleFilter(button.dataset.filter, button));
  });
}

function renderCalorieFilterButtons() {
  calorieFilterButtonsEl.innerHTML = calorieFilters.map((filter) => `
    <button
      class="chip calorie-chip"
      type="button"
      data-calorie-filter="${filter.value}"
      aria-pressed="false"
    >${filter.label}</button>
  `).join("");

  calorieFilterButtonsEl.querySelectorAll("[data-calorie-filter]").forEach((button) => {
    button.addEventListener("click", () => toggleCalorieFilter(button.dataset.calorieFilter));
  });
}

function renderRecipeTypeButtons() {
  recipeTypeButtonsEl.innerHTML = [
    `<button class="chip type-chip is-selected" type="button" data-recipe-type="all" aria-pressed="true">전체</button>`,
    ...recipeTypeFilters.map((filter) => `
      <button
        class="chip type-chip"
        type="button"
        data-recipe-type="${filter.value}"
        aria-pressed="false"
      >${filter.label}</button>
    `)
  ].join("");

  recipeTypeButtonsEl.querySelectorAll("[data-recipe-type]").forEach((button) => {
    button.addEventListener("click", () => toggleRecipeType(button.dataset.recipeType));
  });
}

function bindFridgeActions() {
  ingredientSearchEl.addEventListener("input", () => {
    ingredientSearchQuery = ingredientSearchEl.value;
    renderIngredientButtons();
  });
  selectedIngredientListEl.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-remove-ingredient]");

    if (removeButton) {
      removeIngredient(removeButton.dataset.removeIngredient);
    }
  });
  document.querySelector("#resetBtn").addEventListener("click", confirmResetSelections);
  document.querySelector("#viewResultsBtn").addEventListener("click", () => {
    isShoppingListVisible = false;
    updateResults();
    document.querySelector("#results").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  shoppingRecommendBtnEl.addEventListener("click", () => {
    isShoppingListVisible = true;
    updateResults();
    shoppingListPanelEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
  sortSelectEl.addEventListener("change", () => {
    selectedSort = sortSelectEl.value;
    isShoppingListVisible = false;
    updateResults();
  });
  shoppingListEl.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-add-ingredient]");

    if (addButton) {
      addIngredient(addButton.dataset.addIngredient);
    }
  });
  readyResultsEl.addEventListener("click", handleRecipeDetailClick);
  almostResultsEl.addEventListener("click", handleRecipeDetailClick);
  modalCloseBtnEl.addEventListener("click", closeRecipeModal);
  recipeModalEl.addEventListener("click", (event) => {
    if (event.target === recipeModalEl) {
      closeRecipeModal();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !recipeModalEl.hidden) {
      closeRecipeModal();
    }
  });
}

function toggleIngredient(ingredient, button) {
  if (selectedIngredients.has(ingredient)) {
    selectedIngredients.delete(ingredient);
  } else {
    selectedIngredients.add(ingredient);
  }

  isShoppingListVisible = false;
  button.classList.toggle("is-selected", selectedIngredients.has(ingredient));
  button.setAttribute("aria-pressed", String(selectedIngredients.has(ingredient)));
  saveIngredients();
  renderSelectedIngredients();
  updateResults();
}

function removeIngredient(ingredient) {
  selectedIngredients.delete(ingredient);
  isShoppingListVisible = false;
  saveIngredients();
  renderSelectedIngredients();
  renderIngredientButtons();
  updateResults();
}

function addIngredient(ingredient) {
  selectedIngredients.add(ingredient);
  isShoppingListVisible = false;
  saveIngredients();
  renderSelectedIngredients();
  renderIngredientButtons();
  updateResults();
}

function renderSelectedIngredients() {
  const ingredients = [...selectedIngredients].sort((a, b) => a.localeCompare(b, "ko"));

  selectedInlineCountEl.textContent = `${ingredients.length}개`;
  selectedEmptyTextEl.hidden = ingredients.length > 0;
  selectedIngredientListEl.innerHTML = ingredients.map((ingredient) => `
    <button class="selected-chip" type="button" data-remove-ingredient="${ingredient}" aria-label="${ingredient} 선택 해제">
      <span>${ingredient}</span>
      <b aria-hidden="true">×</b>
    </button>
  `).join("");
}

function toggleFilter(tag, button) {
  if (selectedFilters.has(tag)) {
    selectedFilters.delete(tag);
  } else {
    selectedFilters.add(tag);
  }

  isShoppingListVisible = false;
  button.classList.toggle("is-selected", selectedFilters.has(tag));
  button.setAttribute("aria-pressed", String(selectedFilters.has(tag)));
  updateResults();
}

function toggleCalorieFilter(value) {
  selectedCalorieFilter = selectedCalorieFilter !== value ? value : "";
  isShoppingListVisible = false;

  calorieFilterButtonsEl.querySelectorAll("[data-calorie-filter]").forEach((button) => {
    const isSelected = button.dataset.calorieFilter === selectedCalorieFilter;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });

  updateResults();
}

function toggleRecipeType(value) {
  selectedRecipeType = selectedRecipeType === value ? "all" : value;
  isShoppingListVisible = false;

  recipeTypeButtonsEl.querySelectorAll("[data-recipe-type]").forEach((button) => {
    const isSelected = button.dataset.recipeType === selectedRecipeType;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });

  updateResults();
}

function getMatches() {
  if (selectedIngredients.size === 0) {
    return { ready: [], almost: [] };
  }

  const activeFilters = [...selectedFilters];
  const calorieFilter = calorieFilters.find((filter) => filter.value === selectedCalorieFilter);
  const matches = recipeData
    .filter((recipe) => activeFilters.every((filter) => recipe.tags.includes(filter)))
    .filter((recipe) => !calorieFilter || calorieFilter.test(recipe))
    .filter((recipe) => selectedRecipeType === "all" || getRecipeType(recipe) === selectedRecipeType)
    .map((recipe) => {
      const missing = recipe.ingredients.filter((ingredient) => !hasIngredient(ingredient));
      return {
        recipe,
        missing,
        status: missing.length === 0 ? "ready" : "almost"
      };
    })
    .filter((match) => match.missing.length <= 1);

  return {
    ready: sortMatches(matches.filter((match) => match.status === "ready")),
    almost: sortMatches(matches.filter((match) => match.status === "almost"))
  };
}

function hasIngredient(ingredient) {
  if (ingredient === "물") {
    return true;
  }

  const aliases = ingredientAliases[ingredient] || [];
  return selectedIngredients.has(ingredient) || aliases.some((alias) => selectedIngredients.has(alias));
}

function sortMatches(matches) {
  return matches.sort((a, b) => {
    const popularTieBreaker = Number(isPopularRecipe(b.recipe.id)) - Number(isPopularRecipe(a.recipe.id));
    const tieBreaker = popularTieBreaker
      || b.recipe.ingredients.length - a.recipe.ingredients.length
      || difficultyScore(a.recipe.difficulty) - difficultyScore(b.recipe.difficulty)
      || dishScore(a.recipe.dishLevel) - dishScore(b.recipe.dishLevel)
      || a.recipe.time - b.recipe.time
      || a.recipe.name.localeCompare(b.recipe.name, "ko");

    if (selectedSort === "caloriesAsc") {
      return a.recipe.calories - b.recipe.calories || tieBreaker;
    }

    if (selectedSort === "caloriesDesc") {
      return b.recipe.calories - a.recipe.calories || tieBreaker;
    }

    if (selectedSort === "dishAsc") {
      return dishScore(a.recipe.dishLevel) - dishScore(b.recipe.dishLevel)
        || a.recipe.time - b.recipe.time
        || difficultyScore(a.recipe.difficulty) - difficultyScore(b.recipe.difficulty)
        || a.recipe.name.localeCompare(b.recipe.name, "ko");
    }

    return tieBreaker;
  });
}

function isPopularRecipe(recipeId) {
  return Boolean(getStaticRecipePage(recipeId));
}

function updateResults() {
  const { ready, almost } = getMatches();

  selectedCountEl.textContent = `${selectedIngredients.size}개`;
  readyCountEl.textContent = `${ready.length}개`;
  almostCountEl.textContent = `${almost.length}개`;
  readyLabelEl.textContent = ready.length;
  almostLabelEl.textContent = almost.length;

  readyResultsEl.innerHTML = ready.map(renderRecipeCard).join("");
  almostResultsEl.innerHTML = almost.map(renderRecipeCard).join("");
  renderShoppingList(almost);

  const hasAnyResult = ready.length > 0 || almost.length > 0;
  emptyMessageEl.hidden = hasAnyResult;
  emptyMessageEl.textContent = selectedIngredients.size === 0 && selectedFilters.size === 0
    ? "재료를 선택하면 만들 수 있는 요리를 찾아드릴게요."
    : "조건에 맞는 요리가 아직 없어요. 재료를 조금 더 선택하거나 필터를 줄여보세요.";
}

function renderShoppingList(almostMatches) {
  const missingCounts = almostMatches.reduce((counts, match) => {
    const missingIngredient = match.missing[0];

    if (missingIngredient) {
      counts.set(missingIngredient, (counts.get(missingIngredient) || 0) + 1);
    }

    return counts;
  }, new Map());
  const items = [...missingCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ko"));

  shoppingListPanelEl.hidden = !isShoppingListVisible || items.length === 0;
  shoppingListCountEl.textContent = `${items.length}`;
  shoppingListEl.innerHTML = items.map(([ingredient, count]) => `
    <button class="shopping-item" type="button" data-add-ingredient="${ingredient}" aria-label="${ingredient} 재료에 추가">
      <span>${ingredient}</span>
      <b>${count}개 요리</b>
    </button>
  `).join("");
}

function renderRecipeCard(match) {
  const { recipe, missing, status } = match;
  const badgeText = status === "ready" ? "바로 가능" : `부족: ${missing.join(", ")}`;
  const type = getRecipeType(recipe);

  return `
    <article class="recipe-card">
      <div class="recipe-top">
        <h3>${recipe.name}</h3>
        <span class="badge ${status}">${badgeText}</span>
      </div>
      <div class="meta-list">
        <span>${type}</span>
        <span>${recipe.time}분</span>
        <span>약 ${recipe.calories}kcal</span>
        <span>${recipe.difficulty}</span>
        <span>설거지 ${recipe.dishLevel}</span>
      </div>
      <div class="recipe-detail">
        <p><strong>필수 재료</strong> ${recipe.ingredients.join(", ")}</p>
        <div class="button-cloud">${recipe.tags.map((tag) => `<span class="tag">#${tag}</span>`).join("")}</div>
        ${renderRecipeDetailAction(recipe.id)}
      </div>
    </article>
  `;
}

function handleRecipeDetailClick(event) {
  const detailButton = event.target.closest("[data-recipe-id]");

  if (detailButton) {
    openRecipeModal(detailButton.dataset.recipeId);
  }
}

function openRecipeModal(recipeId) {
  const recipe = recipeData.find((item) => item.id === recipeId);

  if (!recipe) {
    return;
  }

  const missing = recipe.ingredients.filter((ingredient) => !hasIngredient(ingredient));
  const statusText = missing.length === 0 ? "지금 바로 가능" : `부족한 재료: ${missing.join(", ")}`;

  modalRecipeContentEl.innerHTML = `
    <div class="modal-recipe-head">
      <span class="eyebrow">${getRecipeType(recipe)}</span>
      <h2 id="modalRecipeTitle">${recipe.name}</h2>
      <div class="meta-list">
        <span>${statusText}</span>
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
  recipeModalEl.hidden = false;
  document.body.classList.add("is-modal-open");
  modalCloseBtnEl.focus();
}

function closeRecipeModal() {
  recipeModalEl.hidden = true;
  document.body.classList.remove("is-modal-open");
}

function confirmResetSelections() {
  const shouldReset = window.confirm("선택한 재료와 필터를 모두 초기화할까요?");

  if (shouldReset) {
    resetSelections();
  }
}

function resetSelections() {
  selectedIngredients.clear();
  selectedFilters.clear();
  selectedCalorieFilter = "";
  selectedRecipeType = "all";
  isShoppingListVisible = false;
  selectedSort = "default";
  sortSelectEl.value = selectedSort;
  localStorage.removeItem(storageKey);
  localStorage.removeItem(legacyStorageKey);

  document.querySelectorAll(".chip.is-selected").forEach((button) => {
    button.classList.remove("is-selected");
    button.setAttribute("aria-pressed", "false");
  });

  renderSelectedIngredients();
  renderRecipeTypeButtons();
  updateResults();
}
