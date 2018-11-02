const {
    h,
    render,
    renderToString,
    Component,
    Color,
    Fragment,
    Bold,
    span,
    div
} = require('ink')
const Divider = require('ink-divider')
const Spinner = require('ink-spinner')
const fetch = require('node-fetch')
const addDays = require('date-fns/add_days')
const format = require('date-fns/format')

const ZESTY_ID = process.env.ZESTY_ID
const ZESTY_ENDPOINT = 'https://api.zesty.com/client_portal_api/meals'

const getMealsByDate = (meals, startDate, endDate) =>
    meals
        .filter(meal => {
            const date = new Date(meal.delivery_date)
            return date >= startDate && date <= endDate
        })
        .reduce((acc, meal) => {
            const date = new Date(meal.delivery_date)
            if (!acc[format(date, 'YYYY/MM/DD')]) {
                acc[format(date, 'YYYY/MM/DD')] = []
            }
            acc[format(date, 'YYYY/MM/DD')].push(meal)
            return acc
        }, {})

class DayHeader extends Component {
    render() {
        const { date } = this.props
        return (
            <Divider
                title={renderToString(
                    <Fragment>
                        <Color yellow>{format(date, 'ddd')} </Color>
                        <span>{format(date, 'MMM DD, YYYY')}</span>
                    </Fragment>
                )}
            />
        )
    }
}

class MealView extends Component {
    render() {
        const { meal } = this.props
        return (
            <div>
                <span>
                    {format(meal.delivery_date, 'h:ma').padStart(15)}
                    {' | '}
                </span>
                <Color green>{meal.restaurant_name}</Color>
                <Color blue> [{meal.restaurant_cuisine}]</Color>
            </div>
        )
    }
}

class Controls extends Component {
    constructor(props) {
        super(props)
        this.handleKeyPress = this.handleKeyPress.bind(this)
    }

    componentDidMount() {
        process.stdin.on('keypress', this.handleKeyPress)
    }

    componentWillUnmount() {
        process.stdin.removeListener('keypress', this.handleKeyPress)
    }

    handleKeyPress(_, key) {
        const { onPrev, onNext } = this.props
        if (key.name === 'left') {
            onPrev()
        }
        if (key.name === 'right') {
            onNext()
        }
    }

    render() {
        return (
            <div>
                <Color green>{'<'.padEnd(6)}</Color>
                <span>'left' and 'right' to toggle through weeks</span>
                <Color green>{'>'.padStart(6)}</Color>
            </div>
        )
    }
}

class WeekTable extends Component {
    constructor(props) {
        super(props)
        this.state = {
            meals: [],
            weekOffset: 0
        }
    }

    componentWillMount() {
        const { zestyId } = this.props
        this.setState({
            loading: true
        })
        fetch(ZESTY_ENDPOINT + '?client_id=' + zestyId)
            .then(res => res.json())
            .then(res =>
                this.setState({
                    meals: res.meals,
                    loading: false
                })
            )
    }

    render() {
        const { meals, loading, weekOffset } = this.state
        const currentDate = addDays(new Date(), weekOffset * 7)
        currentDate.setHours(0, 0, 0, 0)
        const monday = new Date(currentDate)
        const sunday = new Date(currentDate)
        monday.setDate(currentDate.getDate() - currentDate.getDay())
        sunday.setDate(currentDate.getDate() + (7 - currentDate.getDay()))
        const mealsOfWeek = getMealsByDate(meals, monday, sunday)
        if (loading) {
            return (
                <div>
                    <Spinner green /> Loading Meals
                </div>
            )
        }
        return (
            <Fragment>
                {Object.keys(mealsOfWeek).map(key => {
                    const mealsOfDay = mealsOfWeek[key]
                    const date = new Date(key)
                    return (
                        <Fragment>
                            <DayHeader date={date} />
                            <br />
                            {mealsOfDay.map(m => (
                                <MealView meal={m} />
                            ))}
                            <br />
                        </Fragment>
                    )
                })}
                <br />
                <Controls
                    onPrev={() =>
                        this.setState({
                            weekOffset: this.state.weekOffset - 1
                        })
                    }
                    onNext={() =>
                        this.setState({
                            weekOffset: this.state.weekOffset + 1
                        })
                    }
                />
                <br />
            </Fragment>
        )
    }
}

render(<WeekTable zestyId={ZESTY_ID} />)
