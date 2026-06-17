const baseCalorieFoods = [
  { id: "rice", name: "밥 1공기", calories: 310, category: "기본 재료" },
  { id: "frozen-rice", name: "냉동밥 1개", calories: 320, category: "기본 재료" },
  { id: "ramen", name: "라면 1봉", calories: 500, category: "기본 재료" },
  { id: "egg", name: "계란 1개", calories: 80, category: "기본 재료" },
  { id: "kimchi", name: "김치 100g", calories: 25, category: "기본 재료" },
  { id: "tofu", name: "두부 100g", calories: 80, category: "기본 재료" },
  { id: "sundubu", name: "순두부 100g", calories: 50, category: "기본 재료" },
  { id: "tuna", name: "참치캔 100g", calories: 210, category: "기본 재료" },
  { id: "spam", name: "스팸 100g", calories: 340, category: "기본 재료" },
  { id: "sausage", name: "소시지 100g", calories: 300, category: "기본 재료" },
  { id: "bread", name: "식빵 1장", calories: 130, category: "기본 재료" },
  { id: "cheese", name: "치즈 1장", calories: 65, category: "기본 재료" },
  { id: "mandu", name: "냉동만두 100g", calories: 240, category: "기본 재료" },
  { id: "chicken", name: "닭가슴살 100g", calories: 165, category: "기본 재료" },
  { id: "mayo", name: "마요네즈 1큰술", calories: 95, category: "양념" },
  { id: "oil", name: "식용유 1큰술", calories: 120, category: "양념" },
  { id: "milk", name: "우유 1컵", calories: 130, category: "기본 재료" },
  { id: "pasta", name: "파스타면 1인분", calories: 360, category: "기본 재료" },
  { id: "noodle", name: "국수 1인분", calories: 350, category: "기본 재료" },
  { id: "tortilla", name: "또띠아 1장", calories: 150, category: "기본 재료" },
  { id: "rice-cake", name: "떡 100g", calories: 240, category: "기본 재료" },
  { id: "sweet-potato", name: "고구마 100g", calories: 130, category: "채소" },
  { id: "potato", name: "감자 100g", calories: 77, category: "채소" },
  { id: "onion", name: "양파 100g", calories: 40, category: "채소" },
  { id: "cabbage", name: "양배추 100g", calories: 25, category: "채소" },
  { id: "mushroom", name: "버섯 100g", calories: 25, category: "채소" },
  { id: "bean-sprout", name: "콩나물 100g", calories: 30, category: "채소" },
  { id: "tomato", name: "토마토 100g", calories: 18, category: "채소" },
  { id: "broccoli", name: "브로콜리 100g", calories: 34, category: "채소" },
  { id: "paprika", name: "파프리카 100g", calories: 25, category: "채소" },
  { id: "corn", name: "옥수수콘 100g", calories: 110, category: "냉동/가공식품" },
  { id: "mackerel-can", name: "고등어캔 100g", calories: 220, category: "기본 재료" },
  { id: "saury-can", name: "꽁치캔 100g", calories: 230, category: "기본 재료" },
  { id: "whelk-can", name: "골뱅이캔 100g", calories: 100, category: "기본 재료" },
  { id: "fishcake", name: "어묵 100g", calories: 180, category: "냉동/가공식품" },
  { id: "crab-stick", name: "맛살 100g", calories: 95, category: "냉동/가공식품" },
  { id: "bacon", name: "베이컨 100g", calories: 540, category: "냉동/가공식품" },
  { id: "smoked-duck", name: "훈제오리 100g", calories: 290, category: "냉동/가공식품" },
  { id: "frozen-shrimp", name: "새우 100g", calories: 100, category: "냉동/가공식품" },
  { id: "frozen-fries", name: "냉동감자 100g", calories: 230, category: "냉동/가공식품" },
  { id: "pizza-cheese", name: "피자치즈 100g", calories: 300, category: "기본 재료" },
  { id: "butter", name: "버터 10g", calories: 75, category: "기본 재료" },
  { id: "gochujang", name: "고추장 1큰술", calories: 35, category: "양념" },
  { id: "ssamjang", name: "쌈장 1큰술", calories: 45, category: "양념" },
  { id: "tomato-sauce", name: "토마토소스 100g", calories: 80, category: "양념" },
  { id: "chili-sauce", name: "칠리소스 1큰술", calories: 45, category: "양념" },
  { id: "mustard", name: "머스타드 1큰술", calories: 15, category: "양념" },
  { id: "sugar", name: "설탕 1큰술", calories: 48, category: "양념" },
  { id: "sesame-oil", name: "참기름 1큰술", calories: 120, category: "양념" },
  { id: "kim", name: "김 1장", calories: 10, category: "기본 재료" },
  { id: "seaweed", name: "미역 10g", calories: 20, category: "기본 재료" },
  { id: "curry-powder", name: "카레가루 1인분", calories: 110, category: "양념" },
  { id: "buchim-powder", name: "부침가루 100g", calories: 350, category: "양념" }
];

const availableRecipes = typeof recipeData !== "undefined" ? recipeData : [];
const recipeCalorieFoods = availableRecipes.map((recipe) => ({
  id: `recipe:${recipe.id}`,
  name: recipe.name,
  calories: recipe.calories,
  category: `레시피 | ${getRecipeType(recipe)}`
}));

const calorieFoods = [...baseCalorieFoods, ...recipeCalorieFoods];
const calorieItems = [];
const calorieSearchEl = document.querySelector("#calorieSearch");
const calorieOptionCountEl = document.querySelector("#calorieOptionCount");
const calorieSearchResultsEl = document.querySelector("#calorieSearchResults");
const selectedCalorieFoodNameEl = document.querySelector("#selectedCalorieFoodName");
const calorieAmountEl = document.querySelector("#calorieAmount");
const addCalorieBtnEl = document.querySelector("#addCalorieBtn");
const calorieTotalEl = document.querySelector("#calorieTotal");
const calorieItemsEl = document.querySelector("#calorieItems");
const calorieEmptyEl = document.querySelector("#calorieEmpty");
let selectedCalorieFoodId = "";

document.addEventListener("DOMContentLoaded", () => {
  renderCalorieSearchResults();
  addCalorieBtnEl.disabled = true;
  addCalorieBtnEl.addEventListener("click", addCalorieItem);
  calorieSearchEl.addEventListener("input", renderCalorieSearchResults);
  calorieSearchResultsEl.addEventListener("click", (event) => {
    const button = event.target.closest("[data-calorie-food]");

    if (button) {
      selectCalorieFood(button.dataset.calorieFood);
    }
  });
  calorieItemsEl.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-remove-calorie]");

    if (removeButton) {
      removeCalorieItem(Number(removeButton.dataset.removeCalorie));
    }
  });
});

function renderCalorieSearchResults() {
  const query = calorieSearchEl.value.trim().toLowerCase();
  const filteredFoods = calorieFoods.filter((food) => {
    if (!query) {
      return true;
    }

    const searchableText = `${food.name} ${food.category}`.toLowerCase();
    return searchableText.includes(query);
  });
  const visibleFoods = filteredFoods.slice(0, 10);

  calorieSearchResultsEl.innerHTML = visibleFoods.length > 0
    ? visibleFoods.map((food) => renderCalorieSearchItem(food)).join("")
    : `<p class="calorie-search-empty">검색 결과가 없습니다.</p>`;
  calorieOptionCountEl.textContent = `${filteredFoods.length}개`;
}

function renderCalorieSearchItem(food) {
  const isSelected = food.id === selectedCalorieFoodId;

  return `
    <button
      class="calorie-search-item${isSelected ? " is-selected" : ""}"
      type="button"
      data-calorie-food="${food.id}"
      aria-pressed="${isSelected}"
    >
      <span>
        <strong>${food.name}</strong>
        <small>${food.category}</small>
      </span>
      <b>${food.calories}kcal</b>
    </button>
  `;
}

function selectCalorieFood(foodId) {
  const food = calorieFoods.find((item) => item.id === foodId);

  if (!food) {
    return;
  }

  selectedCalorieFoodId = food.id;
  calorieSearchEl.value = food.name;
  selectedCalorieFoodNameEl.textContent = `${food.name} (${food.calories}kcal)`;
  addCalorieBtnEl.disabled = false;
  renderCalorieSearchResults();
}

function addCalorieItem() {
  const food = calorieFoods.find((item) => item.id === selectedCalorieFoodId);
  const amount = Number(calorieAmountEl.value);

  if (!food || !Number.isFinite(amount) || amount <= 0) {
    return;
  }

  calorieItems.push({
    id: Date.now(),
    name: food.name,
    amount,
    calories: Math.round(food.calories * amount)
  });

  calorieAmountEl.value = "1";
  renderCalorieItems();
}

function removeCalorieItem(id) {
  const index = calorieItems.findIndex((item) => item.id === id);

  if (index >= 0) {
    calorieItems.splice(index, 1);
    renderCalorieItems();
  }
}

function renderCalorieItems() {
  const total = calorieItems.reduce((sum, item) => sum + item.calories, 0);
  calorieTotalEl.textContent = `${total}kcal`;
  calorieEmptyEl.hidden = calorieItems.length > 0;

  calorieItemsEl.innerHTML = calorieItems.map((item) => `
    <div class="calorie-item">
      <div>
        <strong>${item.name}</strong>
        <span>선택 기준 ${item.amount}배</span>
      </div>
      <b>${item.calories}kcal</b>
      <button type="button" aria-label="${item.name} 삭제" data-remove-calorie="${item.id}">삭제</button>
    </div>
  `).join("");
}
