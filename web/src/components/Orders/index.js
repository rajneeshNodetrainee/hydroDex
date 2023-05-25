import React from 'react';
import OpenOrders from './OpenOrders';
import Trades from './Trades';
import Selector from '../Selector';
import './styles.scss';

const OPTIONS = [{ value: 'openOrders', name: 'Open' }, { value: 'filled', name: 'Filled' }];

class Orders extends React.PureComponent {
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
          <div>
            <div>Orders</div>
            <div className="text-secondary">View your open orders</div>
          </div>
          <Selector
            options={OPTIONS}
            selectedValue={selectedAccountID}
            handleClick={option => {
              this.setState({ selectedAccountID: option.value });
            }}
          />
        </div>
        {selectedAccountID === 'openOrders' ? <OpenOrders /> : <Trades />}
      </>
    );
  }
}

export default Orders;

/*
The code begins by importing the necessary dependencies, including React, the "OpenOrders" component, the "Trades" component, the "Selector" component, and a CSS file.

The component defines a constant variable named "OPTIONS" that holds an array of objects. Each object represents an option for the selector and contains a "value" and a "name" property. In this case, the options are "Open" and "Filled".

The "Orders" component is defined as a class component that extends the "React.PureComponent" class.

In the constructor, the component initializes its state by setting the "selectedAccountID" to the value of the first option in the "OPTIONS" array.

The component's render method is defined. Inside the render method, the "selectedAccountID" is extracted from the component's state.

The render method returns a JSX fragment (<>...</>) containing the following elements:

a. A div element with the class name "title", which contains a flexbox layout. Inside this div, there are two nested divs: one for the title and one for the secondary text. This section represents the title and description of the component.

b. The "Selector" component is rendered. It receives the following props:

"options": The "OPTIONS" array, which provides the available options for the selector.
"selectedValue": The currently selected value from the component's state.
"handleClick": A callback function that will be called when an option is clicked. It updates the "selectedAccountID" in the component's state.
c. A conditional rendering statement is used to determine which component to render based on the value of "selectedAccountID". If "selectedAccountID" is 'openOrders', the "OpenOrders" component is rendered; otherwise, the "Trades" component is rendered.

Finally, the "Orders" component is exported as the default export.
*/