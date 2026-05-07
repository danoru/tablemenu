import Head from "next/head";

interface HeaderProps {
  title: string;
  description: string;
  image?: string;
  type?: "website" | "article" | "profile";
}

const SITE_NAME = "Tablekeeper";
const DEFAULT_IMAGE = "/images/og-card.png";

export default function Header({
  title,
  description,
  image = DEFAULT_IMAGE,
  type = "website",
}: HeaderProps) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={SITE_NAME} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Head>
  );
}
