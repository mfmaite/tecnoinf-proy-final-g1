import { SignUpForm } from '@/components/sign-up-form/sign-up-form';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background-main">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-h1 font-bold font-playfair text-primary-color-100">
          Crear una cuenta
        </h2>

        <p className="mt-2 text-center text-text-medium text-secondary-color-90">
          ¿Ya tienes una cuenta?{' '}
          <a href="/login" className="font-medium text-secondary-color-50 hover:text-secondary-color-70">
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
