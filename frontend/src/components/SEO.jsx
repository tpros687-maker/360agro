import { Helmet } from "react-helmet-async";

const DEFAULT_IMG = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80";
const SITE_URL = "https://360agro.vercel.app";

export default function SEO({ title, description, image, url }) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image || DEFAULT_IMG} />
      <meta property="og:url" content={url || SITE_URL} />
    </Helmet>
  );
}
