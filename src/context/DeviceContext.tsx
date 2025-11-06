import React, { createContext, useContext, useState, ReactNode } from 'react'

export interface ConnectedDevice {
  id: string
  name: string
  type: 'phone' | 'tablet' | 'laptop' | 'desktop'
  cpu: number
  gpu: number
  ram: number
  model: string
  os: string
  connectedAt: number
  lastUpdate: number
}

interface DeviceContextType {
  connectedDevices: ConnectedDevice[]
  setConnectedDevices: React.Dispatch<React.SetStateAction<ConnectedDevice[]>>
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined)

export const DeviceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>([])

  return (
    <DeviceContext.Provider value={{ connectedDevices, setConnectedDevices }}>
      {children}
    </DeviceContext.Provider>
  )
}

export const useDevices = () => {
  const context = useContext(DeviceContext)
  if (!context) {
    throw new Error('useDevices must be used within a DeviceProvider')
  }
  return context
}
