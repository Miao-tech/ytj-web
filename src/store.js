import { configureStore } from '@reduxjs/toolkit'
import storeIntegratedMachineReducer from './store_integrated_machine_slice'

export const store = configureStore({
    reducer: {
        integratedMachine: storeIntegratedMachineReducer
    },
})
    