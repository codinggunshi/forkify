import uniqid from 'uniqid';

export default class List {
    constructor() {
        this.items = [];
    }

    addItem (count, unit, ingredient) {
        const item = {
            id: uniqid(),
            count,
            unit,
            ingredient,
        }
        this.items.push(item);
        return item;
    }

    deleteItem(id) {
        const index = this.items.findIndex(el => el.id === id);
        // splice & slice usage:
        // [2, 4, 8] splice(1, 1) => returns 4, original arr is [2, 8]     splice(int start pos, int cnt)
        // [2, 4, 8] slice(1, 2) => returns 4, original arr is [2, 4, 8]   slice(int start pos, int end pos(end element exclude))
        // [2, 4, 8] slice(1, 1) =>return nothing
        this.items.splice(index, 1);
    }

    updateCount(id, newCount) {
        this.items.find(el => el.id === id).count = newCount;
    }
}