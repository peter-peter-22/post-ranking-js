import { getCommentSection } from "../../api/posts/feed";
import { updatePostFeedOnSubmit } from "../../components/posts/onSubmit";
import PostCreator from "../../components/posts/PostCreator";
import PostCreatorContainer from "../../components/posts/PostCreatorContainer";
import PostFeed, { DefaultPostFeedListComponent, PostFeedProps } from "../../components/posts/PostFeed";
import { usePostFeed } from "../../components/posts/usePostFeed";
import RelevantPosts from "./RelevantPosts";

export default function CommentSectionPosts({ postId }: { postId: string }) {
    const queryKey = ["replies", postId]
    usePostFeed(queryKey, postId)
    return (
        <>
            <PostCreatorContainer >
                <PostCreator
                    replyingTo={postId}
                    onPublish={(post) => { updatePostFeedOnSubmit(post, queryKey) }}
                />
            </PostCreatorContainer>
            <PostFeed
                queryKey={queryKey}
                queryFn={async (offset?: number) => {
                    return await getCommentSection({
                        postId: postId,
                        offset: offset
                    })
                }}
                ListComponent={
                    (props: PostFeedProps) => {
                        return (
                            <div>
                                <DefaultPostFeedListComponent {...props} />
                                {!props.query.hasNextPage &&
                                    <RelevantPosts postId={postId} />
                                }
                            </div>
                        )
                    }
                }
            />
        </>
    )
}