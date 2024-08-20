import ConsultationSummary from '@/components/animals/consultationSummary'
import React from 'react'

export default function Dashboard() {
  return (
    <main className='flex flex-col items-center px-2 py-16'>
      <h1 className='text-4xl font-bold mb-6 text-center'>Consultations animaux</h1>
      <ConsultationSummary />
    </main>
  )
}
