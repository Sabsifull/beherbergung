import { gql } from 'graphql-request'

export const login = gql`
  query Login($auth: Auth!) {
    login(auth: $auth) {jwt}
  }`

export const get_offers = gql`
  query GetOffers($auth: Auth!) {
    get_offers(auth: $auth) {
      time_from_str
      time_duration_str
      beds
      languages
      place_country
      place_city
      place_zip
      place_street
      place_street_number
      accessible
      animals_allowed
      animals_present
      contact_name_full
      contact_phone
      contact_email
      note
    }
  }`