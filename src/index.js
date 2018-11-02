#!/usr/bin/env node

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
const chalk = require('chalk')
const Divider = require('ink-divider')
const Spinner = require('ink-spinner')
const fetch = require('node-fetch')
const addDays = require('date-fns/add_days')
const format = require('date-fns/format')

const ZESTY_ID = process.env.ZESTY_ID
const ZESTY_ENDPOINT = 'https://api.zesty.com/client_portal_api/meals'

if (!ZESTY_ID) {
    console.log(
        chalk.yellow(
            'Please set environment variable "ZESTY_ID" as your Zesty client id first.'
        )
    )
    process.exit()
}

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
                    {format(meal.delivery_date, 'h:ma').padStart(10)}
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
        const { onPrev, onNext, prevEnabled, nextEnabled } = this.props
        if (key.name === 'left' && prevEnabled) {
            onPrev()
        }
        if (key.name === 'right' && nextEnabled) {
            onNext()
        }
    }

    render() {
        const { prevEnabled, nextEnabled } = this.props
        return (
            <div>
                <Color green={prevEnabled}>{'<'.padEnd(6)}</Color>
                <span>'left' and 'right' to toggle through weeks</span>
                <Color green={nextEnabled}>{'>'.padStart(6)}</Color>
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
            .catch(err => {
                console.log(
                    chalk.bold.red(
                        'Something went wrong with the request to Zesty, check the error below to debug'
                    )
                )
                console.error(err)
                process.exit()
            })
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
        const weekKeys = Object.keys(mealsOfWeek)
        const firstMealsOfWeek = mealsOfWeek[weekKeys[0]]
        const lastMealsOfWeek = mealsOfWeek[weekKeys[weekKeys.length - 1]]
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
                    prevEnabled={
                        (firstMealsOfWeek && firstMealsOfWeek[0].id) !==
                        (meals[0] && meals[0].id)
                    }
                    nextEnabled={
                        (lastMealsOfWeek &&
                            lastMealsOfWeek[lastMealsOfWeek.length - 1].id) !==
                        (meals[meals.length - 1] && meals[meals.length - 1].id)
                    }
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
