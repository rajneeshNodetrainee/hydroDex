import React from 'react';
import PerfectScrollbar from 'perfect-scrollbar';
import Selector from '../Selector';
import Tokens from './Tokens';
import Wrap from './Wrap';
import './styles.scss';

const OPTIONS = [
  { value: 'tokens', name: 'Tokens' },
  { value: 'wrap', name: 'Wrap' },
  { value: 'unwrap', name: 'Unwrap' }
];

class Wallet extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedAccountID: OPTIONS[0].value
    };
  }

  render() {
    const { selectedAccountID } = this.state;
    return (
      <>
        <div className="title flex justify-content-between align-items-center">
          <div>Wallet</div>
          <Selector
            options={OPTIONS}
            selectedValue={selectedAccountID}
            handleClick={option => {
              this.setState({ selectedAccountID: option.value });
            }}
          />
        </div>
        <div className="flex-column flex-1 position-relative overflow-hidden" ref={ref => this.setRef(ref)}>
          {this.renderTabPanel()}
        </div>
      </>
    );
  }

  renderTabPanel() {
    const { selectedAccountID } = this.state;
    switch (selectedAccountID) {
      case 'tokens':
        return <Tokens />;
      case 'wrap':
        return <Wrap type="wrap" />;
      case 'unwrap':
        return <Wrap type="unwrap" />;
      default:
        return <Tokens />;
    }
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

export default Wallet;

/*
Import necessary dependencies:

The React library is imported.
The PerfectScrollbar library is imported for creating a custom scrollbar.
The Selector component is imported from '../Selector'.
The Tokens component is imported from './Tokens'.
The Wrap component is imported from './Wrap'.
The component-specific styles are imported from the 'styles.scss' file.
Define the OPTIONS constant:

It is an array of objects representing the options available in the wallet.
Each option object has a value property representing the value of the option and a name property representing the display name of the option.
Define the Wallet class component:

The component extends the React.PureComponent class, indicating that it implements a shallow comparison of props and state to determine whether the component should update.
The component has a constructor that initializes the state with a selectedAccountID property set to the value of the first option in the OPTIONS array.
Define the render method:

The method renders the UI of the component.
It destructures the selectedAccountID property from the component's state.
The component renders a <div> element with the class 'title', containing the title "Wallet" and a Selector component.
The Selector component is passed the OPTIONS array as options, the selectedAccountID as selectedValue, and a handleClick callback function to update the selected account ID when an option is clicked.
The component also renders a <div> element with the classes 'flex-column', 'flex-1', 'position-relative', and 'overflow-hidden'.
The reference to this <div> element is set using the ref callback function to create a custom scrollbar.
Inside this <div>, the renderTabPanel method is called to render the content based on the selected account ID.
Define the renderTabPanel method:

This method renders the content based on the selected account ID.
It destructures the selectedAccountID property from the component's state.
It uses a switch statement to determine which content to render based on the selectedAccountID.
If the selectedAccountID is 'tokens', the Tokens component is rendered.
If the selectedAccountID is 'wrap', the Wrap component is rendered with the type prop set to 'wrap'.
If the selectedAccountID is 'unwrap', the Wrap component is rendered with the type prop set to 'unwrap'.
If none of the cases match, the Tokens component is rendered by default.
Define the setRef method:

This method is used as the ref callback to set a reference to the component's DOM element.
If the passed-in ref is truthy, a new instance of PerfectScrollbar is created and assigned to this.ps.
The PerfectScrollbar instance is customized with the suppressScrollX and maxScrollbarLength options.
The component is exported as the default export of the module.
*/