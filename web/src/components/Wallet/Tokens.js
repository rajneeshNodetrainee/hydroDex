import React from 'react';
import { connect } from 'react-redux';
import { loadTokens } from '../../actions/account';
import { toUnitAmount, isTokenApproved } from '../../lib/utils';
import { stateUtils } from '../../selectors/account';
import { enable, disable } from '../../lib/wallet';
import { getSelectedAccount } from '@gongddex/hydro-sdk-wallet';
import { BigNumber } from 'bignumber.js';

const mapStateToProps = state => {
  const selectedAccountID = state.WalletReducer.get('selectedAccountID');
  const selectedAccount = getSelectedAccount(state);
  const address = selectedAccount ? selectedAccount.get('address') : null;
  return {
    tokensInfo: stateUtils.getTokensInfo(state, address),
    address,
    ethBalance: toUnitAmount(state.WalletReducer.getIn(['accounts', selectedAccountID, 'balance']), 18)
  };
};

class Tokens extends React.PureComponent {
  componentDidMount() {
    const { address, dispatch } = this.props;
    if (address) {
      dispatch(loadTokens());
    }
  }

  componentDidUpdate(prevProps) {
    const { address, dispatch } = this.props;
    if (address && address !== prevProps.address) {
      dispatch(loadTokens());
    }
  }
 
  render() {
    const { dispatch, tokensInfo, ethBalance } = this.props;
    return (
      <div className="flex-column">
        <div className="token flex flex-1">
          <div className="col-6">ETH</div>
          <div className="col-6 text-right">{ethBalance.toFixed(5)}</div>
        </div>
        {tokensInfo.toArray().map(([token, info]) => {
          const { address, balance, allowance, decimals, lockedBalance } = info.toJS();
          const isApproved = isTokenApproved(allowance);
          const availableBalance = toUnitAmount(BigNumber.max(balance.minus(lockedBalance), '0'), decimals).toFixed(5);
          const toolTipTitle = `<div>In-Order: ${toUnitAmount(lockedBalance, decimals).toFixed(
            5
          )}</div><div>Total: ${toUnitAmount(balance, decimals).toFixed(5)}</div>`;
          return (
            <div key={token} className="token flex flex-1">
              <div className="flex-column col-6">
                <div>{token}</div>
                <div className="text-secondary">{isApproved ? 'Enabled' : 'Disabled'}</div>
              </div>
              <div className="col-6 text-right">
                <div
                  className="flex-column"
                  key={toolTipTitle}
                  data-html="true"
                  data-toggle="tooltip"
                  data-placement="right"
                  title={toolTipTitle}
                  ref={ref => window.$(ref).tooltip()}>
                  {availableBalance}
                </div>
                <div className="custom-control custom-switch">
                  <input
                    type="checkbox"
                    className="custom-control-input"
                    id={address}
                    checked={isApproved}
                    onChange={() => {
                      if (isApproved) {
                        dispatch(disable(address, token, decimals));
                      } else {
                        dispatch(enable(address, token, decimals));
                      }
                    }}
                  />
                  <label className="custom-control-label" htmlFor={address} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}

export default connect(mapStateToProps)(Tokens);


/*
Import necessary dependencies:

The React library is imported.
The connect function is imported from react-redux to connect the component to the Redux store.
The loadTokens action is imported from the ../../actions/account module.
Various utility functions and selectors are imported from different modules.
The BigNumber class is imported from the bignumber.js library.
Define the mapStateToProps function:

This function maps the Redux state to the component's props.
It accesses the selected account ID from the Redux state using WalletReducer.get('selectedAccountID').
It uses the getSelectedAccount function to get the selected account from the Redux state.
It extracts the address from the selected account or sets it to null if the selected account is not available.
It returns an object with tokensInfo, address, and ethBalance properties derived from the Redux state.
Define the Tokens class component:

The component extends the React.PureComponent class, indicating that it implements a shallow comparison of props and state to determine whether the component should update.
Implement lifecycle methods:

The componentDidMount method is called after the component is mounted in the DOM. It checks if the address prop is available and dispatches the loadTokens action.
The componentDidUpdate method is called when the component updates. It checks if the address prop has changed and dispatches the loadTokens action if it has.
Implement the render method:

The method renders the UI of the component.
It destructures the dispatch, tokensInfo, and ethBalance properties from the component's props.
The component renders a <div> element with the class 'flex-column'.
Inside this <div>, it renders the ETH token information in a separate <div> with the classes 'token', 'flex', and 'flex-1'.
The ETH token information consists of two columns: the token name ('ETH') and the ETH balance displayed with five decimal places.
The component then iterates over the tokensInfo object using the map function, rendering each token's information.
For each token, it extracts the address, balance, allowance, decimals, and lockedBalance properties.
It checks if the token is approved by calling the isTokenApproved function and stores the result in the isApproved variable.
It calculates the available balance by subtracting the lockedBalance from the balance, converting it to the appropriate decimal places using toUnitAmount, and formatting it with five decimal places.
It constructs a tooltip title with the in-order balance and total balance of the token.
It renders a <div> element with the classes 'token', 'flex', and 'flex-1' for each token.
Inside this <div>, it renders the token name and the approval status ('Enabled' or 'Disabled') in a nested <div>.
It renders the available balance in a nested <div> with a tooltip that shows the in-order balance and total balance.
It renders a custom switch input with a checkbox that is checked if the token is approved.
It attaches an onChange event handler to the checkbox that dispatches either the disable or enable action based on the current approval status.
Connect the component to the Redux store:

The connect function is used to connect the Tokens component to the Redux store.
The mapStateToProps function is passed as the argument to connect to map the state to the component's props.
The Tokens component is then wrapped with the connected component returned by connect.
In summary, this code defines a Tokens component that connects to the Redux store and displays a list of tokens in a wallet interface. It fetches token information, including balances and approval statuses, from the store and renders them along with the ETH balance. Users can enable or disable tokens by interacting with the custom switch input.
*/