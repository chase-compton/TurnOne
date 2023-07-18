import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import type { PropsWithChildren } from "react";

const WelcomeCard = () => {
  const { isSignedIn } = useUser();

  return (
    <div className="card m-6 h-96 w-96 flex-1 bg-base-300 text-accent-content shadow-xl">
      <figure className="px-10 pt-10">
        <Image
          src="/../public/racing-car.png"
          alt="logo"
          className="rounded-xl"
          width={100}
          height={100}
        />
      </figure>
      <div className="card-body items-center text-center">
        <h2 className="card-title">Welcome to TurnOne!</h2>
        <p>A place to post Formula 1 related opinions and takes.</p>
        {!isSignedIn && (
          <div className="card-actions">
            <SignInButton>
              <button className="btn bg-red-600 text-accent-content hover:bg-red-800">
                Sign In
              </button>
            </SignInButton>
          </div>
        )}
        {isSignedIn && (
          <div className="card-actions">
            <SignOutButton>
              <button className="btn bg-red-600 text-accent-content hover:bg-red-800">
                Sign Out
              </button>
            </SignOutButton>
          </div>
        )}
      </div>
    </div>
  );
};

const AboutCard = () => {
  return (
    <div className="card m-6 h-96 w-96 flex-1 bg-base-300 text-accent-content shadow-xl">
      <figure className="px-10 pt-10">
        <Image
          src="/../public/racing.png"
          alt="logo"
          className="rounded-xl"
          width={100}
          height={100}
        />
      </figure>
      <div className="card-body items-center text-center">
        <h2 className="card-title">About TurnOne</h2>
        <p>
          TurnOne was created as a learning exercise and new features will be
          added slowly. In the meantime enjoy reading the feed and be respectful
          with each post.
        </p>
      </div>
    </div>
  );
};

export const PageLayout = (props: PropsWithChildren) => {
  return (
    <main className="overflow-none flex h-screen justify-center">
      <WelcomeCard />
      <div className="flex h-full w-full flex-col border-x border-slate-500 md:max-w-2xl">
        {props.children}
      </div>
      <AboutCard />
    </main>
  );
};
