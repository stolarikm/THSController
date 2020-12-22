import BackgroundTimer from 'react-native-background-timer';

export default class PeriodicalPollingService {
    static intervalId = null;

    static start = (func, interval) => {
        if (!this.intervalId) {
            this.intervalId = BackgroundTimer.setInterval(func, interval)
        }
    };

    static stop() {
        if (this.intervalId) {
            BackgroundTimer.clearInterval(this.intervalId);
        } 
    }
}