import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter, withRouter } from 'react-router-dom';
import "isomorphic-fetch";

import { EventGenerator } from 'events'; // app\unify\events\EventGenerator.js
import App from 'containers/App/App';

// Load all the base styles/fonts.
import 'theme/globalStyles.scss';

const store = configureStore(
    window.__data,
    [],
    [window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()]
);

const MainApp = withRouter(App);

const app = (
    <Provider store={store}>
        <BrowserRouter>
            <MainApp />
        </BrowserRouter>
    </Provider>
);


const appContentElement = document.getElementById('content');
if (!appContentElement) {
    throw new Error(
        'HTML doesn`t have element with id `content`, so not sure where to throw html contents'
    );
}

render(app, document.getElementById('content'));


if (__DEVELOPMENT__) {
    if (module.hot) {
        module.hot.accept();
    }
}
