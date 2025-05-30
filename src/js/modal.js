import { API_URL, RES_PER_PAGE, API_KEY } from "./config.js";
import { AJAX } from "./helpers.js";
export const state = {
  recipe: {},
  search: {
    query: "",
    results: [],
    page: 1,
    resultsPerPage: RES_PER_PAGE,
  },
  bookmarks: [],
};

const createReciprObj = function (data) {
  const { recipe } = data.data;

  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingtime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }),
  };
};

export const loadRecipe = async (id) => {
  try {
    const data = await AJAX(`${API_URL}/${id}?key=${API_KEY}`);

    state.recipe = createReciprObj(data);
    if (state.bookmarks.some((bookmark) => bookmark.id === state.recipe.id)) {
      state.recipe.bookmarked = true;
    } else {
      state.recipe.bookmarked = false;
    }
  } catch (err) {
    // console.log(err);
    throw new Error(err);
  }
};

export const loadSearchResults = async (query) => {
  try {
    state.search.query = query;
    state.search.page = 1;
    const data = await AJAX(`${API_URL}/?search=${query}&key=${API_KEY}`);

    state.search.results = data.data.recipes.map((rec) => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && { key: rec.key }),
      };
    });
    // console.log(state.search.results);
  } catch (err) {
    throw new Error(err);
  }
};

export const getSearchResultPage = function (page = 1) {
  state.search.page = page;
  const start = (page - 1) * state.search.resultsPerPage;
  const end = page * state.search.resultsPerPage;
  return state.search.results.slice(start, end);
};

export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach((ing) => {
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
  });

  state.recipe.servings = newServings;
};

const persistsBookmarks = function () {
  localStorage.setItem("bookmark", JSON.stringify(state.bookmarks));
};

export const addBookmark = function (recipe) {
  state.bookmarks.push(recipe);

  if (recipe.id === state.recipe.id) {
    state.recipe.bookmarked = true;
  }

  persistsBookmarks();
};

export const deleteBookMark = function (id) {
  state.bookmarks = state.bookmarks.filter((bookmark) => bookmark.id !== id);

  if (id === state.recipe.id) {
    state.recipe.bookmarked = false;
  }

  persistsBookmarks();
};

const clearBookmarks = function () {
  localStorage.clear("bookmark");
};

const init = function () {
  const storage = localStorage.getItem("bookmark");

  if (storage) state.bookmarks = JSON.parse(storage);
};

export const uploadRecipe = async function (newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter((entry) => entry[0].startsWith("ingredient") && entry[1] !== "")
      .map((ing) => {
        const ingArr = ing[1].split(",").map((el) => el.trim());
        if (ingArr.length !== 3)
          throw new Error("Wrong Ingredient format! Please use correct format");
        const [quantity, unit, description] = ingArr;

        return { quantity: quantity ? +quantity : null, unit, description };
      });

    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients: ingredients,
    };

    // console.log(recipe);
    const data = await AJAX(`${API_URL}?key=${API_KEY}`, recipe);
    // console.log(data);
    state.recipe = createReciprObj(data);
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};

init();
// console.log(state.bookmarks);

// loadSearchResults("pizza");
