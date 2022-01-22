import { useRouter } from 'next/router';
import Link from 'next/link';
import { GetStaticPaths, GetStaticProps } from 'next';

import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { getPrismicClient } from '../../services/prismic';
import { RichText } from 'prismic-dom';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Prismic from '@prismicio/client';
import Comments from '../../components/Comments';

import styles from './post.module.scss';
import Head from 'next/head';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        heading: string,
        text: string;
      }[];
    }[];
  };
}

interface NeighborhoodPost {
  title: string;
  uid: string;
}

interface PostProps {
  post: Post;
  readingTime: number | null;
  nextPost: NeighborhoodPost;
  previousPost: NeighborhoodPost;
}

export default function Post({ post, previousPost, nextPost }: PostProps) {
    const router = useRouter();

    if (router.isFallback) {
      return <div>Carregando...</div>
    }
    const totalWords = post.data.content.reduce((total, contentItem) => {
      let count = 0;
      count += contentItem.heading.split(' ').length;

      const wordsCounter = contentItem.body.map(
        item => item.text.split(' ').length
      );
      wordsCounter.map(words => (count += words));

      total += count;

      return total;
    }, 0);

    const readingTime = Math.ceil(totalWords / 200);

    return (
     <>
      <Head>
        <title>{post.data.title} | Space Traveling</title>
      </Head>

      {post.data.banner.url && (
        <section className={styles.banner}>
          <img src={post.data.banner.url} alt="Banner" />
        </section>
      )}

      <main className={styles.content}>
        <article className={styles.post}>
          <h1>{post.data.title}</h1>

          <div className={styles.postInfo}>
            <span>
              <FiCalendar size={20} color="#BBBBBB" />
              {format(
                parseISO(post.first_publication_date),
                "dd LLL yyyy",
                {
                  locale: ptBR,
                }
              )}
            </span>

            <span>
              <FiUser size={20} color="#BBBBBB" />
              {post.data.author}
            </span>

            <span className={styles.readingTime}>
              <FiClock size={20} color="#BBBBBB" />
              {readingTime} min
            </span>
          </div>

          <div className={styles.postContent}>
            {post.data.content.map(({ heading, body }) => (
              <div key={heading}>
                {heading && <h2>{heading}</h2>}

                <div
                  className={styles.postSection}
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{ __html: RichText.asHtml(body) }}
                />
              </div>
            ))}
          </div>
        </article>

        <footer className={styles.footer}>
        <div>
            {previousPost && (
              <>
                <p>{previousPost.title}</p>
                <Link href={`/post/${previousPost.uid}`}>
                  <a>Post anterior</a>
                </Link>
              </>
            )}
          </div>

          <div>
            {nextPost && (
              <>
                <p>{nextPost.title}</p>
                <Link href={`/post/${nextPost.uid}`}>
                  <a>Próximo post</a>
                </Link>
              </>
            )}
          </div>
        </footer>

        <Comments />
      </main>
     </>
   )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();

  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    { pageSize: 3 }
  );

  const paths = posts.results.map(result => {
    return {
      params: {
        slug: result.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

function verifyNeighborhoodPost(post, slug): NeighborhoodPost | null {
  return slug === post.results[0].uid
    ? null
    : {
      title: post.results[0]?.data?.title,
      uid: post.results[0]?.uid,
    };
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();

  const response = await prismic.getByUID('post', String(slug), {});

  const responsePreviousPost = await prismic.query(
    Prismic.Predicates.at('document.type', 'post'),
    {
      pageSize: 1,
      after: slug,
      orderings: '[document.first_publication_date desc]',
    }
  );

  const responseNextPost = await prismic.query(
    Prismic.Predicates.at('document.type', 'post'),
    { pageSize: 1, after: slug, orderings: '[document.first_publication_date]' }
  );

  const nextPost = verifyNeighborhoodPost(responseNextPost, slug);

  const previousPost = verifyNeighborhoodPost(responsePreviousPost, slug);

  const content = response.data.content.map(contentData => {
    return {
      heading: contentData.heading,
      body: [...contentData.body],
    };
  });

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: response.data.banner,
      author: response.data.author,
      content: content
    },
  }

  return {
    props: {
      post,
      nextPost,
      previousPost
    }
  }
};
