const { h, render, Component, Color } = require('ink');
const fetch = require('node-fetch');

const ZESTY_ID = process.env.ZESTY_ID;
const ZESTY_ENDPOINT = 'https://api.zesty.com/client_portal_api/meals';

class WeekTable extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentWillMount() {
        const { zestyId } = this.props;
        fetch(ZESTY_ENDPOINT + '?client_id=' + zestyId).then(res => res.json()).then(console.log);
    }

    render() {
        return h(
            Color,
            { green: true },
            this.state.i,
            ' tests passed'
        );
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }
}

render(h(WeekTable, { zestyId: ZESTY_ID }));
