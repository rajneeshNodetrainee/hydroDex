import React from 'react';
import { connect } from 'react-redux';
import PerfectScrollbar from 'perfect-scrollbar';
import { loadOrders, cancelOrder } from '../../actions/account';
import { getSelectedAccount } from '@gongddex/hydro-sdk-wallet';

const mapStateToProps = state => {
  const selectedAccount = getSelectedAccount(state);
  const address = selectedAccount ? selectedAccount.get('address') : null;
  return {
    orders: state.account.get('orders'),
    isLoggedIn: state.account.getIn(['isLoggedIn', address]),
    currentMarket: state.market.getIn(['markets', 'currentMarket'])
  };
};

class OpenOrders extends React.PureComponent {
  componentDidMount() {
    const { isLoggedIn, dispatch } = this.props;
    if (isLoggedIn) {
      dispatch(loadOrders());
    }
  }

  componentDidUpdate(prevProps) {
    const { isLoggedIn, dispatch, orders, currentMarket } = this.props;
    if (isLoggedIn && (isLoggedIn !== prevProps.isLoggedIn || currentMarket !== prevProps.currentMarket)) {
      dispatch(loadOrders());
    }
    if (orders !== prevProps.orders) {
      this.ps && this.ps.update();
    }
  }

  render() {
    const { orders, dispatch, currentMarket } = this.props;
    return (
      <div className="orders flex-1 position-relative overflow-hidden" ref={ref => this.setRef(ref)}>
        <table className="table">
          <thead>
            <tr className="text-secondary">
              <th className="pair-column">Pair</th>
              <th>Side</th>
              <th className="text-right">Price</th>
              <th className="text-right">Amount</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {orders
              .toArray()
              .reverse()
              .map(([id, order]) => {
                if (order.availableAmount.eq(0)) {
                  return null;
                }
                const symbol = order.marketID.split('-')[0];
                return (
                  <tr key={id}>
                    <td className="pair-column">{order.marketID}</td>
                    <td className={order.side === 'sell' ? 'text-danger' : 'text-success'}>{order.side}</td>
                    <td className="text-right">{order.price.toFixed(currentMarket.priceDecimals)}</td>
                    <td className="text-right">
                      {order.availableAmount.toFixed(currentMarket.amountDecimals)} {symbol}
                    </td>
                    <td className="text-right">
                      <button className="btn btn-outline-danger" onClick={() => dispatch(cancelOrder(order.id))}>
                        Cancel
                      </button>
                    </td>
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

export default connect(mapStateToProps)(OpenOrders);


/*
The code begins by importing necessary dependencies, including React, the connect function from react-redux, the PerfectScrollbar component, and some action creators and selectors.

The mapStateToProps function is defined. It maps the relevant state properties from the Redux store to the component's props. In this case, it extracts the orders, isLoggedIn, and currentMarket properties from the Redux store state and returns them as props.

The OpenOrders component is defined as a class component that extends the React.PureComponent class.

The componentDidMount lifecycle method is implemented. It checks if the user is logged in (isLoggedIn prop) and, if so, dispatches the loadOrders action to load the orders.

The componentDidUpdate lifecycle method is implemented. It is called whenever the component's props or state update. In this case, it checks if the user is logged in and if the isLoggedIn prop or currentMarket prop has changed. If any of these conditions are true, it dispatches the loadOrders action to reload the orders. Additionally, it checks if the orders prop has changed, and if so, it updates the PerfectScrollbar instance (this.ps) to reflect any changes in the orders.

The render method is implemented. It renders the table of open orders based on the orders prop, the dispatch function, and the currentMarket prop. The table is rendered using JSX, and each order is mapped to a table row (<tr>) element. The order details are displayed in table cells (<td>) with appropriate formatting. There is also a cancel button for each order, which dispatches the cancelOrder action when clicked.

The setRef method is implemented. It is called when the component's DOM element is mounted and receives a reference to the DOM element as an argument (ref). Inside this method, a new PerfectScrollbar instance is created and assigned to this.ps. It sets up a scrollbar for the table using the provided DOM element reference and some configuration options.

Finally, the OpenOrders component is connected to the Redux store using the connect function. The mapStateToProps function is passed as an argument to connect, which maps the state properties to the component's props.

*/