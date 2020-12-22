export default class PeriodicalPollingService {
    static intervalId = null;

    static start = (func, interval) => {
        if (!this.intervalId) {
            this.intervalId = setInterval(func, interval)
        }
    };

    static stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        } 
    }
}