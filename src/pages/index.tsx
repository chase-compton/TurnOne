import Head from "next/head";
import { api } from "~/utils/api";
import React from "react";
import ReactDOM from "react-dom";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { SignIn } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import { SignOutButton } from "@clerk/nextjs";

export default function Home() {

  const user = useUser();

  const {data} = api.posts.getAll.useQuery();

  return (
    <>
      <Head>
        <title>Formula 1&trade; Takes</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0491b4] to-[#15162c]">
        <div>
          {!user.isSignedIn && <SignInButton />}
          {user.isSignedIn && <SignOutButton />}
        </div>
        <div>
          {data?.map((post)=> (<div key={post.id}>{post.content}</div>))}
        </div>
      </main>
    </>
  );
}
