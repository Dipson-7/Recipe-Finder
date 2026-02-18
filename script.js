const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const mealsContainer = document.getElementById("meals");
const resultHeading = document.querySelector(".result-heading");
const errorContainer = document.getElementById("error-container");
const mealDetails = document.getElementById("meal-details");
const mealDetailsContent = document.querySelector(".meal-details-content");
const backBtn = document.getElementById("back-btn");

const BASE_URL = "https://www.themealdb.com/api/json/v1/1/";
const SEARCH_URL = `${BASE_URL}search.php?s=`;
const LOOKUP_URL = `${BASE_URL}lookup.php?i=`;

searchBtn.addEventListener("click", searchMeals);
mealsContainer.addEventListener("click", handleMealClick);
backBtn.addEventListener("click", () => {
  mealDetails.classList.add("hidden");
  mealsContainer.scrollIntoView({ behavior: "smooth" });
});

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    searchMeals();
  }
});

async function searchMeals() {
  const term = searchInput.value.trim();
  if (!term) {
    showError("Please enter a search term");
    return;
  }

  showLoading();
  resultHeading.textContent = `Searching for "${term}"...`;
  errorContainer.classList.add("hidden");
  mealDetails.classList.add("hidden");

  try {
    const res = await fetch(`${SEARCH_URL}${encodeURIComponent(term)}`);
    const { meals } = await res.json();

    if (!meals) {
      showError(`No recipes found for "${term}". Try something else!`);
      resultHeading.textContent = "";
      return;
    }

    resultHeading.textContent = `Search results for "${term}":`;
    displayMeals(meals);
    searchInput.value = "";
  } catch {
    showError("Something went wrong. Please try again.");
  }
}

function showLoading() {
  mealsContainer.innerHTML = '<div class="loading">Loading recipes...</div>';
}

function showError(msg) {
  errorContainer.textContent = msg;
  errorContainer.classList.remove("hidden");
  mealsContainer.innerHTML = "";
}

function displayMeals(meals) {
  mealsContainer.innerHTML = meals
    .map(
      (meal) => `
      <div class="meal" data-meal-id="${meal.idMeal}">
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
        <div class="meal-info">
          <h3 class="meal-title">${meal.strMeal}</h3>
          ${meal.strCategory ? `<div class="meal-category">${meal.strCategory}</div>` : ""}
        </div>
      </div>
    `
    )
    .join("");
}

async function handleMealClick(e) {
  const mealEl = e.target.closest(".meal");
  if (!mealEl) return;

  const mealId = mealEl.dataset.mealId;

  mealDetailsContent.innerHTML = '<div class="loading">Loading recipe details...</div>';

  try {
    const res = await fetch(`${LOOKUP_URL}${encodeURIComponent(mealId)}`);
    const { meals } = await res.json();
    const meal = meals?.[0];

    if (!meal) throw new Error("Meal not found");

    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ing = meal[`strIngredient${i}`]?.trim();
      if (ing) {
        ingredients.push({
          measure: meal[`strMeasure${i}`]?.trim() || "",
          ingredient: ing,
        });
      }
    }

    mealDetailsContent.innerHTML = `
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="meal-details-img">
      <h2 class="meal-details-title">${meal.strMeal}</h2>
      <div class="meal-details-category">
        <span>${meal.strCategory || "Uncategorized"}</span>
      </div>
      <div class="meal-details-instructions">
        <h3>Instructions</h3>
        <p>${meal.strInstructions || "No instructions available."}</p>
      </div>
      <div class="meal-details-ingredients">
        <h3>Ingredients</h3>
        <ul class="ingredients-list">
          ${ingredients
            .map((item) => `<li><i class="fas fa-check-circle"></i> ${item.measure} ${item.ingredient}</li>`)
            .join("")}
        </ul>
      </div>
      ${meal.strYoutube ? `<a href="${meal.strYoutube}" target="_blank" class="youtube-link"><i class="fab fa-youtube"></i> Watch Video</a>` : ""}
    `;

    mealDetails.classList.remove("hidden");
    mealDetails.scrollIntoView({ behavior: "smooth" });
  } catch {
    errorContainer.textContent = "Could not load recipe details. Please try again.";
    errorContainer.classList.remove("hidden");
  }
}
