const zestyId = process.env.ZESTY_ID;
import { h, render, Component, Color } from 'ink';

class WeekTable extends Component {
    constructor() {
        super();
        this.state = {
            i: 0
        };
    }

    componentWillMount() {}

    render() {
        return h(
            Color,
            { green: true },
            this.state.i,
            ' tests passed'
        );
    }

    componentDidMount() {
        this.timer = setInterval(() => {
            this.setState({
                i: this.state.i + 1
            });
        }, 100);
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }
}

render(h(WeekTable, null));
