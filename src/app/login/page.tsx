import { Suspense } from 'react';
import { LoginForm } from './login-form';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center page">
          <div className="h-24 w-24 skel rounded-full" />
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
