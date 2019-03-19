import * as React from "react";
import * as ReactDOM from "react-dom";
import { Router, Route, Switch } from "react-router-dom";

import { Provider } from "react-redux";

import Operator from "./Components/Operator";
import Client from "./Components/Client";
import configureStore from "./store";
import { createHashHistory } from "history";

const store = configureStore();

const Root = () => (
    <Provider store={store}>
        <Router history={createHashHistory()}>
            <Route exact path="/" component={Client} />
            <Route path="/operator" component={Operator} />
        </Router>
    </Provider>
);

ReactDOM.render(<Root />, document.getElementById("root"));