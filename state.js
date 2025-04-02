class globalState {
    static #speedMultiplier = 1;
    get speedMultiplier() { return globalState.#speedMultiplier }

    static #isStopped = false;
    get isStopped() { return globalState.#isStopped}
    set isStopped(value) { globalState.#isStopped = value}
};

const state = new globalState()

export default state