import React from 'react';
import { connect } from 'react-redux';
import { DeepChart, TradeChart } from '@wangleiddex/hydro-sdk-charts';
// import { testData } from './constants'; # we can use testData to show what TradeChart looks like
import api from '../../lib/api';

class Charts extends React.Component {
  constructor(props) {
    super(props);
    this.tradeChartWrapper = React.createRef();

    this.state = {
      granularityStr: window.localStorage.getItem('granularityStr') || '1d',
      loading: false,
      noData: false,
      data: [],
      // from and to are timestamp range for fetching API
      from: null,
      to: null,
      // start and end are indexes range of data to show in the screen
      start: null,
      end: null,
      lastUpdatedAt: new Date().getTime() // for loadRight
    };
  }

  componentDidMount() {
    this.loadData();
    this.interval = window.setInterval(() => this.loadRight(), 60000);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.currentMarket.id !== this.props.currentMarket.id) {
      this.setState({
        from: null,
        to: null,
        data: [],
        noData: false
      });
      this.loadData();
    }
  }

  componentWillUnmount() {
    if (this.interval) {
      window.clearInterval(this.interval);
    }
  }

  async loadRight(granularityStr = null) {
    if (new Date().getTime() - this.state.lastUpdatedAt > 59000) {
      this.loadData(this.state.granularityStr, this.state.to);
    }
  }

  async loadLeft(start, end) {
    this.loadData(this.state.granularityStr, null, this.state.from, start, end);
  }

  async loadData(granularityStr = null, from = null, to = null, start = null, end = null) {
    const granularityIsSame = this.state.granularityStr === granularityStr;
    if (this.state.loading || (granularityIsSame && this.state.noData)) {
      return;
    }
    if (!granularityIsSame && this.state.noData) {
      this.setState({ noData: false });
    }
    this.setState({ loading: true });

    const params = this.generateParams(granularityStr || this.state.granularityStr, from, to);
    if (granularityStr) {
      this.setState({ granularityStr });
    }

    let res;
    try {
      res = await api.get(
        `/markets/${this.props.currentMarket.id}/candles?from=${params.from}&to=${params.to}&granularity=${
          params.granularityNum
        }`
      );
      if (res.data.data.meta && res.data.data.meta.noData) {
        this.setState({ loading: false, noData: true });
        return;
      }
    } catch (e) {
      this.setState({ loading: false });
      return;
    }

    const newData = res.data.data.candles;
    for (let i = 0; i < newData.length; i++) {
      if (`${newData[i].time}`.length === 10) {
        newData[i].time = newData[i].time * 1000;
      }
    }
    const changeState = {
      data: newData,
      from: params.from,
      to: params.to,
      start: null,
      end: null,
      lastUpdatedAt: new Date().getTime()
    };

    if (granularityIsSame) {
      if (this.state.from && this.state.from > params.from) {
        // loadLeft
        changeState.to = this.state.to;
        changeState.data = [...newData, ...this.state.data];
        changeState.start = start + newData.length;
        changeState.end =
          end + newData.length > start + newData.length + this.fitLengthToShow()
            ? end + newData.length
            : start + newData.length + this.fitLengthToShow();
      }
      if (this.state.to && this.state.to < params.to) {
        // loadRight
        changeState.from = this.state.from;
        changeState.data = [...this.state.data, ...newData];
      }
    }

    this.setState(changeState);
    this.setState({ loading: false });
  }

  fitLengthToShow() {
    const width = this.tradeChartWrapper.current.offsetWidth;
    // ChartCanvas margin right 50;
    // CANDLE_WIDTH_AND_GAP  is 18;
    return Math.ceil((width - 50) / 18);
  }

  generateParams(granularityStr, from = null, to = null) {
    let granularityNum;
    to = to || Math.floor(new Date().getTime() / 1000);
    switch (granularityStr) {
      // case "1m":
      //   granularityNum = 60;
      //   from = from || to - 60 * 60 * 24 * 365 / 60; // 356 * 24 points, from 6 days ago;
      //   break;
      case '5m':
        granularityNum = 60 * 5;
        from = from || to - (60 * 60 * 24 * 365) / 12; // 356 * 24 points, from 1 month ago
        break;
      // case "15m":
      //   granularityNum = 60 * 15;
      //   from = from || to - 60 * 60 * 24 * 365 / 4; // 356 * 24 points, from 3 month ago
      //   break;
      case '1h':
        granularityNum = 60 * 60;
        from = from || to - 60 * 60 * 24 * 365; // 356 * 24 points, from 1 year ago
        break;
      // case "6h":
      //   granularityNum = 60 * 60 * 6;
      //   from = from || to - 60 * 60 * 24 * 365; // 356 * 4 points, from 1 year ago
      //   break;
      case '1d':
        granularityNum = 60 * 60 * 24;
        from = from || to - 60 * 60 * 24 * 365; // 356 points, from 1 year ago
        break;
      // case "1w":
      //   granularityNum = 60 * 60 * 24 * 7;
      //   from = from || to - 60 * 60 * 24 * 365; // 52 points, from 1 year ago
      //   break;
      // case "1mon":
      //   granularityNum = 60 * 60 * 24 * 30;
      //   from = from || to - 60 * 60 * 24 * 365; // 12 points, from 1 year ago
      //   break;
      default:
        // same as 1d
        granularityNum = 60 * 60 * 24;
        from = from || to - 60 * 60 * 24 * 365; // 356 points, from 1 year ago
        break;
    }

    return {
      from,
      to,
      granularityNum
    };
  }

  handleLoadMore(start, end) {
    start = Math.ceil(start);
    if (start === end) {
      return;
    }
    this.loadLeft(start, end);
  }

  render() {
    const bids = this.props.bids.toArray().map(priceLevel => {
      return {
        price: priceLevel[0].toString(),
        amount: priceLevel[1].toString()
      };
    });
    const asks = this.props.asks.toArray().map(priceLevel => {
      return {
        price: priceLevel[0].toString(),
        amount: priceLevel[1].toString()
      };
    });
    return (
      <>
        <div className="title flex justify-content-between align-items-center">
          <div>
            <div>Charts</div>
          </div>
        </div>

        <div className="flex-column flex-1 ">
          <div className="grid flex-2" ref={this.tradeChartWrapper}>
            <TradeChart
              theme="light"
              data={this.state.data}
              priceDecimals={5}
              styles={{ upColor: '#00d99f', downColor: '#ff6f75', background: '#FFFFFF' }}
              clickCallback={result => {
                console.log('result: ', result);
              }}
              handleLoadMore={result => {
                this.handleLoadMore(result.start, result.end);
              }}
              clickGranularity={result => {
                this.loadData(result.value);
                window.localStorage.setItem('granularityStr', result.value);
              }}
              start={this.state.start}
              end={this.state.end}
            />
          </div>
          <div className="grid flex-1 border-top">
            <DeepChart
              baseToken="HOT"
              quoteToken="DAI"
              styles={{ bidColor: '#00d99f', askColor: '#ff6f75', rowBackgroundColor: '#FFFFFF' }}
              asks={asks}
              bids={bids}
              priceDecimals={5}
              theme="light"
              clickCallback={result => {
                console.log('result: ', result);
              }}
            />
          </div>
        </div>
      </>
    );
  }
}

const mapStateToProps = state => {
  return {
    asks: state.market.getIn(['orderbook', 'asks']),
    bids: state.market.getIn(['orderbook', 'bids']),
    currentMarket: state.market.getIn(['markets', 'currentMarket'])
  };
};

export default connect(mapStateToProps)(Charts);


/*
Import necessary dependencies and components:

React is imported from the 'react' library.
connect is imported from the 'react-redux' library. It is used to connect the component to the Redux store.
DeepChart and TradeChart components are imported from the '@wangleiddex/hydro-sdk-charts' library. These components render the trading charts.
api is imported from the '../../lib/api' file. It is likely a module for making API requests.
Define the Charts class component:

The component extends the React.Component class and defines its constructor to initialize state and create a ref.
The component's state includes various properties such as granularityStr, loading, noData, data, from, to, start, end, and lastUpdatedAt.
The componentDidMount lifecycle method is called after the component is mounted in the DOM. It invokes the loadData function and sets an interval to call the loadRight function every 60 seconds.
The componentDidUpdate lifecycle method is called when the component's props or state update. It checks if the currentMarket ID has changed and resets the data if it has.
The componentWillUnmount lifecycle method is called before the component is unmounted. It clears the interval set in componentDidMount.
Define helper functions and event handlers:

loadRight is an async function that loads new data for the trading charts if a certain time interval has passed since the last update.
loadLeft is an async function that loads data to the left of the current chart range.
loadData is an async function that fetches candlestick data from an API based on the provided parameters such as granularity, timestamp range, and indexes range.
fitLengthToShow calculates the number of data points that can fit within the width of the chart container.
generateParams generates the API parameters based on the selected granularity and time range.
Render the component:

The render method returns JSX markup representing the component's UI.
The TradeChart component is used to render the trading chart. It receives various props such as theme, data, priceDecimals, styles, clickCallback, handleLoadMore, clickGranularity, start, and end.
The DeepChart component is used to render the order book. It receives props such as baseToken, quoteToken, styles, asks, bids, priceDecimals, theme, and clickCallback.
The component also renders a title and a container div.
Define the mapStateToProps function:

This function is used to map the Redux store state to the component's props.
It retrieves asks, bids, and currentMarket data from the Redux store.
Connect the component to Redux:

The connect function is used to connect the component to the Redux store and mapStateToProps function.
The connected component is then exported as the default export of the module.

*/