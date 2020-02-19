/*
Here are the 3 things that you need to know about forkify-api which are DIFFERENT from the food2fork API in the videos:

1) No API key is required;

2) No proxy is required;

3) The URL is forkify-api.herokuapp.com (click for basic documentation).

For example:
in Search.js:
const res = await axios(`https://forkify-api.herokuapp.com/api/search?&q=${this.query}`);

in Recipe.js:
const res = await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);
*/

import Search from './models/Search';
import Recipe from './models/Recipe';
import * as searchView from './views/searchView';
import { elements, renderLoader, clearLoader } from './views/base';

/**  Global state of the app
 * - Search object
 * - Current recipe object
 * - Shopping list object
 * - Liked recipes
 */
const state = {};

const controlSearch = async () => {
    // const query = searchView.getInput();
    const query = 'pizza';
    console.log(query);

    if (query) {
        // 2) new search object and add to state
        state.search = new Search(query);
        try {
            // 3) prepare UI for results
            searchView.clearInput();
            searchView.clearResults();
            renderLoader(elements.searchRes);
            // 4) search for recipes
            await state.search.getResults();

            // 5) render results on UI
            clearLoader();
            searchView.renderResults(state.search.result);

        } catch (err) {
            alert('Error processing search');
        }
    }
};

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

// for testing
window.addEventListener('load', e => {
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10); // the base is 10, 0 - 9; if base is 2 then binary
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
});



/**
 * Recipe Controller
 */
const controlRecipe = async () => {
    // get id from url
    const id = window.location.hash.replace('#', '');
    console.log(id);

    if (id) {
        // prepare ui to change

        // create new recipe object
        state.recipe = new Recipe(id);
        // testing
        window.r = state.recipe;
        try {
            // get recipe data
            await state.recipe.getRecipe();
            // calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();
            // render recipe
            console.log(state.recipe);

        } catch(err) {
            alert('error processing recipe')
        }
        
    }
};

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));