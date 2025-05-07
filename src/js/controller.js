import "core-js/stable";
import "regenerator-runtime/runtime";
import * as modal from "./modal.js";
import recipeView from "./views/recipeView.js";
import searchView from "./views/searchView.js";
import resultsView from "./views/resultsView.js";
import bookmarkView from "./views/bookmarkView.js";
import paginationView from "./views/paginationView.js";
import addRecipeView from "./views/addRecipeView.js";
import { MODAL_CLOSE_SEC } from "./config.js";

// if (module.hot) {
//   module.hot.accept();
// }

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;

    recipeView.renderSpinner();

    resultsView.update(modal.getSearchResultPage());

    await modal.loadRecipe(id);

    // console.log(recipe);

    recipeView.render(modal.state.recipe);
    bookmarkView.update(modal.state.bookmarks);
  } catch (err) {
    // alert(err);
    recipeView.renderError();
  }
};

const controlsearchResults = async function () {
  try {
    const query = searchView.getQuery();
    if (!query) return;
    resultsView.renderSpinner();
    await modal.loadSearchResults(query);
    searchView.getQuery();

    resultsView.render(modal.getSearchResultPage());

    paginationView.render(modal.state.search);
  } catch (err) {
    alert(err);
    // recipeView.renderError();
  }
};

const controlPagination = function (goToPage) {
  resultsView.render(modal.getSearchResultPage(goToPage));

  paginationView.render(modal.state.search);
};

const controlServing = async function (newServings) {
  await modal.updateServings(newServings);

  recipeView.update(modal.state.recipe);
};

const controlAddBookmark = function () {
  if (!modal.state.recipe.bookmarked) {
    modal.addBookmark(modal.state.recipe);
  } else {
    modal.deleteBookMark(modal.state.recipe.id);
  }

  // console.log(modal.state.recipe);
  recipeView.update(modal.state.recipe);

  bookmarkView.render(modal.state.bookmarks);
};

const controlBookmark = function () {
  bookmarkView.render(modal.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // show spinner
    addRecipeView.renderSpinner();
    // upload recipe
    await modal.uploadRecipe(newRecipe);
    // render recipe
    recipeView.render(modal.state.recipe);

    //sucess message
    addRecipeView.renderMessage();
    // bookmark render
    bookmarkView.render(modal.state.bookmarks);
    // changed ID in URL
    window.history.pushState(null, "", `#${modal.state.recipe.id}`);
    // window.history.back();

    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.log(err);
    addRecipeView.renderError(err);
  }
};

const init = function () {
  recipeView.addHandelerRender(controlRecipes);
  recipeView.addHandelerUpdateServing(controlServing);
  recipeView.addHandelerAddBookMark(controlAddBookmark);
  searchView.addHandlerSearch(controlsearchResults);
  paginationView.addHandlerClick(controlPagination);
  bookmarkView.addHandlerRender(controlBookmark);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};

init();

// NEW API URL (instead of the one shown in the video)
// https://forkify-api.jonas.io

///////////////////////////////////////
