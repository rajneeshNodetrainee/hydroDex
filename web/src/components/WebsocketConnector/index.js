import React from 'react';
import { connect } from 'react-redux';
import BigNumber from 'bignumber.js';
import { loadAccountHydroAuthentication } from '../../lib/session';
import { initOrderbook, updateOrderbook } from '../../actions/orderbook';
import env from '../../lib/env';
import { setConfigs } from '../../actions/config';
import { orderUpdate, watchToken, updateTokenLockedBalances } from '../../actions/account';
import { tradeUpdate, marketTrade } from '../../actions/trade';
import { sleep } from '../../lib/utils';
import { getSelectedAccount } from '@gongddex/hydro-sdk-wallet';

const mapStateToProps = state => {
  const selectedAccount = getSelectedAccount(state);
  const address = selectedAccount ? selectedAccount.get('address') : null;
  return {
    address,
    currentMarket: state.market.getIn(['markets', 'currentMarket']),
    isLoggedIn: state.account.getIn(['isLoggedIn', address]),
    markets: state.market.getIn(['markets', 'data'])
  };
};

class WebsocketConnector extends React.PureComponent {
  constructor(props) {
    super(props);
    this.preEvents = [];
  }
  componentDidMount() {
    const { currentMarket, address, isLoggedIn } = this.props;
    this.connectWebsocket();
    if (currentMarket) {
      this.changeMarket(currentMarket.id);
    }

    if (address && isLoggedIn) {
      this.changeAccount();
    }
  }

  componentDidUpdate(prevProps) {
    const { address, currentMarket, isLoggedIn } = this.props;
    const isMarketChange = currentMarket !== prevProps.currentMarket;
    const loggedInChange = isLoggedIn !== prevProps.isLoggedIn;
    const accountChange = address !== prevProps.address;

    if (isMarketChange) {
      const market = this.props.currentMarket;
      this.changeMarket(market.id);
    }

    if (loggedInChange || accountChange) {
      if (address) {
        if (isLoggedIn) {
          this.changeAccount();
        } else {
          this.logoutLastAccount();
        }
      } else {
        this.logoutLastAccount();
      }
    }
  }

  componentWillUnmount() {
    this.logoutLastAccount();
    this.disconnectWebsocket();
  }

  render() {
    return null;
  }

  sendMessage = message => {
    if (!this.socket || this.socket.readyState !== 1) {
      this.preEvents.push(message);
      return;
    }

    this.socket.send(message);
  };

  changeMarket = marketID => {
    if (this.lastSubscribedChannel) {
      const m = JSON.stringify({
        type: 'unsubscribe',
        channels: ['Market#' + marketID]
      });
      this.sendMessage(m);
    }

    this.lastSubscribedChannel = marketID;
    const message = JSON.stringify({
      type: 'subscribe',
      channels: ['Market#' + marketID]
    });
    this.sendMessage(message);
  };

  logoutLastAccount = () => {
    const { address } = this.props;
    if (this.lastAccountAddress) {
      const message = JSON.stringify({
        type: 'unsubscribe',
        channels: ['TraderAddress#' + address]
      });

      this.sendMessage(message);
      this.lastAccountAddress = null;
    }
  };

  changeAccount = () => {
    this.logoutLastAccount();
    const { address } = this.props;

    if (!address) {
      return;
    }

    const hydroAuthentication = loadAccountHydroAuthentication(address);

    if (!hydroAuthentication) {
      return;
    }

    this.lastAccountAddress = address;

    const message = JSON.stringify({
      // type: 'accountLogin',
      type: 'subscribe',
      channels: ['TraderAddress#' + address]
      // account: address,
      // hydroAuthentication
    });
    this.sendMessage(message);
  };

  disconnectWebsocket = () => {
    if (this.socket) {
      this.socket.close();
    }
  };

  connectWebsocket = () => {
    const { dispatch } = this.props;
    this.socket = new window.ReconnectingWebSocket(`${env.WS_ADDRESS}`);
    this.socket.debug = false;
    this.socket.timeoutInterval = 5400;
    this.socket.onopen = async event => {
      dispatch(setConfigs({ websocketConnected: true }));

      // auto login & subscribe channel after reconnect
      this.changeAccount();
      if (this.lastSubscribedChannel) {
        this.changeMarket(this.lastSubscribedChannel);
      }

      // I believe this is a chrome bug
      // socket is not ready in onopen block?
      while (this.socket.readyState !== 1) {
        await sleep(30);
      }
      while (this.preEvents.length > 0) {
        this.socket.send(this.preEvents.shift());
      }
    };
    this.socket.onclose = event => {
      dispatch(setConfigs({ websocketConnected: false }));
    };
    this.socket.onerror = event => {
      console.log('wsError', event);
    };
    this.socket.onmessage = event => {
      const data = JSON.parse(event.data);
      const { currentMarket, address } = this.props;
      switch (data.type) {
        case 'level2OrderbookSnapshot':
          if (data.marketID !== currentMarket.id) {
            break;
          }

          const bids = data.bids.map(priceLevel => [new BigNumber(priceLevel[0]), new BigNumber(priceLevel[1])]);
          const asks = data.asks.map(priceLevel => [new BigNumber(priceLevel[0]), new BigNumber(priceLevel[1])]);
          dispatch(initOrderbook(bids, asks));
          break;
        case 'level2OrderbookUpdate':
          if (data.marketID !== currentMarket.id) {
            break;
          }
          dispatch(updateOrderbook(data.side, new BigNumber(data.price), new BigNumber(data.amount)));
          break;
        case 'orderChange':
          if (data.order.marketID === currentMarket.id) {
            dispatch(orderUpdate(data.order));
          }
          break;
        case 'lockedBalanceChange':
          dispatch(
            updateTokenLockedBalances({
              [data.symbol]: data.balance
            })
          );
          break;
        case 'tradeChange':
          if (data.trade.marketID === currentMarket.id) {
            dispatch(tradeUpdate(data.trade));
          }
          break;
        case 'newMarketTrade':
          if (data.trade.marketID !== currentMarket.id) {
            break;
          }
          dispatch(marketTrade(data.trade));
          if (address) {
            dispatch(
              watchToken(currentMarket.baseTokenAddress, currentMarket.baseToken, currentMarket.baseTokenDecimals)
            );
            dispatch(
              watchToken(currentMarket.quoteTokenAddress, currentMarket.quoteToken, currentMarket.quoteTokenDecimals)
            );
          }
          break;
        default:
          break;
      }
    };
  };
}

export default connect(mapStateToProps)(WebsocketConnector);

/*
Import necessary dependencies:

The React library is imported.
The connect function is imported from react-redux to connect the component to the Redux store.
The BigNumber class is imported from the bignumber.js library.
Various action functions and utility functions are imported from different modules.
The getSelectedAccount function is imported from @gongddex/hydro-sdk-wallet.
Define the mapStateToProps function:

This function maps the Redux state to the component's props.
It retrieves the selected account's address from the Redux state.
It returns an object with address, currentMarket, isLoggedIn, and markets properties derived from the Redux state.
Define the WebsocketConnector class component:

The component extends the React.PureComponent class, indicating that it implements a shallow comparison of props and state to determine whether the component should update.
Implement the constructor:

The constructor initializes the component's preEvents property with an empty array.
Implement the componentDidMount method:

The method is called after the component is mounted in the DOM.
It retrieves the currentMarket, address, and isLoggedIn properties from the component's props.
It calls the connectWebsocket method to establish a WebSocket connection.
If there is a currentMarket, it calls the changeMarket method to subscribe to the market's channel.
If there is an address and the user is logged in, it calls the changeAccount method to subscribe to the trader's address channel.
Implement the componentDidUpdate method:

The method is called when the component updates.
It compares the current props with the previous props to determine if there are changes in the address, currentMarket, or isLoggedIn.
If the currentMarket has changed, it calls the changeMarket method to unsubscribe from the previous market channel and subscribe to the new one.
If the isLoggedIn or address has changed, it handles the changes by either calling the changeAccount method or calling the logoutLastAccount method.
Implement the componentWillUnmount method:

The method is called before the component is unmounted from the DOM.
It calls the logoutLastAccount method to unsubscribe from the trader's address channel.
It calls the disconnectWebsocket method to close the WebSocket connection.
Implement the render method:

The method renders nothing (returns null).
Implement various utility methods:

The sendMessage method sends a message to the WebSocket server. If the socket is not ready, the message is stored in the preEvents array until the socket becomes ready.
The changeMarket method unsubscribes from the previous market channel and subscribes to a new market channel by sending appropriate subscribe/unsubscribe messages to the server.
The logoutLastAccount method unsubscribes from the previous trader's address channel by sending an unsubscribe message to the server.
The changeAccount method handles changing the trader's account by unsubscribing from the previous address channel, loading account authentication data, and subscribing to the new address channel.
The disconnectWebsocket method closes the WebSocket connection.
Implement the connectWebsocket method:

The method establishes a WebSocket connection to the server using the ReconnectingWebSocket class.
It sets up event listeners for various WebSocket events such as onopen, onclose, onerror, and onmessage.
When the connection is opened (onopen event), it sets the websocketConnected configuration value in the Redux store, sends any pending messages from the preEvents array, and performs the necessary login and market subscription.
When the connection is closed (onclose event), it updates the websocketConnected configuration value in the Redux store.
When a message is received (onmessage event), it parses the message data and dispatches appropriate Redux actions based on the message type and the current market.
Export the connected component:

The WebsocketConnector component is connected to the Redux store using the connect function.
The mapStateToProps function is passed to connect to map the state to the component's props.
The connected component is then exported as the default export of the module.
In summary, this code sets up a WebSocket connection and handles various events and data updates received from the server, such as subscribing to market channels, handling account changes, and dispatching Redux actions to update the application state accordingly.
*/