import React from 'react';
import './styles.scss';

class Selector extends React.PureComponent {
  render() {
    const { options, selectedValue, handleClick } = this.props;
    if (!options) {
      return null;
    }
    return (
      <div className="selector">
        <ul className="nav nav-tabs">
          {options.map(option => {
            return (
              <li
                key={option.value}
                className={`nav-item${selectedValue === option.value ? ' active' : ''}`}
                onClick={() => handleClick(option)}>
                <div className="text-center">{option.name}</div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}

export default Selector;


/*
Import necessary dependencies and styles:

The React library is imported.
The component's styles are imported from './styles.scss'.
Define the Selector class component:

The component extends the React.PureComponent class, which means it implements a shallow comparison of props and state to determine whether the component should update.
There is no constructor or state defined for this component.
Define the render method:

The method renders the UI of the component.
It destructures the options, selectedValue, and handleClick props from the component's props.
If options is falsy (null, undefined, etc.), the component returns null and doesn't render anything.
Otherwise, it renders a <div> element with the class 'selector'.
Inside this element, an unordered list <ul> with the class 'nav nav-tabs' is rendered.
For each option in the options array, a list item <li> is created.
The key prop is set to option.value, which should be a unique identifier for the option.
The class of the list item is conditionally set based on whether selectedValue matches the current option's value. If they match, the class is set to 'nav-item active'.
An onClick event listener is attached to the list item, which calls the handleClick function with the current option as an argument when clicked.
Inside the list item, a <div> element with the class 'text-center' is rendered, displaying the option.name.
Export the Selector component as the default export of the module.
*/