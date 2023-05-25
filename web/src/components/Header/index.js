import React from 'react';
import { loginRequest, login } from '../../actions/account';
import { updateCurrentMarket } from '../../actions/markets';
import { connect } from 'react-redux';
import { WalletButton, getSelectedAccount } from '@gongddex/hydro-sdk-wallet';
import './styles.scss';
import { loadAccountHydroAuthentication } from '../../lib/session';

const mapStateToProps = state => {
  const selectedAccount = getSelectedAccount(state);
  const address = selectedAccount ? selectedAccount.get('address') : null;
  return {
    address,
    isLocked: selectedAccount ? selectedAccount.get('isLocked') : true,
    isLoggedIn: state.account.getIn(['isLoggedIn', address]),
    currentMarket: state.market.getIn(['markets', 'currentMarket']),
    markets: state.market.getIn(['markets', 'data'])
  };
};

class Header extends React.PureComponent {
  componentDidMount() {
    const { address, dispatch } = this.props;
    const hydroAuthentication = loadAccountHydroAuthentication(address);
    if (hydroAuthentication) {
      dispatch(login(address));
    }
  }
  componentDidUpdate(prevProps) {
    const { address, dispatch } = this.props;
    const hydroAuthentication = loadAccountHydroAuthentication(address);
    if (address !== prevProps.address && hydroAuthentication) {
      dispatch(login(address));
    }
  }
  render() {
    const { currentMarket, markets, dispatch } = this.props;
    return (
      <div className="navbar bg-blue navbar-expand-lg">
        <img className="navbar-brand" src={require('../../images/hydro.svg')} alt="hydro" />
        <div className="dropdown navbar-nav mr-auto">
          <button
            className="btn btn-primary header-dropdown dropdown-toggle"
            type="button"
            id="dropdownMenuButton"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false">
            {currentMarket && currentMarket.id}
          </button>
          <div
            className="dropdown-menu"
            aria-labelledby="dropdownMenuButton"
            style={{ maxHeight: 350, overflow: 'auto' }}>
            {markets.map(market => {
              return (
                <button
                  className="dropdown-item"
                  key={market.id}
                  onClick={() => currentMarket.id !== market.id && dispatch(updateCurrentMarket(market))}>
                  {market.id}
                </button>
              );
            })}
            {/* <button className='dropdown-item'>HOT-WWW</button> */}
          </div>
        </div>
        <button
          className="btn btn-primary collapse-toggle"
          type="button"
          data-toggle="collapse"
          data-target="#navbar-collapse"
          aria-expanded="false">
          <i className="fa fa-bars" />
        </button>
        <div className="collapse" id="navbar-collapse">
          <a
            href="https://hydroprotocol.io/developers/docs/overview/what-is-hydro.html"
            className="btn btn-primary item"
            target="_blank"
            rel="noopener noreferrer">
            DOCUMENTATION
          </a>
          <div className="item">
            <WalletButton />
          </div>

          {this.renderAccount()}
        </div>
      </div>
    );
  }

  renderAccount() {
    const { address, dispatch, isLoggedIn, isLocked } = this.props;
    if ((isLoggedIn && address) || isLocked) {
      return null;
    } else if (address) {
      return (
        <button className="btn btn-success" style={{ marginLeft: 12 }} onClick={() => dispatch(loginRequest())}>
          connect
        </button>
      );
    } else {
      return null;
    }
  }
}

export default connect(mapStateToProps)(Header);


/*
Import necessary dependencies and components:

React is imported from the 'react' library.
Various action functions and utility functions are imported from different files within the application.
The connect function is imported from the 'react-redux' library to connect the component to the Redux store.
The WalletButton component is imported from the '@gongddex/hydro-sdk-wallet' library.
The component's styles are imported from './styles.scss'.
Define the mapStateToProps function:

This function maps the state from the Redux store to the component's props.
It receives the state object and extracts the selected account, address, locked status, login status, current market, and market data from the state.
It returns an object with these properties to be used as props in the component.
Define the Header class component:

The component extends the React.PureComponent class and defines its lifecycle methods and rendering logic.
The componentDidMount method is called after the component is mounted in the DOM.
It retrieves the address and dispatch from the component's props and loads hydro authentication data for the address.
If hydro authentication data is found, it dispatches the login action to log in the user.
The componentDidUpdate method is called when the component updates.
It checks if the address prop has changed compared to the previous props and if hydro authentication data is present.
If both conditions are met, it dispatches the login action to log in the user.
The render method is implemented to render the UI of the component.
The header/navbar section is rendered with the class 'navbar bg-blue navbar-expand-lg'.
An image with the 'navbar-brand' class is rendered, displaying the 'hydro.svg' image from the '../../images' directory.
A dropdown menu is rendered using the 'dropdown' class.
The current market value is displayed as a button with a dropdown-toggle and 'header-dropdown' class.
The dropdown menu items are rendered based on the markets prop received from the Redux store.
A collapse-toggle button with the 'collapse-toggle' class is rendered to toggle the collapse of additional menu items.
The collapse section is rendered with the 'collapse' class and the ID 'navbar-collapse'.
A link to the documentation is rendered as a button with the 'btn btn-primary item' class.
The WalletButton component is rendered as an item.
The renderAccount method is called to render the account-related UI based on the login and account status.
Define the renderAccount method:

This method renders different UI based on the login and account status.
It retrieves the address, dispatch, isLoggedIn, and isLocked props from the component.
If the user is logged in and has an address, or if the account is locked, it returns null to not render anything.
If the user has an address and is not logged in, it renders a button with the 'btn btn-success' class and the text "connect".
If the user doesn't have an address, it also returns null to not render anything.
Connect the component to the Redux store:

The connect function is used to connect the Header component to the Redux store.
The mapStateToProps function is passed as an argument to connect.
The connected component is exported as the default export of the module.
*/