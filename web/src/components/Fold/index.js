import React from 'react';
import UnderlineTab from '../UnderlineTab';
import './styles.scss';

export default class Fold extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      selectedIndex: 0
    };
  }
  render() {
    const children = this.props.children;
    const child = children[this.state.selectedIndex];
    const options = [];

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      options.push({
        title: child.props['data-fold-item-title'],
        onClick: () => {
          this.setState({
            selectedIndex: i
          });
        }
      });
    }

    return (
      <div className={[this.props.className, 'fold'].join(' ')}>
        <div className="flod-header">
          <span>{this.props.title}</span>
          <UnderlineTab options={options} selectedIndex={this.state.selectedIndex} />
        </div>
        {child}
      </div>
    );
  }
}


/*
Import necessary dependencies and components:

React is imported from the 'react' library.
UnderlineTab component is imported from the '../UnderlineTab' file.
The component's styles are imported from './styles.scss'.
Define the Fold class component:

The component extends the React.PureComponent class and defines its constructor to initialize state with a selectedIndex of 0.
The component's render method is implemented to render the UI of the component.
The children prop is received, which represents the content elements that will be displayed within the foldable section.
The selectedIndex property of the component's state is used to keep track of the currently selected tab.
Generate options for the tabs:

An empty options array is created to store the options for the tabs.
A loop iterates over the children array and creates an option object for each child.
Each option object contains a title property, which is retrieved from the child's props using the attribute data-fold-item-title.
The onClick property of each option object is set to a function that updates the selectedIndex in the component's state to the index of the clicked tab.
Render the component:

The render method returns JSX markup representing the component's UI.
The component's class name is set by combining the className prop received from the parent component and the 'fold' class.
The foldable content section is wrapped inside a div element with the 'fold' class.
The fold header section is rendered, which includes the component's title and the UnderlineTab component.
The UnderlineTab component receives the options array and the selectedIndex from the component's state.
The content of the selected tab is rendered using the child variable, which represents the child element corresponding to the selected tab.
Export the component:

The component is exported as the default export of the module.
*/