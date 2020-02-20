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
import List from './models/List';
import Likes from './models/Likes';

import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';

import { elements, renderLoader, clearLoader } from './views/base';

/**  Global state of the app
 * - Search object
 * - Current recipe object
 * - Shopping list object
 * - Liked recipes
 */
const state = {};
// for testing purpose
window.state = state;




const controlSearch = async () => {
    const query = searchView.getInput();
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
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // highlight selected search item
        if (state.search) searchView.highlightSelected(id);
        
        // create new recipe object
        state.recipe = new Recipe(id);
        // testing
        window.r = state.recipe;
        try {
            // get recipe data
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();
            // calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();
            // render recipe
            clearLoader();
            recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
            
        } catch(err) {
            console.log(err);
            alert('error processing recipe')
        }
        
    }
};

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

/*
ListController
*/

const controlList = () => {
    // create a new list if there in none yet
    if (!state.list) state.list = new List();

    // Add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
}

// handle delete and update list item events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;
    
    // delete button handler
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        // delete from state
        state.list.deleteItem(id);
        // delete from UI
        listView.deleteItem(id);

    // handle the count update
    } else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
});

/**
 * Like controller
 */
// for quick fix
state.likes = new Likes();
const controlLike = () => {
    if (!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;

    // User has not yet liked current recipe
    if (!state.likes.isLiked(currentID)) {
        // Add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img,
        );
        // Toggle the like button
        likesView.toggleLikeBtn(true);
        // Add like to UI List
        likesView.renderLike(newLike);

    // User has liked current recipe
    } else {
        // Remove like to the state
        state.likes.deleteLike(currentID);
        // Toggle the like button
        likesView.toggleLikeBtn(false);
        // Remove like to UI List
        likesView.deleteLike(currentID);
    }

    likesView.toggleLikeMenu(state.likes.getNumLikes());
}




// handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        // decrease button is clicked
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        // increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);

    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        // Add ingredients to shopping list
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        // Like controller
        controlLike();
    }
});

window.l = new List();