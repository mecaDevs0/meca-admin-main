import { use } from 'react'
import PageClient from './PageClient'

export function generateStaticParams() {
  return [{ id: 'index' }]
}

export default function WorkshopDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <PageClient id={id} />
}
