require('colors');

const reducer = require('./reducer');

const Redux = require('redux');

const store = Redux.createStore(reducer);

store.dispatch = addLoggingToDispatch(store);

function addLoggingToDispatch(store) {
  const rawDispatch = store.dispatch;
  return (action) => {
    console.log(`> Action: ${action.type}, (Keys:  ${Object.keys(action).join(', ')})`.gray);
    // console.log('> prev state'.gray, store.getState().lastBlock);
    // console.log(`> `.green);
    const returnValue = rawDispatch(action);
    // console.log('> next state'.green, store.getState());
    // console.log(action.type.green);
    return returnValue;
  }
}

module.exports = store;
