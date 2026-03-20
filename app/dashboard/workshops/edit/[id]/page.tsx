import PageClient from './PageClient'

export function generateStaticParams() {
  return [{ id: 'index' }]
}

export default function EditWorkshopPage() {
  return <PageClient />
}
