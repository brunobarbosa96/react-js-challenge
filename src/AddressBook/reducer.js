import { combineReducers } from "redux"

import { reducer as searchReducer } from "./SearchContacts"
import { reducer as contactsReducer } from "./ContactDetails"

export default combineReducers({
  search: searchReducer,
  contacts: contactsReducer,
})
