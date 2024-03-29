let day = document.querySelector("day[data-id='1'] #day");
let time = document.querySelector("day[data-id='1'] #time");
let customers = document.querySelector("day[data-id='1'] customers");
let profit = document.querySelector("day[data-id='1'] profit");
let price = document.querySelector("day[data-id='1'] price");
let reputation = document.querySelector("day[data-id='1'] reputation");

/**
 * 
 * @todo profit can be used to upgrade the stand to attract more customers.
 * @todo add a total profit count
 * @todo maybe add a popup at the end of every day for the user to purchase an upgrade?
 */
export default class {
    constructor() {
        this.buttons.raise.addEventListener("click", this.raisePrice.bind(this));
        this.buttons.lower.addEventListener("click", this.lowerPrice.bind(this));
    }

    ui = Object.defineProperties({}, {
        day: {
            get() {
                return parseInt(day.innerText);
            },
            set(value) {
                day.innerText = value;
            }
        },
        time: {
            get() {
                return parseInt(time.innerText);
            },
            set(value) {
                time.innerText = value;
            }
        },
        customers: {
            get() {
                return parseInt(customers.innerText);
            },
            set(value) {
                customers.innerText = value;
            }
        },
        profit: {
            get() {
                return parseFloat(profit.innerText);
            },
            set(value) {
                profit.innerText = value.toFixed(2);
            }
        },
        price: {
            get() {
                return parseFloat(price.innerText);
            },
            set(value) {
                price.innerText = value.toFixed(2);
            }
        },
        reputation: {
            get() {
                return parseFloat(reputation.innerText);
            },
            set(value) {
                reputation.innerText = value;
            }
        }
    })

    buttons = {
        raise: document.querySelector("day[data-id='1'] #increasePrice"),
        lower: document.querySelector("day[data-id='1'] #decreasePrice")
    }

    load() {
        // load previous days and data from local storage should a previous version exist
    }

    start() {
        // load previous data assuming this isn't the first visit
        if (JSON.parse(localStorage.getItem("data"))) {
            this.load();
        }

        // intervals for profit to increase based on conditions and random factors
        setInterval(() => {
            // 70% chance to increase profit
            let customerChance = Math.round(Math.random() * 100);
            if (customerChance < 30) {
                // Decides the number of customers per hour
                this.ui.customers += Math.floor(Math.random() * 5);
            } else {
                this.ui.customers++;
            }

            // 5% chance of a bug appearing in a customer's drink; in which case, they'd be refunded.
            let bugChance = Math.round(Math.random() * 100);
            if (bugChance < 5) {
                this.ui.profit -= this.ui.price;
            } else {
                this.ui.profit += this.ui.price;
            }

            this.ui.time++;
            if (this.ui.time > 24) {
                this.ui.time = 1;
                this.ui.customers = 0;
                this.ui.profit = 0;
                this.ui.day++;
            }
        }, 1250);
    }

    raisePrice() {
        this.ui.price++;
    }

    lowerPrice() {
        if (this.ui.price <= 0) {
            throw new Error("You cannot sell lemonade for less than $0.");
        }

        this.ui.price--;
    }
}