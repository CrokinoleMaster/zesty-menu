const {
    h,
    render,
    Component,
    Color,
    Fragment,
    Bold,
    span,
    div
} = require('ink')
const fetch = require('node-fetch')
const addDays = require('date-fns/add_days')
const format = require('date-fns/format')

const ZESTY_ID = process.env.ZESTY_ID
const ZESTY_ENDPOINT = 'https://api.zesty.com/client_portal_api/meals'

const getMealsByDate = (meals, startDate, endDate) =>
    meals.filter(meal => {
        const date = new Date(meal.delivery_date)
        return date >= startDate && date <= endDate
    })

class WeekTable extends Component {
    constructor(props) {
        super(props)
        this.state = {
            meals: []
        }
    }

    componentWillMount() {
        const { zestyId } = this.props
        fetch(ZESTY_ENDPOINT + '?client_id=' + zestyId)
            .then(res => res.json())
            .then(res =>
                this.setState({
                    meals: res.meals
                })
            )
    }

    render() {
        const { meals } = this.state
        const currentDate = new Date()
        const mealsOfWeek = getMealsByDate(
            meals,
            currentDate,
            addDays(currentDate, 7)
        )
        return (
            <Fragment>
                {mealsOfWeek.map(meal => {
                    return (
                        <Fragment>
                            <div>
                                <Bold>{format(meal.delivery_date, 'ddd')}</Bold>
                                <span>
                                    {format(meal.delivery_date, 'MMM DD, YYYY')}{' '}
                                    |{' '}
                                </span>
                                <Color green>{meal.restaurant_name}</Color>
                                <Color blue> [{meal.restaurant_cuisine}]</Color>
                            </div>
                            <div>
                                <span>
                                    {format(meal.delivery_date, 'h:ma')}
                                </span>
                            </div>
                        </Fragment>
                    )
                })}
            </Fragment>
        )
    }
}

render(<WeekTable zestyId={ZESTY_ID} />)
