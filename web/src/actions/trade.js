import api from '../lib/api';
import { getSelectedAccountWallet } from '@gongddex/hydro-sdk-wallet';

export const TRADE_FORM_ID = 'TRADE';

export const trade = (side, price, amount, orderType = 'limit', expires = 86400 * 365 * 1000) => {
  return async (dispatch, getState) => {
    try {
      const result = await dispatch(createOrder(side, price, amount, orderType, expires));
      if (result.status === 0) {
        alert('Successfully created order');
        return true;
      } else {
        alert(result.desc);
      }
    } catch (e) {
      alert(e);
    }

    return false;
  };
};

const createOrder = (side, price, amount, orderType, expires) => {
  return async (dispatch, getState) => {
    const state = getState();
    const currentMarket = state.market.getIn(['markets', 'currentMarket']);

    const buildOrderResponse = await api.post('/orders/build', {
      amount,
      price,
      side,
      expires,
      orderType,
      marketID: currentMarket.id
    });

    if (buildOrderResponse.data.status !== 0) {
      return buildOrderResponse.data;
    }

    const orderParams = buildOrderResponse.data.data.order;
    const { id: orderID } = orderParams;
    try {
      const wallet = getSelectedAccountWallet(state);
      const signature = await wallet.signPersonalMessage(orderID);
      const orderSignature = '0x' + signature.slice(130) + '0'.repeat(62) + signature.slice(2, 130);
      const placeOrderResponse = await api.post('/orders', {
        orderID,
        signature: orderSignature,
        method: 0
      });

      return placeOrderResponse.data;
    } catch (e) {
      alert(e);
    }
  };
};

export const tradeUpdate = trade => {
  return {
    type: 'TRADE_UPDATE',
    payload: {
      trade
    }
  };
};

export const marketTrade = trade => {
  return {
    type: 'MARKET_TRADE',
    payload: {
      trade
    }
  };
};

/*

The trade function takes in several parameters related to a trade, including the side (buy or sell), price, amount, order type, and expiration time. It then dispatches the createOrder function to create an order on the DEX. If the order is successfully created, the function returns true and displays an alert indicating that the order was successfully created. If there is an error creating the order, an alert is displayed with the error message and the function returns false.

The createOrder function takes in the same parameters as the trade function, as well as a expires parameter that specifies the expiration time for the order. It then makes a POST request to the /orders/build endpoint of the DEX's API to build the order. If the order is successfully built, the function retrieves the order ID and creates a signature for the order using the user's selected account wallet. It then makes a POST request to the /orders endpoint of the DEX's API to place the order on the blockchain. If there is an error creating the order or signing the order, an alert is displayed with the error message.

The tradeUpdate and marketTrade functions are action creators that return Redux actions with a payload containing information about a trade. These actions can be dispatched to update the state of the DEX's UI in response to a trade being executed.
*/