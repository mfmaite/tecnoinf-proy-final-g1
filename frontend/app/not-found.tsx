import Link from 'next/link'
import { Navbar } from '@/components/navbar/navbar'
import { Button } from '@/components/button/button'

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow p-10 text-center">
            <p className="text-secondary-color-50 font-lato tracking-widest mb-2">Error</p>
            <h1 className="text-h1 text-primary-color-70">404 - Página no encontrada</h1>
            <p className="text-gray-600 mt-4">
              La página que estás buscando no existe, fue movida o el enlace es incorrecto.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link
                href={`/`}
                className="text-sm text-secondary-color-70 hover:text-secondary-color-50 underline"
              >
                Ir al inicio
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}


