export let seed = parseInt(Math.random()*452560);

document.addEventListener('DOMContentLoaded', () => {
    const element_run_button = document.getElementById('run-button');
    element_run_button.addEventListener('click', () => {
        seed = parseInt(Math.random()*452560);
    })
})

export class Random {
    #seed = 0;
    constructor (seed) {
        this.#seed = seed;
    }
    random () {
        this.#seed=(this.#seed*9301+49297)%233280;
        return this.#seed/233280.0;
    }
}