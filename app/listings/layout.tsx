export const metadata = {
  title: 'Listings - Vanish Marketplace',
  description: 'Browse available listings on Vanish Marketplace',
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

