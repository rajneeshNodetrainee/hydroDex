import React from 'react';
import { connect } from 'react-redux';
import { loadTrades } from '../../actions/account';
import PerfectScrollbar from 'perfect-scrollbar';
import { getSelectedAccount } from '@gongddex/hydro-sdk-wallet';
import BigNumber from 'bignumber.js';

const mapStateToProps = state => {
  const selectedAccount = getSelectedAccount(state);
  const address = selectedAccount ? selectedAccount.get('address') : null;
  return {
    address,
    trades: state.account.get('trades'),
    isLoggedIn: state.account.getIn(['isLoggedIn', address]),
    currentMarket: state.market.getIn(['markets', 'currentMarket'])
  };
};

class Trades extends React.PureComponent {
  componentDidMount() {
    const { isLoggedIn, dispatch } = this.props;
    if (isLoggedIn) {
      dispatch(loadTrades());
    }
  }

  componentDidUpdate(prevProps) {
    const { isLoggedIn, dispatch, trades, currentMarket } = this.props;
    if (isLoggedIn && (isLoggedIn !== prevProps.isLoggedIn || currentMarket !== prevProps.currentMarket)) {
      dispatch(loadTrades());
    }

    if (trades !== prevProps.trades) {
      this.ps && this.ps.update();
    }
  }

  render() {
    const { trades, address, currentMarket } = this.props;
    return (
      <div className="trades flex-1 position-relative overflow-hidden" ref={ref => this.setRef(ref)}>
        <table className="table">
          <thead>
            <tr className="text-secondary">
              <th className="pair-column">Pair</th>
              <th>Side</th>
              <th className="text-right">Price</th>
              <th className="text-right">Amount</th>
              <th className="text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {trades
              .toArray()
              .reverse()
              .map(([id, trade]) => {
                let side;
                if (trade.taker === address) {
                  side = trade.takerSide;
                } else {
                  side = trade.takerSide === 'buy' ? 'sell' : 'buy';
                }

                let status;
                let className = 'text-right ';
                if (trade.status === 'successful') {
                  status = <i className="fa fa-check" aria-hidden="true" />;
                  className += 'text-success';
                } else if (trade.status === 'pending') {
                  status = <i className="fa fa-circle-o-notch fa-spin" aria-hidden="true" />;
                } else {
                  className += 'text-danger';
                  status = <i className="fa fa-close" aria-hidden="true" />;
                }
                const symbol = trade.marketID.split('-')[0];
                return (
                  <tr key={id}>
                    <td className="pair-column">{trade.marketID}</td>
                    <td className={`${side === 'sell' ? 'text-danger' : 'text-success'}`}>{side}</td>
                    <td className={`text-right${side === 'sell' ? ' text-danger' : ' text-success'}`}>
                      {new BigNumber(trade.price).toFixed(currentMarket.priceDecimals)}
                    </td>
                    <td className="text-right">
                      {new BigNumber(trade.amount).toFixed(currentMarket.amountDecimals)} {symbol}
                    </td>
                    <td className={className}>{status}</td>
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

export default connect(mapStateToProps)(Trades);


/*
The code begins by importing necessary dependencies, including React, the connect function from react-redux, the PerfectScrollbar component, and some action creators and selectors. It also imports the BigNumber class from the bignumber.js library.

The mapStateToProps function is defined. It maps the relevant state properties from the Redux store to the component's props. In this case, it extracts the address, trades, isLoggedIn, and currentMarket properties from the Redux store state and returns them as props.

The Trades component is defined as a class component that extends the React.PureComponent class.

The componentDidMount lifecycle method is implemented. It checks if the user is logged in (isLoggedIn prop) and, if so, dispatches the loadTrades action to load the trades.

The componentDidUpdate lifecycle method is implemented. It is called whenever the component's props or state update. In this case, it checks if the user is logged in and if the isLoggedIn prop or currentMarket prop has changed. If any of these conditions are true, it dispatches the loadTrades action to reload the trades. Additionally, it checks if the trades prop has changed, and if so, it updates the PerfectScrollbar instance (this.ps) to reflect any changes in the trades.

The render method is implemented. It renders the table of trades based on the trades prop, the address prop, and the currentMarket prop. The table is rendered using JSX, and each trade is mapped to a table row (<tr>) element. The trade details are displayed in table cells (<td>) with appropriate formatting. The status of each trade is also displayed using icons (<i>), indicating whether the trade is successful, pending, or unsuccessful.

The setRef method is implemented. It is called when the component's DOM element is mounted and receives a reference to the DOM element as an argument (ref). Inside this method, a new PerfectScrollbar instance is created and assigned to this.ps. It sets up a scrollbar for the table using the provided DOM element reference and some configuration options.

Finally, the Trades component is connected to the Redux store using the connect function. The mapStateToProps function is passed as an argument to connect, which maps the state properties to the component's props.

*/