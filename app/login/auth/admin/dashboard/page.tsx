import ConsultationSummary from '@/components/animals/consultationSummary'
import React from 'react'

export default function Dashboard() {
  return (
    <main className='flex flex-col items-center py-16'>
      <h1 className='sm:text-3xl text-2xl font-caption font-bold mb-6 text-center'>Consultations animaux</h1>
      <ConsultationSummary />
    </main>
  )
}
