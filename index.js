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
            if (!acc[format(date, 'YYYY-MM-DD')]) {
                acc[format(date, 'YYYY-MM-DD')] = []
            }
            acc[format(date, 'YYYY-MM-DD')].push(meal)
            return acc
        }, {})

class WeekTable extends Component {
    constructor(props) {
        super(props)
        this.state = {
            meals: []
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
        const { meals, loading } = this.state
        const currentDate = new Date()
        const mealsOfWeek = getMealsByDate(
            meals,
            currentDate,
            addDays(currentDate, 7)
        )
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
                            <Divider
                                title={renderToString(
                                    <Fragment>
                                        <Color yellow>
                                            {format(date, 'ddd')}{' '}
                                        </Color>
                                        <span>
                                            {format(date, 'MMM DD, YYYY')}
                                        </span>
                                    </Fragment>
                                )}
                            />
                            <br />
                            {mealsOfDay.map(m => (
                                <div>
                                    <span>
                                        {format(
                                            m.delivery_date,
                                            'h:ma'
                                        ).padStart(15)}
                                        {' | '}
                                    </span>
                                    <Color green>{m.restaurant_name}</Color>
                                    <Color blue>
                                        {' '}
                                        [{m.restaurant_cuisine}]
                                    </Color>
                                </div>
                            ))}
                            <br />
                        </Fragment>
                    )
                })}
            </Fragment>
        )
    }
}

render(<WeekTable zestyId={ZESTY_ID} />)
