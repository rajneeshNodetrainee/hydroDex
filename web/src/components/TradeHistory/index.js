import React from 'react';
import { connect } from 'react-redux';
import BigNumber from 'bignumber.js';
import PerfectScrollbar from 'perfect-scrollbar';
import moment from 'moment';

const mapStateToProps = state => {
  return {
    tradeHistory: state.market.get('tradeHistory'),
    currentMarket: state.market.getIn(['markets', 'currentMarket'])
  };
};

class TradeHistory extends React.PureComponent {
  componentDidUpdate(prevProps) {
    const { tradeHistory } = this.props;
    if (tradeHistory !== prevProps.tradeHistory) {
      this.ps.update();
    }
  }

  render() {
    const { tradeHistory, currentMarket } = this.props;
    return (
      <div className="trade-history flex-1 position-relative overflow-hidden" ref={ref => this.setRef(ref)}>
        <table className="table">
          <thead>
            <tr className="text-secondary">
              <th className="text-right">Price</th>
              <th className="text-right">Amount</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {tradeHistory
              .toArray()
              .reverse()
              .map(([id, trade]) => {
                const colorGreen = trade.takerSide === 'buy';
                return (
                  <tr key={trade.id}>
                    <td className={['text-right', colorGreen ? 'text-success' : 'text-danger'].join(' ')}>
                      {new BigNumber(trade.price).toFixed(currentMarket.priceDecimals)}
                      {trade.takerSide === 'buy' ? (
                        <i className="fa fa-arrow-up" aria-hidden="true" />
                      ) : (
                        <i className="fa fa-arrow-down" aria-hidden="true" />
                      )}
                    </td>
                    <td className="text-right">{new BigNumber(trade.amount).toFixed(currentMarket.amountDecimals)}</td>
                    <td className="text-secondary">{moment(trade.executedAt).format('HH:mm:ss')}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    );
  }

  setRef(ref) {
    if (ref) {
      this.ps = new PerfectScrollbar(ref, {
        suppressScrollX: true,
        maxScrollbarLength: 20
      });
    }
  }
}

export default connect(mapStateToProps)(TradeHistory);

/*
Import necessary dependencies:

The React library is imported.
The connect function from react-redux is imported to connect the component to the Redux store.
The BigNumber class from the bignumber.js library is imported for precise number handling.
The PerfectScrollbar library is imported for creating a custom scrollbar.
The moment library is imported for formatting timestamps.
Define the mapStateToProps function:

This function maps the state from the Redux store to the component's props.
It returns an object with two properties: tradeHistory and currentMarket.
tradeHistory is obtained from the market slice of the state.
currentMarket is obtained from the markets slice of the state.
Define the TradeHistory class component:

The component extends the React.PureComponent class, indicating that it implements a shallow comparison of props and state to determine whether the component should update.
There is no constructor or state defined for this component.
Define the componentDidUpdate lifecycle method:

This method is called when the component updates.
It compares the tradeHistory prop with the previous tradeHistory prop (prevProps.tradeHistory) to check if there have been any changes.
If there are changes, it updates the PerfectScrollbar instance (this.ps) to reflect the new trade history.
Define the render method:

The method renders the UI of the component.
It destructures the tradeHistory and currentMarket props from the component's props.
The component uses a ref callback (ref => this.setRef(ref)) to set a reference to the component's DOM element.
Inside the component's DOM element, a <table> element with the class 'table' is rendered.
Inside the table, a <thead> element contains a row with three table headers: 'Price', 'Amount', and 'Time'.
Inside the <tbody> element, the trade history is iterated over.
Each trade is represented as a table row <tr>.
The trade price is displayed in the first column, with the class 'text-right'.
The price is formatted using BigNumber(trade.price).toFixed(currentMarket.priceDecimals).
A green arrow icon (fa-arrow-up) or a red arrow icon (fa-arrow-down) is displayed based on the takerSide property of the trade.
The trade amount is displayed in the second column, with the class 'text-right'.
The amount is formatted using BigNumber(trade.amount).toFixed(currentMarket.amountDecimals).
The trade execution time is displayed in the third column, formatted using moment(trade.executedAt).format('HH:mm:ss').
Define the setRef method:

This method is used as the ref callback to set the reference to the component's DOM element.
When the reference is set, it creates a new instance of PerfectScrollbar and assigns it to this.ps.
The PerfectScrollbar instance is customized with the suppressScrollX and maxScrollbarLength options.
Export the TradeHistory component as the default export of the module, connected to the Redux store using connect(mapStateToProps).
*/