import {useEffect, useOptimistic, useState, useTransition} from "react";

// Using dummyjson.com as an example
async function fetchPosts(skip) {
    const res = await fetch(
        `https://dummyjson.com/posts?limit=10&skip=${skip}`
    );

    if (!res.ok) throw new Error("Failed to load");

    return res.json();
}

export default function InfiniteFeed() {
    const [initialPosts, setInitialPosts] = useState([]);

    const [skip, setSkip] = useState(10);
    const [isPending, startTransition] = useTransition();

    const [posts, addOptimistic] = useOptimistic(
        initialPosts,
        (current, next) => [...current, ...next]
    );

    useEffect(() => {
        loadMore().then();
    }, []);

    async function loadMore() {
        const placeholders = Array.from({ length: 10 }, (_, i) => ({
            id: `loading-${skip + i}`,
            loading: true
        }));

        startTransition(async () => {
            addOptimistic(placeholders);

            try {
                const data = await fetchPosts(skip);

                setInitialPosts(prev => [...prev, ...data.posts]);
                // addOptimistic(data.posts);

                setSkip(skip + data.limit);
            } catch {
                addOptimistic(
                    placeholders.map(p => ({ ...p, error: true }))
                );
            }
        });

    }

    return (
        <>
            <div className="feed">
                {posts.map((p, i) => (
                    <Post key={`${p.id}+${i}`} post={p} />
                ))}
            </div>

            <button disabled={isPending} onClick={loadMore} className="load-more">
                {isPending ? "Loading…" : "Load more"}
            </button>
        </>
    );
}

function Post({ post }) {
    if (post.loading) {
        return (
            <div className="skeleton">
                <div className="skeleton-line short"></div>
                <div className="skeleton-line"></div>
                <div className="skeleton-line"></div>
            </div>
        );
    }

    if (post.error) {
        return <div className="error">Failed to load — retry</div>;
    }

    return (
        <div className="post">
            <h3>{post.title}</h3>
            <p>{post.body}</p>
        </div>
    );
}
