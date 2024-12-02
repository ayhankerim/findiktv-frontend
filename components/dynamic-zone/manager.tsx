import React from 'react';
import dynamic from 'next/dynamic';

interface DynamicZoneComponent {
  __component: string;
  id: number;
  [key: string]: any;
}

interface Props {
  dynamicZone: DynamicZoneComponent[];
  locale: string;
}

const componentMapping: { [key: string]: any } = {
  'sections.hero': dynamic(() => import('./hero').then(mod => mod.Hero), { ssr: false }),
  'sections.rich-text': dynamic(() => import('./rich-text').then(mod => mod.RichText), { ssr: false }),
  'sections.features': dynamic(() => import('./features').then(mod => mod.Features), { ssr: false }),
  'sections.testimonials': dynamic(() => import('./testimonials').then(mod => mod.Testimonials), { ssr: false }),
  'sections.how-it-works': dynamic(() => import('./how-it-works').then(mod => mod.HowItWorks), { ssr: false }),
  'sections.brands': dynamic(() => import('./brands').then(mod => mod.Brands), { ssr: false }),
  'sections.pricing': dynamic(() => import('./pricing').then(mod => mod.Pricing), { ssr: false }),
  'sections.launches': dynamic(() => import('./launches').then(mod => mod.Launches), { ssr: false }),
  'sections.cta': dynamic(() => import('./cta').then(mod => mod.CTA), { ssr: false }),
  'sections.form-next-to-section': dynamic(() => import('./form-next-to-section').then(mod => mod.FormNextToSection), { ssr: false }),
  'sections.faq': dynamic(() => import('./faq').then(mod => mod.FAQ), { ssr: false }),
  'sections.related-products': dynamic(() => import('./related-products').then(mod => mod.RelatedProducts), { ssr: false }),
  'sections.related-articles': dynamic(() => import('./related-articles').then(mod => mod.RelatedArticles), { ssr: false })
}

const DynamicZoneManager: React.FC<Props> = ({ dynamicZone, locale }) => {
  return (
    <main>
      {
        dynamicZone.map((componentData) => {
          const Component = componentMapping[componentData.__component];
          if (!Component) {
            console.warn(`No component found for: ${componentData.__component}`);
            return null;
          }
          return <Component key={componentData.id} {...componentData} locale={locale} />;
        })}
    </main>
  );
};

export default DynamicZoneManager;
