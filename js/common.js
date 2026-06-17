const appConfig = {
  siteName: "whatEat",
  logoTitle: "whatEat",
  logoImage: "images/whatEat-logo-header-new.jpg",
  pageTitle: "오늘 뭐 먹지?",
  description: "오늘 뭐 먹을지 고민될 때 오늘의 메뉴 추천, 냉장고 털이, 칼로리 계산, 요리백과를 한곳에서 사용하는 식사 도구입니다."
};

document.addEventListener("DOMContentLoaded", applySiteConfig);

function applySiteConfig() {
  const pageTitle = document.body.dataset.pageTitle || appConfig.pageTitle;
  const fullTitle = `${appConfig.siteName} - ${pageTitle}`;
  const pageDescription = document.body.dataset.pageDescription
    || getMetaContent("description")
    || appConfig.description;
  const logoEl = document.querySelector("#siteLogo");

  document.title = fullTitle;
  setMetaContent("description", pageDescription);
  setMetaContent("og:title", fullTitle);
  setMetaContent("og:description", pageDescription);

  if (logoEl) {
    logoEl.innerHTML = `<img class="logo-image" src="${getAssetPath(appConfig.logoImage)}" alt="${appConfig.logoTitle}">`;
    logoEl.setAttribute("aria-label", `${appConfig.siteName} 홈`);
  }

  document.querySelectorAll("[data-site-name]").forEach((element) => {
    element.textContent = appConfig.siteName;
  });

  document.querySelectorAll("[data-site-name-topic]").forEach((element) => {
    element.textContent = `${appConfig.siteName}${getTopicParticle(appConfig.siteName)}`;
  });
}

function setMetaContent(name, content) {
  const meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);

  if (meta) {
    meta.setAttribute("content", content);
  }
}

function getMetaContent(name) {
  return document.querySelector(`meta[name="${name}"], meta[property="${name}"]`)?.getAttribute("content") || "";
}

function getAssetPath(path) {
  const depth = window.location.pathname.includes("/articles/") ? "../" : "";

  return `${depth}${path}`;
}

function getTopicParticle(text) {
  const lastCharCode = text.charCodeAt(text.length - 1);
  const hasFinalConsonant = (lastCharCode - 0xac00) % 28 > 0;

  return hasFinalConsonant ? "은" : "는";
}

function difficultyScore(difficulty) {
  return { "매우 쉬움": 0, "쉬움": 1, "보통": 2, "어려움": 3 }[difficulty] ?? 9;
}

function dishScore(level) {
  return { "적음": 0, "보통": 1, "많음": 2 }[level] ?? 9;
}

const recipeTypeRules = [
  { type: "볶음밥", words: ["볶음밥"] },
  { type: "덮밥/밥", words: ["덮밥", "비빔밥", "계란밥", "간장밥", "카레밥", "국밥", "죽"] },
  { type: "국/찌개", words: ["국", "찌개", "탕", "전골"] },
  { type: "면/파스타", words: ["라면", "국수", "비빔면", "파스타", "면"] },
  { type: "볶음/조림", words: ["볶음", "조림", "찜", "짜글이", "불고기", "제육"] },
  { type: "구이/부침", words: ["구이", "부침", "전", "계란말이"] },
  { type: "토스트/빵", words: ["토스트", "식빵", "피자"] },
  { type: "샐러드/무침", words: ["샐러드", "무침"] }
];

const recipeTypeOrder = [
  "덮밥/밥",
  "볶음밥",
  "국/찌개",
  "면/파스타",
  "볶음/조림",
  "구이/부침",
  "토스트/빵",
  "샐러드/무침",
  "반찬/간식"
];

function getRecipeType(recipe) {
  const name = recipe.name || "";
  const matchedRule = recipeTypeRules.find((rule) => rule.words.some((word) => name.includes(word)));

  if (matchedRule) {
    return matchedRule.type;
  }

  if (recipe.tags?.includes("아침식사") || recipe.tags?.includes("야식")) {
    return "반찬/간식";
  }

  return "반찬/간식";
}
