import axios from 'axios';

export default class Recipe {
    constructor(id) {
        this.id = id;
    }

    async getRecipe() {
        try {
            const res = await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);
            this.title = res.data.recipe.title;
            this.author = res.data.recipe.publisher;
            this.img = res.data.recipe.image_url;
            this.url = res.data.recipe.source_url;
            this.ingredients = res.data.recipe.ingredients;
            console.log(res);
        } catch (error) {
            console.log(error);
            alert('Something went wrong :(');
        }
    }

    calcTime() {
        // Assuming that we need 15min for each 3 ingredients
        const numIng = this.ingredients.length;
        const periods = Math.ceil(numIng / 3);
        this.time = periods * 15;
    }

    calcServings() {
        this.servings = 4;
    }

    parseIngredients() {
        const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds']; 
        // if ounce comes before than ounces, then it only replace ounce to oz so we will have ozs
        const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound'];

        const units = [...unitsShort, 'kg', 'g'];

        const newIngredients = this.ingredients.map(el => {
            // 1) uniform units
            let ingredient = el.toLowerCase();
            unitsLong.forEach((unit, i) =>{
                ingredient = ingredient.replace(unit, unitsShort[i]);
            });
            // 2) remove paretheses
            ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');
            // 3) parse ingredients into count, unit, and ingredient
            const arrIng = ingredient.split(' ');
            const unitIndex = arrIng.findIndex(el2 => units.includes(el2)); // includes is a new method, check if el2 is in the arr or not


            let objIng;
            if (unitIndex > -1) {
                // there is a unit

                // Example:
                // 4  1/2 cups, arrCount is [4, 1/2]
                //4 cups, arrCount is [4]
                const arrCount = arrIng.slice(0, unitIndex);
                let count;
                if (arrCount.length === 1) {
                    count = eval(arrCount[0].replace('-', '+')); // the only number is count
                } else {
                    count = eval(arrIng.slice(0, unitIndex).join('+')); // eval(4 + 1/2) => 4.5
                }

                objIng = {
                    count,
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex + 1).join(' ')
                }

            } else if (parseInt(arrIng[0], 10)) {
                // there is no unit, but 1st element is number
                objIng = {
                    count: parseInt(arrIng[0], 10),
                    unit: '',
                    ingredient: arrIng.slice(1).join(' ') // we want all ingredient except 1st num, so slice(1) to remove 0 position number
                }
            } else if (unitIndex === -1) {
                // there is no unit && no number in 1st position
                objIng = {
                    count: 1,
                    unit: '',
                    ingredient // after es6, we can do this instead of 'ingredient : indegredient' (same name)
                }
            } 





            return objIng;
        });
        this.ingredients = newIngredients;
    }


    updateServings(type) {
        // Servings
        const newServings = type === 'dec' ? this.servings - 1 : this.servings + 1;
        
        
        // Ingredients
        this.ingredients.forEach(ing => {
            ing.count *= (newServings / this.servings);
        });

        this.servings = newServings;
    }

}