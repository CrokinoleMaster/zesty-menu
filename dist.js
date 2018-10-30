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
    if (!acc[format(date, 'YYYY-MM-DD')]) {
        acc[format(date, 'YYYY-MM-DD')] = [];
    }
    acc[format(date, 'YYYY-MM-DD')].push(meal);
    return acc;
}, {});

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
        const mealsOfWeek = getMealsByDate(meals, currentDate, addDays(currentDate, 7));
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
                    h(Divider, {
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
                    }),
                    h('br', null),
                    mealsOfDay.map(m => h(
                        'div',
                        null,
                        h(
                            'span',
                            null,
                            format(m.delivery_date, 'h:ma').padStart(15),
                            ' | '
                        ),
                        h(
                            Color,
                            { green: true },
                            m.restaurant_name
                        ),
                        h(
                            Color,
                            { blue: true },
                            ' ',
                            '[',
                            m.restaurant_cuisine,
                            ']'
                        )
                    )),
                    h('br', null)
                );
            })
        );
    }
}

render(h(WeekTable, { zestyId: ZESTY_ID }));
