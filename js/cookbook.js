const cookbookSearchEl = document.querySelector("#cookbookSearch");
const cookbookFilterEl = document.querySelector("#cookbookFilter");
const cookbookTypeFilterEl = document.querySelector("#cookbookTypeFilter");
const cookbookCountEl = document.querySelector("#cookbookCount");
const cookbookResultsEl = document.querySelector("#cookbookResults");
const cookbookEmptyEl = document.querySelector("#cookbookEmpty");
const recipeModalEl = document.querySelector("#recipeModal");
const modalRecipeContentEl = document.querySelector("#modalRecipeContent");
const modalCloseBtnEl = document.querySelector("#modalCloseBtn");

document.addEventListener("DOMContentLoaded", () => {
  renderCookbook();
  cookbookSearchEl.addEventListener("input", renderCookbook);
  cookbookFilterEl.addEventListener("change", renderCookbook);
  cookbookTypeFilterEl.addEventListener("change", renderCookbook);
  cookbookResultsEl.addEventListener("click", (event) => {
    const detailButton = event.target.closest("[data-recipe-id]");

    if (detailButton) {
      openRecipeModal(detailButton.dataset.recipeId);
    }
  });
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
});

function renderCookbook() {
  const keyword = cookbookSearchEl.value.trim().toLowerCase();
  const activeTag = cookbookFilterEl.value;
  const activeType = cookbookTypeFilterEl.value;
  const recipes = recipeData.filter((recipe) => {
    const recipeType = getRecipeType(recipe);
    const searchableText = [
      recipe.name,
      recipeType,
      recipe.ingredients.join(" "),
      recipe.optional.join(" "),
      recipe.tags.join(" ")
    ].join(" ").toLowerCase();
    const matchesKeyword = keyword === "" || searchableText.includes(keyword);
    const matchesTag = activeTag === "all" || recipe.tags.includes(activeTag);
    const matchesType = activeType === "all" || recipeType === activeType;

    return matchesKeyword && matchesTag && matchesType;
  });

  cookbookCountEl.textContent = recipes.length;
  cookbookEmptyEl.hidden = recipes.length > 0;
  cookbookResultsEl.innerHTML = recipes.map((recipe) => renderCookbookCard(recipe)).join("");
}

function renderCookbookCard(recipe) {
  const type = getRecipeType(recipe);

  return `
    <article class="recipe-card cookbook-card">
      <div class="recipe-top">
        <h3>${recipe.name}</h3>
        <span class="badge ready">${recipe.time}분</span>
      </div>
      <div class="meta-list">
        <span>${type}</span>
        <span>약 ${recipe.calories}kcal</span>
        <span>${recipe.difficulty}</span>
        <span>설거지 ${recipe.dishLevel}</span>
      </div>
      <div class="recipe-detail">
        <p><strong>필수 재료</strong> ${recipe.ingredients.join(", ")}</p>
        <p><strong>사용 도구</strong> ${recipe.tools.join(", ")}</p>
        <div class="button-cloud">${recipe.tags.map((tag) => `<span class="tag">#${tag}</span>`).join("")}</div>
        ${renderRecipeDetailAction(recipe.id)}
      </div>
    </article>
  `;
}

function openRecipeModal(recipeId) {
  const recipe = recipeData.find((item) => item.id === recipeId);

  if (!recipe) {
    return;
  }

  modalRecipeContentEl.innerHTML = `
    <div class="modal-recipe-head">
      <span class="eyebrow">${getRecipeType(recipe)}</span>
      <h2 id="modalRecipeTitle">${recipe.name}</h2>
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
  recipeModalEl.hidden = false;
  document.body.classList.add("is-modal-open");
  modalCloseBtnEl.focus();
}

function closeRecipeModal() {
  recipeModalEl.hidden = true;
  document.body.classList.remove("is-modal-open");
}
