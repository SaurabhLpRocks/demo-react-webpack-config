import { takeLatest } from 'redux-saga/effects';
import { types } from './types';


export function* authorizeUser1(action) {
 
}


const watchAuthorizeUser = function* watchAuthorizeUser() {
  yield takeLatest(types.AUTHORIZING_USER, authorizeUser1);
};


export { watchAuthorizeUser};
