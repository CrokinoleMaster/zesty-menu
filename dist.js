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
} = require('ink');
const Divider = require('ink-divider');
const Spinner = require('ink-spinner');
const fetch = require('node-fetch');
const addDays = require('date-fns/add_days');
const format = require('date-fns/format');

const ZESTY_ID = process.env.ZESTY_ID;
const ZESTY_ENDPOINT = 'https://api.zesty.com/client_portal_api/meals';

const getMealsByDate = (meals, startDate, endDate) => meals.filter(meal => {
    const date = new Date(meal.delivery_date);
    return date >= startDate && date <= endDate;
}).reduce((acc, meal) => {
    const date = new Date(meal.delivery_date);
    if (!acc[format(date, 'YYYY/MM/DD')]) {
        acc[format(date, 'YYYY/MM/DD')] = [];
    }
    acc[format(date, 'YYYY/MM/DD')].push(meal);
    return acc;
}, {});

class DayHeader extends Component {
    render() {
        const { date } = this.props;
        return h(Divider, {
            title: renderToString(h(
                Fragment,
                null,
                h(
                    Color,
                    { yellow: true },
                    format(date, 'ddd'),
                    ' '
                ),
                h(
                    'span',
                    null,
                    format(date, 'MMM DD, YYYY')
                )
            ))
        });
    }
}

class MealView extends Component {
    render() {
        const { meal } = this.props;
        return h(
            'div',
            null,
            h(
                'span',
                null,
                format(meal.delivery_date, 'h:ma').padStart(15),
                ' | '
            ),
            h(
                Color,
                { green: true },
                meal.restaurant_name
            ),
            h(
                Color,
                { blue: true },
                ' [',
                meal.restaurant_cuisine,
                ']'
            )
        );
    }
}

class WeekTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            meals: []
        };
    }

    componentWillMount() {
        const { zestyId } = this.props;
        this.setState({
            loading: true
        });
        fetch(ZESTY_ENDPOINT + '?client_id=' + zestyId).then(res => res.json()).then(res => this.setState({
            meals: res.meals,
            loading: false
        }));
    }

    render() {
        const { meals, loading } = this.state;
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        const monday = new Date(currentDate);
        const sunday = new Date(currentDate);
        monday.setDate(currentDate.getDate() - currentDate.getDay());
        sunday.setDate(currentDate.getDate() + (7 - currentDate.getDay()));
        const mealsOfWeek = getMealsByDate(meals, monday, sunday);
        if (loading) {
            return h(
                'div',
                null,
                h(Spinner, { green: true }),
                ' Loading Meals'
            );
        }
        return h(
            Fragment,
            null,
            Object.keys(mealsOfWeek).map(key => {
                const mealsOfDay = mealsOfWeek[key];
                const date = new Date(key);
                return h(
                    Fragment,
                    null,
                    h(DayHeader, { date: date }),
                    h('br', null),
                    mealsOfDay.map(m => h(MealView, { meal: m })),
                    h('br', null)
                );
            })
        );
    }
}

render(h(WeekTable, { zestyId: ZESTY_ID }));
