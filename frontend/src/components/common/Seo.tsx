import { Helmet } from 'react-helmet-async';

interface SeoProps {
    title?: string;
    description?: string;
    name?: string;
    type?: string;
    image?: string;
}

export const Seo = ({
    title,
    description,
    name,
    type,
    image
}: SeoProps) => {
    const defaultTitle = 'Plataforma Genios Bot - Ecosistema Educativo';
    const defaultDescription = 'Plataforma gamificada de aprendizaje tecnológico e innovación educativa con Genios Bot.';
    const siteUrl = window.location.origin;

    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{title ? `${title} | Genios Bot` : defaultTitle}</title>
            <meta name='description' content={description || defaultDescription} />

            {/* Facebook tags */}
            <meta property="og:type" content={type || 'website'} />
            <meta property="og:title" content={title ? `${title} | Genios Bot` : defaultTitle} />
            <meta property="og:description" content={description || defaultDescription} />
            {image && <meta property="og:image" content={`${siteUrl}${image}`} />}
            {/* End Facebook tags */}

            {/* Twitter tags */}
            <meta name="twitter:creator" content={name || 'Genios Bot'} />
            <meta name="twitter:card" content={type || 'summary'} />
            <meta name="twitter:title" content={title ? `${title} | Genios Bot` : defaultTitle} />
            <meta name="twitter:description" content={description || defaultDescription} />
            {image && <meta name="twitter:image" content={`${siteUrl}${image}`} />}
            {/* End Twitter tags */}
        </Helmet>
    );
};
