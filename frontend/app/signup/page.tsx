import { SignUpForm } from '@/components/sign-up-form/sign-up-form';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background-alt">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="font-playfair text-center font-bold text-h1 text-primary-900">
          Crear una cuenta
        </h2>

        <p className="mt-2 text-center text-text-medium text-secondary-900">
          ¿Ya tienes una cuenta?{' '}
          <a href="/login" className="font-medium text-secondary-500 hover:text-secondary-700">
            Inicia sesión
          </a>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <SignUpForm />
        </div>
      </div>
    </div>
  );
}
