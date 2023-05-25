import React from 'react';
import { connect } from 'react-redux';
import './styles.scss';

class OrderBook extends React.Component {
  constructor(props) {
    super(props);
    this.lastUpdatedAt = null;
    this.forceRenderTimer = null;
  }

  // max 1 render in 1 second
  shouldComponentUpdate() {
    if (this.lastUpdatedAt) {
      const diff = new Date().valueOf() - this.lastUpdatedAt;
      const shouldRender = diff > 1000;

      if (!shouldRender && !this.forceRenderTimer) {
        this.forceRenderTimer = setTimeout(() => {
          this.forceUpdate();
          this.forceRenderTimer = null;
        }, 1000 - diff);
      }
      return shouldRender;
    } else {
      return true;
    }
  }

  componentWillUnmount() {
    if (this.forceRenderTimer) {
      clearInterval(this.forceRenderTimer);
    }
  }

  componentDidUpdate() {
    this.lastUpdatedAt = new Date();
  }

  render() {
    let { bids, asks, websocketConnected, currentMarket } = this.props;

    return (
      <div className="orderbook flex-column flex-1">
        <div className="flex header text-secondary">
          <div className="col-6 text-right">Amount</div>
          <div className="col-6 text-right">Price</div>
        </div>
        <div className="flex-column flex-1">
          <div className="asks flex-column flex-column-reverse flex-1 overflow-hidden">
            {asks
              .slice(-20)
              .reverse()
              .toArray()
              .map(([price, amount]) => {
                return (
                  <div className="ask flex align-items-center" key={price.toString()}>
                    <div className="col-6 orderbook-amount text-right">
                      {amount.toFixed(currentMarket.amountDecimals)}
                    </div>
                    <div className="col-6 text-danger text-right">{price.toFixed(currentMarket.priceDecimals)}</div>
                  </div>
                );
              })}
          </div>
          <div className="status border-top border-bottom">
            {websocketConnected ? (
              <div className="col-6 text-success">
                <i className="fa fa-circle" aria-hidden="true" /> RealTime
              </div>
            ) : (
              <div className="col-6 text-danger">
                <i className="fa fa-circle" aria-hidden="true" /> Disconnected
              </div>
            )}
          </div>
          <div className="bids flex-column flex-1 overflow-hidden">
            {bids
              .slice(0, 20)
              .toArray()
              .map(([price, amount]) => {
                return (
                  <div className="bid flex align-items-center" key={price.toString()}>
                    <div className="col-6 orderbook-amount text-right">
                      {amount.toFixed(currentMarket.amountDecimals)}
                    </div>
                    <div className="col-6 text-success text-right">{price.toFixed(currentMarket.priceDecimals)}</div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    asks: state.market.getIn(['orderbook', 'asks']),
    bids: state.market.getIn(['orderbook', 'bids']),
    loading: false,
    currentMarket: state.market.getIn(['markets', 'currentMarket']),
    websocketConnected: state.config.get('websocketConnected'),
    theme: state.config.get('theme')
  };
};

export default connect(mapStateToProps)(OrderBook);


/*

Import necessary dependencies and styles:

The React library is imported.
The connect function is imported from the 'react-redux' library to connect the component to the Redux store.
The component's styles are imported from './styles.scss'.
Define the OrderBook class component:

The component extends the React.Component class and defines its lifecycle methods and rendering logic.
The constructor initializes the component's state, including lastUpdatedAt and forceRenderTimer variables.
Define the shouldComponentUpdate method:

This method is called before a component update and determines whether the component should re-render.
It checks the time difference since the last update (lastUpdatedAt) and decides whether a render is needed.
If the time difference is greater than 1000 milliseconds (1 second), it allows rendering and resets forceRenderTimer to null.
If the time difference is less than 1000 milliseconds and forceRenderTimer is not set, it sets a timer to force a render after the remaining time.
The method returns a boolean value indicating whether the component should update/render.
Define the componentWillUnmount method:

This method is called before the component is unmounted from the DOM.
If forceRenderTimer is set, it clears the timer.
Define the componentDidUpdate method:

This method is called after the component updates.
It sets lastUpdatedAt to the current date and time.
Define the render method:

The method renders the UI of the component.
It destructures the bids, asks, websocketConnected, and currentMarket props from the component's props.
The component's UI is rendered inside a <div> element with the class 'orderbook flex-column flex-1'.
The header section is rendered with the class 'flex header text-secondary' and displays the column titles ('Amount' and 'Price').
The order book data is rendered inside a <div> element with the class 'flex-column flex-1'.
The 'asks' section displays a list of sell orders (asks) in reverse chronological order.
The 'status' section displays the current status of the WebSocket connection.
The 'bids' section displays a list of buy orders (bids) in chronological order.
Define the mapStateToProps function:

This function maps the state from the Redux store to the component's props.
It receives the state object and extracts the order book data, loading status, current market, WebSocket connection status, and theme from the state.
It returns an object with these properties to be used as props in the component.
Connect the component to the Redux store:

The connect function is used to connect the OrderBook component to the Redux store.
The mapStateToProps function is passed as an argument to connect.
The connected component is exported as the default export of the module.
*/