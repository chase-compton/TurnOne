import type { RouterOutputs } from "~/utils/api";

import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";

import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["posts"]["getAll"][number];
export const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return (
    <div key={post.id} className=" flex gap-4 border-b border-slate-500 p-4">
      <Link href={`/@${author.username}`}>
        <div className="avatar">
        <div className="w-16 rounded-full">
            <Image
              src={author.profileImageUrl}
              className="h-[56px] w-[56px] rounded-full object-fill"
              alt={`@${author.username}'s profile picture`}
              width={56}
              height={56}
            />
          </div>
        </div>
      </Link>
      <div className="flex-1 flex-col">
        <div className="flex gap-1 text-slate-300">
          <Link href={`/@${author.username}`}>
            <span>{`@${author.username} `}</span>
          </Link>
          <Link href={`/post/${post.id}`}>
            <span className="font-thin">{` · ${dayjs(
              post.createdAt
            ).fromNow()}`}</span>
          </Link>
        </div>
        <div className="">
          <Link href={`/post/${post.id}`}>
            <span className="text-xl text-slate-200">{post.content}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
