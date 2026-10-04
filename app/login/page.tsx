import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto grid min-h-screen max-w-5xl place-items-center px-4 pb-10 pt-24 sm:px-6 lg:px-8">
      <div className="grid w-full gap-6 lg:grid-cols-[1fr_420px] lg:items-center">
        <section>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-chili">Kanto Finds account</p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-charcoal sm:text-6xl sm:leading-none">Your saved stalls, reviews, and food finds in one place.</h2>
        </section>
        <LoginForm />
      </div>
    </main>
  );
}
