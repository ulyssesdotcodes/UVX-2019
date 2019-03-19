import * as React from "react";
import * as ReactDOM from "react-dom";

import { Provider } from "react-redux";

import Operator from "./Components/Operator";
import configureStore from "./store";

const store = configureStore();

const Root = () => (
    <Provider store={store}>
        <div>Test</div>
    </Provider>
);

ReactDOM.render(<Root />, document.getElementById("root"));