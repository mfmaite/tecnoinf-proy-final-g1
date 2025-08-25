import { SignUpForm } from '@/components/sign-up-form/sign-up-form';
import clsx from 'clsx';
import styles from './signup.module.scss';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className={clsx(
          styles.h1,
          'text-center',
        )}>
          Crear una cuenta
        </h2>

        <p className="mt-2 text-center text-sm text-gray-600">
          ¿Ya tienes una cuenta?{' '}
          <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
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
