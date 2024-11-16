import SignUpForm from "@/components/form/signUpForm";
import { buttonVariants } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

const AuthenticationPage = async () => {
  const session = await getServerSession(authOptions);
  if (session?.user) redirect("/");
  return (
    <>
      <div className="container relative grid min-h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <Link
          href="/sign-in"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "absolute right-4 top-4 md:right-8 md:top-8"
          )}
        >
          Login
        </Link>
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
          <div className="absolute z-10 object-cover top-0 left-0 w-full h-screen brightness-75">
            <Image
              src="/auth.jpg"
              fill
              className="object-cover w-full"
              alt="Authentication"
            />
          </div>
          <div className="relative z-20 flex items-center text-lg font-medium">
            The Dream Kitchens
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                &ldquo;One place to manage all your data.&rdquo;
              </p>
              <footer className="text-sm">The Dream Kitchens</footer>
            </blockquote>
          </div>
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Create an account
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter your email below to create your account
              </p>
            </div>
            <SignUpForm />
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthenticationPage;
