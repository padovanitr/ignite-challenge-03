import { GetStaticPaths, GetStaticProps } from 'next';

import { getPrismicClient } from '../../services/prismic';
import { RichText } from 'prismic-dom';
//import { Link, RichText } from 'prismic-reactjs'

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

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
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

const linkResolver = ({post}) => {
  // Pretty URLs for known types
  if (post.type === 'blog') return `/post/${post.uid}`
  if (post.type === 'page') return `/${post.uid}`
  // Fallback for other types, in case new custom types get created
  return `/post/${post.id}`
}

export default function Post({ post }) {
  console.log('post', post)
   // TODO
   return (
     <>

     </>
   )
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking'
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();

  const response = await prismic.getByUID('post', String(slug), {});

  console.log(response.data.content);

  const post = {
    slug,
    title: response.data['title'],
    author: response.data['author'],
    banner: response.data['banner'],
    updatedAt: new Date(response.last_publication_date).toLocaleString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    })
  }

  return {
    props: {
      post
    }
  }
};
