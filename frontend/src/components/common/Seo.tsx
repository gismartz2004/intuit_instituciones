import { Helmet } from 'react-helmet-async';

interface SeoProps {
    title?: string;
    description?: string;
    keywords?: string;
    name?: string;
    type?: string;
    image?: string;
    canonical?: string;
}

export const Seo = ({
    title,
    description,
    keywords,
    name,
    type,
    image,
    canonical
}: SeoProps) => {
    const defaultTitle = 'Intuit Model Education - Ecosistema Educativo';
    const defaultDescription = 'Plataforma gamificada de aprendizaje tecnológico e innovación educativa con Intuit Model Education.';
    const defaultKeywords = 'Intuit Model Education, Intuit Model, Plataforma Educativa, aprendizaje tecnológico, innovación educativa';
    const siteUrl = 'https://intuitmodel.education';
    const currentCanonical = canonical || `${siteUrl}${window.location.pathname}`;

    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{title ? `${title} | Intuit Model` : defaultTitle}</title>
            <meta name='description' content={description || defaultDescription} />
            <meta name='keywords' content={keywords || defaultKeywords} />
            <link rel="canonical" href={currentCanonical} />

            {/* Facebook tags */}
            <meta property="og:type" content={type || 'website'} />
            <meta property="og:title" content={title ? `${title} | Intuit Model` : defaultTitle} />
            <meta property="og:description" content={description || defaultDescription} />
            <meta property="og:url" content={currentCanonical} />
            {image && <meta property="og:image" content={`${siteUrl}${image}`} />}
            {/* End Facebook tags */}

            {/* Twitter tags */}
            <meta name="twitter:creator" content={name || 'Intuit Model'} />
            <meta name="twitter:card" content={type || 'summary_large_image'} />
            <meta name="twitter:title" content={title ? `${title} | Intuit Model` : defaultTitle} />
            <meta name="twitter:description" content={description || defaultDescription} />
            {image && <meta name="twitter:image" content={`${siteUrl}${image}`} />}
            {/* End Twitter tags */}
        </Helmet>
    );
};
