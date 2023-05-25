import React from 'react';
import './styles.scss';

export default class UnderlineTab extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      underlineClassName: 'underline'
    };
    this.mounted = false;
  }

  componentDidMount() {
    window.addEventListener('load', () => {
      this.forceUpdate();
    });
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  render() {
    const { options, selectedIndex } = this.props;
    const optionsElements = [];

    for (let i = 0; i < options.length; i++) {
      const option = options[i];
      optionsElements.push(
        <div key={option.title} className={`item${i === selectedIndex ? ` active` : ''}`} onClick={option.onClick}>
          {option.title}
          {!this.container && i === selectedIndex ? <div className="defaultUnderline" /> : null}
        </div>
      );
    }

    let left, width;

    if (this.container) {
      const activeItem = this.container.children[selectedIndex];
      left = activeItem.offsetLeft;
      width = activeItem.offsetWidth;
    } else {
      left = 0;
      width = 0;
    }

    const underline = <div style={{ left, width }} className={this.state.underlineClassName} />;

    return (
      <div className="underlineTabContainer" ref={this.ref}>
        {optionsElements}
        {underline}
      </div>
    );
  }

  ref = ref => {
    if (!ref) {
      return;
    }
    this.container = ref;
    setTimeout(() => {
      if (this.mounted) {
        this.setState({
          underlineClassName: 'underline transition'
        });
      }
    }, 300);
  };
}


/*
Import necessary dependencies:

The React library is imported.
The component-specific styles are imported from the styles.scss file.
Define the UnderlineTab class component:

The component extends the React.PureComponent class, indicating that it implements a shallow comparison of props and state to determine whether the component should update.
The component has a constructor that initializes the state with an underlineClassName property set to 'underline'.
There is also a mounted property set to false in the constructor.
Define the componentDidMount lifecycle method:

This method is called after the component has mounted.
It adds an event listener to the window object listening for the 'load' event.
When the 'load' event is triggered, the component calls forceUpdate() to trigger a re-render.
The mounted property is set to true.
Define the componentWillUnmount lifecycle method:

This method is called when the component is about to unmount.
It sets the mounted property to false to indicate that the component is no longer mounted.
Define the render method:

The method renders the UI of the component.
It destructures the options and selectedIndex props from the component's props.
An empty array called optionsElements is initialized to store the rendered option elements.
The method iterates over the options array using a for loop.
For each option, a <div> element is created and added to the optionsElements array.
The <div> element has a key set to option.title and a class name of 'item'.
If the current option index matches the selectedIndex, the 'active' class is added to the element.
The onClick event handler for the option is set to option.onClick.
The option title is rendered inside the <div> element.
If the this.container is not defined (initially), and the current option index matches the selectedIndex, a <div> element with the class name 'defaultUnderline' is rendered.
The variables left and width are calculated based on the active item's position and size within the this.container.
If this.container is not defined, both left and width are set to 0.
A <div> element representing the underline effect is created with a style object containing the calculated left and width values and the underlineClassName class.
The underline element is assigned to the underline variable.
Define the ref method using an arrow function:

This method is used as the ref callback to set a reference to the component's DOM element.
If the passed-in ref is falsy, the method returns early.
The this.container property is assigned the reference.
After a timeout of 300 milliseconds, a check is performed to ensure the component is still mounted.
If it is, the state is updated, setting underlineClassName to 'underline transition'.
The ref method is assigned to a class property using the new class property syntax introduced in ES6.

The component is exported as the default export of the module
*/