import { api } from "~/utils/api";
import React, { useState } from "react";
import { useUser} from "@clerk/nextjs";
import { toast } from "react-hot-toast";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { PageLayout } from "~/components/layout";
import { PostView } from "~/components/postview";
import Image from "next/image";

const CreatePostWizard = () => {
  const { user } = useUser();

  const [input, setInput] = useState("");

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate();
    },

    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to post! Please try again later.");
      }
    },
  });

  if (!user) return null;

  return (
    <div className="flex w-full gap-4">
      <div className="avatar">
        <div className="w-16 rounded-full">
          <Image
            src={user.profileImageUrl}
            className="h-[56px] w-[56px] rounded-full object-fill"
            alt={`@${user.username ?? "user"}'s profile picture`}
            width={56}
            height={56}
          />
        </div>
      </div>
      <input
        placeholder="What's up?"
        className="input input-bordered w-full"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (input !== "") {
              mutate({ content: input });
            }
          }
        }}
        disabled={isPosting}
      />
      {input !== "" && !isPosting && (
        <button
          type="button"
          onClick={() => mutate({ content: input })}
          className="btn bg-red-600 text-slate-200 hover:bg-red-800"
        >
          Post
        </button>
      )}

      {isPosting && (
        <div className="flex items-center justify-center">
          <LoadingSpinner size={30} />
        </div>
      )}
    </div>
  );
};

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if (postsLoading)
    return (
      <div className="flex align-middle">
        <LoadingPage />
      </div>
    );

  if (!data) return <div className="flex-grow flex-col border-b border-slate-400">Something went wrong...</div>;

  return (
    <div className="flex-grow flex-col overflow-x-hidden overflow-y-auto border-b border-slate-400">
      {data?.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

export default function Home() {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  api.posts.getAll.useQuery();

  if (!userLoaded) return <div />;

  return (
    <PageLayout>
      {isSignedIn && (
        <div className="card rounded-b-none bg-gray-800 p-4">
          <CreatePostWizard />
        </div>
      )}
      <Feed />
    </PageLayout>
  );
}
