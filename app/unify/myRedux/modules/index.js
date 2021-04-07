import { fork } from 'redux-saga/effects';
import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import createSagaMiddleware from 'redux-saga';

import { authActions, authSagas, authReducer } from './auth';


const appReducers = combineReducers({
  auth: authReducer,
});

const sagaWatchers = function* sagaWatchers() {
  yield [
    fork(authSagas.watchAuthorizeUser),
  ];
};

const sagaMiddleware = createSagaMiddleware();

export const configureStore = (
  middlewares = [],
  enhancers = []
) => {
  const myMiddlewares = [
    apiErrorHandler,
    biMiddleware,
  ];

  const enhancer = compose(
    applyMiddleware(
      sagaMiddleware,
      ...middlewares,
      ...myMiddlewares,
    ),
    ...enhancers
    );
  const appStore = createStore(appReducers, enhancer);
  sagaMiddleware.run(sagaWatchers);
  return appStore;
};

export { authActions };
