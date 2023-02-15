import { actions as searchActions } from "./SearchContacts"
import { actions as contactDetailsActions } from "./ContactDetails"

const TIME_TO_HANDLE_REQUEST = 300
let timer = 0
export const updateSearchPhrase =
  (newPhrase) =>
  (dispatch, getState, { httpApi }) => {
    dispatch(searchActions.updateSearchPhraseStart({ newPhrase }))

    clearTimeout(timer)
    timer = setTimeout(
      () =>
        httpApi
          .getFirst5MatchingContacts({ namePart: newPhrase })
          .then(({ data }) => {
            const matchingContacts = data.map((contact) => ({
              id: contact.id,
              value: contact.name,
            }))
            dispatch(
              searchActions.updateSearchPhraseSuccess({ matchingContacts }),
            )
          })
          .catch(() => {
            dispatch(searchActions.updateSearchPhraseFailure())
          }),
      TIME_TO_HANDLE_REQUEST,
    )
  }

export const selectMatchingContact =
  (selectedMatchingContact) =>
  (dispatch, getState, { httpApi, dataCache }) => {
    const getContactDetails = ({ id }) => {
      // Avoiding double fetch
      if (dataCache.data[id]) {
        return Promise.resolve(dataCache.data[id])
      }

      return httpApi.getContact({ contactId: id }).then(({ data }) => ({
        id: data.id,
        name: data.name,
        phone: data.phone,
        addressLines: data.addressLines,
      }))
    }

    dispatch(searchActions.selectMatchingContact({ selectedMatchingContact }))

    dispatch(contactDetailsActions.fetchContactDetailsStart())

    getContactDetails({ id: selectedMatchingContact.id })
      .then((contactDetails) => {
        dataCache.store({
          key: contactDetails.id,
          value: contactDetails,
        })
        dispatch(
          contactDetailsActions.fetchContactDetailsSuccess({ contactDetails }),
        )
      })
      .catch(() => {
        dispatch(contactDetailsActions.fetchContactDetailsFailure())
      })
  }
