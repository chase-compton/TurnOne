import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { PageLayout } from "~/components/layout";
import Image from "next/image";
import { LoadingPage } from "~/components/loading";
import { PostView } from "~/components/postview";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import Link from "next/link";

const ProfileFeed = (props: { userId: string }) => {
  const { data, isLoading } = api.posts.getPostsByUserId.useQuery({
    userId: props.userId,
  });

  if (isLoading) return <LoadingPage />;

  if (!data || data.length === 0) return <div>User has not posted</div>;

  return (
    <div className="flex-grow flex-col overflow-y-auto">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { data } = api.profile.getUserByUsername.useQuery({
    username,
  });
  if (!data) return <div>404</div>;
  return (
    <>
      <Head>
        <title>TurnOne - @{data.username ?? data.externalUsername}</title>
      </Head>
      <PageLayout>
        <div className="avatar relative h-36">
          <div className="absolute bottom-0 left-0 -mb-[72px] ml-4 w-36 rounded-full">
            <Image
              src={data.profileImageUrl}
              className="h-[56px] w-[56px] object-fill"
              alt={`@${data.username ?? "user"}'s profile picture`}
              width={56}
              height={56}
            />
          </div>
        </div>
        <div className="h-[64px]"></div>
          <div className="p-4 pt-10 text-2xl font-bold">{`@${
            data.username ?? data.externalUsername ?? "unknown"
          }`}</div>
        <div className="w-full border-b border-slate-500" />
        <ProfileFeed userId={data.id} />
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();

  const slug = context.params?.slug;

  if (typeof slug !== "string") throw new Error("no slug");

  const username = slug.replace("@", "");

  await ssg.profile.getUserByUsername.prefetch({ username });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default ProfilePage;
