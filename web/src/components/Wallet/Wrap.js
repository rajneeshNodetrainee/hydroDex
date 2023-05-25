import React from 'react';
import { connect } from 'react-redux';
import BigNumber from 'bignumber.js';
import { wrapETH, unwrapWETH } from '../../lib/wallet';
import { toUnitAmount } from '../../lib/utils';
import { stateUtils } from '../../selectors/account';
import { getSelectedAccount } from '@gongddex/hydro-sdk-wallet';

const mapStateToProps = state => {
  const WETH = state.config.get('WETH');
  const selectedAccount = getSelectedAccount(state);
  const ethBalance = selectedAccount ? selectedAccount.get('balance') : new BigNumber('0');
  const address = selectedAccount ? selectedAccount.get('address') : null;
  const wethBalance = stateUtils.getTokenAvailableBalance(state, address, 'WETH');
  return {
    ethBalance: toUnitAmount(ethBalance, 18),
    wethBalance: toUnitAmount(wethBalance, WETH.decimals)
  };
};

class Wrap extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      amount: ''
    };
  }

  componentDidUpdate(prevProps) {
    const { type } = this.props;
    if (type !== prevProps.type) {
      this.setState({ amount: '' });
    }
  }

  render() {
    const { ethBalance, wethBalance, type } = this.props;
    const { amount } = this.state;
    const isWrap = type === 'wrap';

    return (
      <form className="form flex-column text-secondary flex-1 justify-content-between block">
        <div className="form-group">
          <label className="text-secondary">
            Amount ({isWrap ? ethBalance.toFixed(8) : wethBalance.toFixed(8)} Max)
          </label>
          <div className="input-group">
            <input
              className="form-control"
              value={amount}
              onChange={event => this.setState({ amount: event.target.value })}
            />
          </div>
        </div>
        <button
          type="button"
          className={`form-control btn ${isWrap ? 'btn-success' : 'btn-danger'}`}
          onClick={() => this.submit()}>
          {type}
        </button>
      </form>
    );
  }

  submit() {
    const { dispatch, type } = this.props;
    const { amount } = this.state;
    if (type === 'wrap') {
      dispatch(wrapETH(amount));
    } else {
      dispatch(unwrapWETH(amount));
    }
  }
}

export default connect(mapStateToProps)(Wrap);

/*
Import necessary dependencies:

The React library is imported.
The connect function is imported from react-redux to connect the component to the Redux store.
The BigNumber class is imported from the bignumber.js library.
Various utility functions and selectors are imported from different modules.
The wrapETH and unwrapWETH functions are imported from the ../../lib/wallet module.
Define the mapStateToProps function:

This function maps the Redux state to the component's props.
It retrieves the WETH configuration from the Redux state using state.config.get('WETH').
It uses the getSelectedAccount function to get the selected account from the Redux state.
It retrieves the ETH balance from the selected account or sets it to zero if the selected account is not available.
It extracts the address from the selected account or sets it to null if the selected account is not available.
It retrieves the available WETH balance using the getTokenAvailableBalance function from stateUtils.
It returns an object with ethBalance and wethBalance properties derived from the Redux state.
Define the Wrap class component:

The component extends the React.PureComponent class, indicating that it implements a shallow comparison of props and state to determine whether the component should update.
Implement the constructor:

The constructor initializes the component's state with an empty amount field.
Implement the componentDidUpdate method:

The method is called when the component updates.
It checks if the type prop has changed (indicating a change between wrapping and unwrapping) and resets the amount field in the component's state to an empty string.
Implement the render method:

The method renders the UI of the component.
It destructures the ethBalance, wethBalance, and type properties from the component's props.
It also extracts the amount property from the component's state.
The component renders a <form> element with the classes 'form', 'flex-column', 'text-secondary', 'flex-1', and 'justify-content-between'.
Inside the form, it renders a <div> element with the class 'form-group'.
The <div> contains a <label> element displaying the amount field with the maximum value (either ethBalance.toFixed(8) or wethBalance.toFixed(8) depending on the type).
It renders an <input> element within an <div> with the class 'input-group' for users to enter the amount.
The component also renders a <button> element with the classes 'form-control', 'btn', and either 'btn-success' or 'btn-danger' depending on the type.
The button's text is set to the value of the type prop ('wrap' or 'unwrap').
An onClick event handler is attached to the button that invokes the submit method.
Implement the submit method:

The method is called when the form is submitted.
It retrieves the dispatch and type properties from the component's props.
It retrieves the amount property from the component's state.
If the type is 'wrap', it dispatches the wrapETH action with the amount as the argument.
If the type is 'unwrap', it dispatches the unwrapWETH action with the amount as the argument.
Connect the component to the Redux store:

The connect function is used to connect the Wrap component to the Redux store.
The mapStateToProps function is passed as the argument to connect to map the state to the component's props.
The Wrap component is then wrapped with the connected component returned by connect.
*/