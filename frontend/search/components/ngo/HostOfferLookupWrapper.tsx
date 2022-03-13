import React from 'react'
import { useGetOffersQuery, useGetRwQuery } from "../../codegen/generates"
import HostOfferLookupTable from "./HostOfferLookupTable"
import { Box } from "@mui/material"
import { useTranslation } from 'react-i18next'
import { Login, useAuthStore } from '../Login'

type HostLookupWrapperProps = Record<string, never>

const HostOfferLookupWrapper = ({}: HostLookupWrapperProps) => {
  const { t } = useTranslation()
  const auth = useAuthStore()

  const staleTimeMinutes_ro = 5
  const staleTimeMinutes_rw = 1
  const queryResult_ro = useGetOffersQuery({auth}, {staleTime: staleTimeMinutes_ro * 60 * 1000})
  const queryResult_rw = useGetRwQuery({auth}, {staleTime: staleTimeMinutes_rw * 60 * 1000})

  return <>
    <div style={{minHeight: '5vh', display: 'flex'}}>  {/** TODO: a proper Header (css class) **/}
      <div>
        { (queryResult_ro.isFetching || queryResult_rw.isFetching) && t('loading…') }
        { (queryResult_ro.error || queryResult_rw.error) && t('An error occurred while trying to get data from the backend.') }
        { (queryResult_ro.data && !queryResult_ro.data.get_offers || queryResult_rw.data && !queryResult_rw.data.get_rw)
	  && t('Seems like you have no permissions. Please try to login again.') }
      </div>
      <Login/>
    </div>
    { queryResult_ro.data?.get_offers && <Box sx={{
        display: 'flex',
        alignItems: 'stretch',
        flexDirection: 'column',
        height: '95vh'}}>
        <div
          style={{flex: '1 1', height: '100%'}}>
            <HostOfferLookupTable data_ro={queryResult_ro.data}
	                          data_rw={queryResult_rw.data?.get_rw||[]}
				  refetch_rw={queryResult_rw.refetch}/>
        </div>
    </Box> }
  </>
}

export default HostOfferLookupWrapper
