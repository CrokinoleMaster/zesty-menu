const zestyId = process.env.ZESTY_ID
const { h, render, Component, Color } = require('ink')

class WeekTable extends Component {
    constructor() {
        super()
        this.state = {
            i: 0
        }
    }

    componentWillMount() {
        const { zestyId } = this.props
    }

    render() {
        return <Color green>{this.state.i} tests passed</Color>
    }

    componentDidMount() {
        this.timer = setInterval(() => {
            this.setState({
                i: this.state.i + 1
            })
        }, 100)
    }

    componentWillUnmount() {
        clearInterval(this.timer)
    }
}

render(<WeekTable />)
