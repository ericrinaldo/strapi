import produce from 'immer';
import { set } from 'lodash';

const initialState = {
  isLoading: true,
  initialData: {},
  modifiedData: {},
};

const reducer = (state, action) =>
  // eslint-disable-next-line consistent-return
  produce(state, draftState => {
    switch (action.type) {
      case 'GET_DATA': {
        draftState.isLoading = true;
        draftState.initialData = {};
        draftState.modifiedData = {};

        break;
      }

      case 'GET_DATA_SUCCEEDED': {
        draftState.isLoading = false;
        draftState.initialData = action.data;
        draftState.modifiedData = action.data;

        break;
      }
      case 'GET_DATA_ERROR': {
        draftState.isLoading = true;
        break;
      }
      case 'ON_CHANGE': {
        console.log(action.keys);
        set(draftState, ['modifiedData', ...action.keys.split('.')], action.value);
        break;
      }
      default: {
        return draftState;
      }
    }
  });

export default reducer;
export { initialState };
