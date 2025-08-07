export const metadata = {
  title: 'Listings - Wrkx Marketplace',
  description: 'Browse available listings on Wrkx Marketplace',
}

export default function ListingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section className="flex-1 bg-gradient-to-b from-black to-gray-900/30">
      {children}
    </section>
  )
}

